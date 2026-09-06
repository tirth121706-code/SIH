/**
 * importRealFacilities.js
 * -------------------------------------------------------------
 * Pulls REAL hospitals, clinics, and community shelters from
 * OpenStreetMap (via the free Overpass API) for each habitation
 * in your database, and saves them into the Facility collection --
 * keeping only the BIGGEST / most capable / best-documented ones
 * per category, not just whatever is closest.
 *
 * Why: your seeded facilities were 1-per-city placeholders, and an
 * earlier version of this script imported EVERY nearby facility
 * (700+), which looked cluttered and unrealistic on the map. This
 * version ranks facilities by a "quality/capacity score" -- bed
 * count, emergency department presence, government/district
 * hospital naming, documentation completeness -- and keeps only
 * the top MAX_PER_CATEGORY per habitation. This models a real
 * disaster-response system, which would prioritize routing
 * patients to well-equipped facilities, not just the nearest pin.
 *
 * Usage:
 *   node scripts/importRealFacilities.js
 *
 * What it does for EACH habitation in your DB:
 *   1. Reads its coordinates
 *   2. Queries Overpass API for real hospitals/clinics/shelter
 *      candidates within RADIUS_METERS of that point
 *   3. Scores each result on size/capability (see computeQualityScore)
 *   4. Keeps only the top MAX_PER_CATEGORY per category, saved into
 *      the Facility collection (skips duplicates so re-running is safe)
 *
 * NOTE on shelters: OpenStreetMap does not consistently tag
 * "disaster relocation shelters" the way it tags hospitals. This
 * script uses community_centre / social_facility / school tags as
 * a best-effort proxy (schools are commonly used as real shelters
 * in India during floods/cyclones). If OSM coverage is thin in a
 * region, you may still want to manually add known government
 * relief shelters -- this script won't invent fake ones to fill
 * the gap.
 */

require("dotenv").config();
const https = require("https");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Habitation = require("../models/Habitation");
const Facility = require("../models/Facility");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_METERS = 10000; // wider net (10km) since we now filter by QUALITY, not just proximity
const MAX_PER_CATEGORY = 5; // keep only the top 5 best-rated per category per habitation
const REQUEST_DELAY_MS = 2000; // be polite to the free public Overpass server

// Habitation coordinates -- since Gemini's Habitation schema doesn't store
// lat/lng, map each habitation name to real-world coordinates here.
// Add/edit entries here if your habitation names or locations differ.
const HABITATION_COORDS = {
  "Kotla Basti": [25.3176, 82.9739], // Varanasi, UP
  "Chandpur Colony": [25.5941, 85.1376], // Patna, Bihar
  "Rampur Nagar": [30.3165, 78.0322], // Dehradun, Uttarakhand
  "Gopalpur": [19.2600, 84.9000], // Ganjam, Odisha
  "Sundarban Ghat": [21.9497, 88.9007], // South 24 Parganas, WB
  "Vasant Vihar": [17.6868, 83.2185], // Visakhapatnam, AP
};

// Per-habitation radius override (in meters). Sundarban Ghat sits right at
// the edge of the Sundarban Tiger Reserve / mangrove forest -- a genuinely
// remote, sparsely-mapped area -- so the default 10km radius returns zero
// real facilities there. Widen it specifically for this habitation rather
// than inflating the radius (and re-introducing clutter) everywhere else.
const RADIUS_OVERRIDES = {
  "Sundarban Ghat": 40000, // 40km -- reaches into Canning/Gosaba where real facilities exist
};

function getRadiusFor(habitationName) {
  return RADIUS_OVERRIDES[habitationName] || RADIUS_METERS;
}

function fetchOverpass(query) {
  return new Promise((resolve, reject) => {
    const postData = "data=" + encodeURIComponent(query);
    const req = https.request(
      OVERPASS_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(postData),
          "Accept": "*/*",
          "User-Agent": "ABHAYA-SIH26191-Import-Script/1.0",
        },
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`Overpass returned HTTP ${res.statusCode}: ${body.slice(0, 200)}`));
            return;
          }
          try {
            resolve(JSON.parse(body));
          } catch (err) {
            reject(new Error("Failed to parse Overpass response: " + body.slice(0, 200)));
          }
        });
      }
    );
    req.on("error", reject);
    req.write(postData);
    req.end();
  });
}

