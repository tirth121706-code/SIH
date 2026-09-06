/**
 * importRealFacilities.js
 * -------------------------------------------------------------
 * Pulls REAL hospitals, clinics, and community shelters from
 * OpenStreetMap (via the free Overpass API) for each habitation
 * in your database, and saves them into the Facility collection.
 *
 * Why: your seeded facilities were 1-per-city placeholders. This
 * replaces/adds to them with actual real-world facility data near
 * each habitation, which is far more convincing for a disaster
 * management pitch ("we use live OSM facility data") than a
 * hand-picked list.
 *
 * Usage:
 *   node scripts/importRealFacilities.js
 *
 * What it does for EACH habitation in your DB:
 *   1. Reads its coordinates
 *   2. Queries Overpass API for real hospitals/clinics within
 *      RADIUS_METERS of that point
 *   3. Saves each result into the Facility collection (skips
 *      duplicates by name+coords so re-running is safe)
 *
 * NOTE on shelters: OpenStreetMap does not consistently tag
 * "disaster relocation shelters" the way it tags hospitals, so
 * this script pulls community_centre / social_facility tags as a
 * best-effort proxy for shelters. You may still want to manually
 * add known government relief shelters for your specific regions
 * if OSM coverage is thin there -- this script won't invent fake
 * ones to fill the gap.
 */

require("dotenv").config();
const https = require("https");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Habitation = require("../models/Habitation");
const Facility = require("../models/Facility");

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const RADIUS_METERS = 8000; // 8km search radius around each habitation
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
  // Hospitals + clinics, plus a best-effort shelter proxy (community centres)
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
  return "Medic Post"; // fallback
}

function extractFacility(element) {
  const tags = element.tags || {};
  const name = tags.name || tags["name:en"];
  if (!name) return null; // skip unnamed OSM entries -- not useful for the UI

  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  if (lat == null || lng == null) return null;

  return {
    name,
    category: classifyCategory(tags),
    coords: [lat, lng], // [lat, lng] to match your frontend's Leaflet convention
    capacity: tags.beds ? `${tags.beds} beds` : "Unknown",
    medicalSupport: tags.healthcare_speciality || tags.emergency || "General care",
    contact: tags.phone || tags["contact:phone"] || "N/A",
    doctorCount: 0, // OSM doesn't track this -- left for manual enrichment if needed
    bedsAvailable: 0, // OSM doesn't track live bed availability
  };
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  await connectDB();

  const habitations = await Habitation.find();
  console.log(`Found ${habitations.length} habitations in DB.`);

  let totalInserted = 0;
  let totalSkippedDuplicate = 0;

  for (const hab of habitations) {
    const coords = HABITATION_COORDS[hab.name];
    if (!coords) {
      console.log(`⚠️  No coordinates mapped for "${hab.name}" -- skipping. Add it to HABITATION_COORDS in this script.`);
      continue;
    }

    const [lat, lng] = coords;
    console.log(`\n🔎 Querying OpenStreetMap near ${hab.name} (${lat}, ${lng})...`);

    try {
      const query = buildQuery(lat, lng, RADIUS_METERS);
      const data = await fetchOverpass(query);
      const elements = data.elements || [];
      console.log(`   Found ${elements.length} raw OSM elements.`);

      let insertedForThisHab = 0;
      for (const el of elements) {
        const facility = extractFacility(el);
        if (!facility) continue;

        // Avoid duplicate inserts on re-run: match by name + rounded coords
        const exists = await Facility.findOne({
          name: facility.name,
          "coords.0": { $gte: facility.coords[0] - 0.001, $lte: facility.coords[0] + 0.001 },
        });

        if (exists) {
          totalSkippedDuplicate++;
          continue;
        }

        await Facility.create(facility);
        insertedForThisHab++;
        totalInserted++;
      }
      console.log(`   ✅ Inserted ${insertedForThisHab} new facilities for ${hab.name}.`);
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