function buildQuery(lat, lng, radius) {
  // Hospitals + clinics + shelter candidates (community centres, social
  // facilities, and schools -- schools are commonly used as real disaster
  // relief shelters in India, so they're a reasonable size-proxy for shelters).
  return `
    [out:json][timeout:60];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
      node["healthcare"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="community_centre"](around:${radius},${lat},${lng});
      way["amenity"="community_centre"](around:${radius},${lat},${lng});
      node["amenity"="social_facility"](around:${radius},${lat},${lng});
      way["amenity"="school"](around:${radius},${lat},${lng});
    );
    out center tags;
  `;
}

function classifyCategory(tags) {
  if (tags.amenity === "hospital") return "Hospital";
  if (tags.amenity === "clinic" || tags.healthcare === "clinic") return "Medic Post";
  if (tags.amenity === "community_centre" || tags.amenity === "social_facility") {
    return "Relocation Center";
  }
  if (tags.amenity === "school" || tags.building === "school") return "Relocation Center";
  return "Medic Post"; // fallback
}

/**
 * "Quality score" -- OSM has no star ratings, so we use how well-mapped
 * and how large a facility appears to be as a proxy for how much we'd
 * trust it to handle a real emergency caseload. Higher = better.
 *
 * This is a defensible, explainable heuristic (same philosophy as your
 * habitation vulnerability scoring) -- not a random guess. Reasoning
 * per category is documented inline below.
 */
function computeQualityScore(tags, category) {
  let score = 0;

  if (category === "Hospital") {
    // Bed count is the single best available signal of hospital SIZE/CAPACITY.
    const beds = parseInt(tags.beds, 10);
    if (!isNaN(beds)) score += Math.min(beds, 500) / 10; // up to +50 points for 500+ beds

    // Emergency department present = can actually handle disaster casualties.
    if (tags.emergency === "yes") score += 20;

    // Multi-department / speciality hospitals tend to be bigger, more capable.
    if (tags.healthcare_speciality) score += 10;

    // Government hospitals (district/general) are typically larger than small
    // private clinics mistagged as "hospital" -- common in OSM India data.
    if (/district|general|government|govt|medical college/i.test(tags.name || "")) score += 15;

    // Well-documented listings (phone, hours, operator) correlate with
    // established, actively-maintained real institutions rather than a
    // one-off unverified pin -- our proxy for "trustworthy/rated" in the
    // absence of an actual rating system on OSM.
    if (tags.phone || tags["contact:phone"]) score += 5;
    if (tags.opening_hours) score += 5;
    if (tags.operator) score += 5;
  }

  if (category === "Medic Post") {
    // Clinics are inherently small -- so here quality = how well-documented
    // and how "operated/official" the listing looks, not size.
    if (tags.phone || tags["contact:phone"]) score += 10;
    if (tags.opening_hours) score += 10;
    if (tags.operator) score += 10;
    if (tags.healthcare_speciality) score += 5;
    if (/phc|primary health|government|govt/i.test(tags.name || "")) score += 10;
  }

  if (category === "Relocation Center") {
    // For shelters, bigger buildings (schools, community halls) can hold
    // more evacuees. Government schools are the most common real-world
    // flood/cyclone shelters used in India.
    if (/school|college|community hall|panchayat|government|govt/i.test(tags.name || "")) score += 20;
    if (tags.building === "yes" || tags.building === "school" || tags.building === "civic") score += 10;
    if (tags.phone || tags["contact:phone"]) score += 5;
  }

  return score;
}

function extractFacility(element) {
  const tags = element.tags || {};
  const name = tags.name || tags["name:en"];
  if (!name) return null; // skip unnamed OSM entries -- not useful for the UI

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;

  const category = classifyCategory(tags);
  const qualityScore = computeQualityScore(tags, category);

  return {
    name,
    category,
    coords: [lat, lng], // [lat, lng] to match your frontend's Leaflet convention
    capacity: tags.beds ? `${tags.beds} beds` : "Unknown",
    medicalSupport: tags.healthcare_speciality || tags.emergency || "General care",
    contact: tags.phone || tags["contact:phone"] || "N/A",
    doctorCount: 0, // OSM doesn't track this -- left for manual enrichment if needed
    bedsAvailable: 0, // OSM doesn't track live bed availability
    _qualityScore: qualityScore, // internal use only -- stripped before insert
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function run() {
  await connectDB();

  const habitations = await Habitation.find();
  console.log(`Found ${habitations.length} habitations in DB.`);

  const existingCount = await Facility.countDocuments();
  if (existingCount > 0) {
    console.log(`\n⚠️  You already have ${existingCount} facilities in the DB from a previous run.`);
    console.log(`   This script only ADDS new ones and won't remove the excess automatically.`);
    console.log(`   If your map is overcrowded, clear the collection first by running:`);
    console.log(`   node -e "require('dotenv').config(); require('./config/db')().then(async()=>{await require('./models/Facility').deleteMany({}); console.log('Cleared.'); process.exit();})"\n`);
  }

  let totalInserted = 0;
  let totalSkippedDuplicate = 0;

  for (const hab of habitations) {
    const coords = HABITATION_COORDS[hab.name];
    if (!coords) {
      console.log(`⚠️  No coordinates mapped for "${hab.name}" -- skipping. Add it to HABITATION_COORDS in this script.`);
      continue;
    }

    const [lat, lng] = coords;
    const effectiveRadius = getRadiusFor(hab.name);
    console.log(`\n🔎 Querying OpenStreetMap near ${hab.name} (${lat}, ${lng}), radius ${effectiveRadius / 1000}km...`);

    try {
      const query = buildQuery(lat, lng, effectiveRadius);
      const data = await fetchOverpass(query);
      const elements = data.elements || [];
      console.log(`   Found ${elements.length} raw OSM elements.`);

      // Extract, then rank by QUALITY (size/capability proxy) first and
      // distance second as a tiebreaker -- we want the biggest/most capable
      // facilities nearby, not just the nearest ones regardless of size.
      const extracted = elements
        .map(extractFacility)
        .filter(Boolean)
        .map((f) => ({ ...f, _distanceKm: distanceKm(lat, lng, f.coords[0], f.coords[1]) }))
        .sort((a, b) => {
          if (b._qualityScore !== a._qualityScore) return b._qualityScore - a._qualityScore;
          return a._distanceKm - b._distanceKm;
        });

      const countByCategory = {};
      let insertedForThisHab = 0;

      for (const facility of extracted) {
        const cat = facility.category;
        countByCategory[cat] = countByCategory[cat] || 0;
        if (countByCategory[cat] >= MAX_PER_CATEGORY) continue; // cap reached for this category

        const exists = await Facility.findOne({
          name: facility.name,
          "coords.0": { $gte: facility.coords[0] - 0.001, $lte: facility.coords[0] + 0.001 },
        });

        if (exists) {
          totalSkippedDuplicate++;
          countByCategory[cat]++; // still counts toward the cap even if skipped as duplicate
          continue;
        }

        const { _distanceKm, _qualityScore, ...toInsert } = facility;
        await Facility.create(toInsert);
        countByCategory[cat]++;
        insertedForThisHab++;
        totalInserted++;
      }
      console.log(`   ✅ Inserted ${insertedForThisHab} new facilities for ${hab.name} (top ${MAX_PER_CATEGORY}/category by quality).`);
    } catch (err) {
      console.error(`   ❌ Failed to fetch facilities for ${hab.name}:`, err.message);
    }

    // Respect the free public Overpass server -- don't hammer it
    await sleep(REQUEST_DELAY_MS);
  }

  console.log(`\n✅ Done. Inserted ${totalInserted} new facilities total (${totalSkippedDuplicate} duplicates skipped).`);
  await mongoose.connection.close();
}

run().catch((err) => {
  console.error("❌ Import failed:", err);
  process.exit(1);
});