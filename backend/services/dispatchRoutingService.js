// backend/services/dispatchRoutingService.js
const Facility = require("../models/Facility");

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Triage Priority Decision Tree:
 * Maps requested emergency aid items & severity to optimal facility category.
 */
function determineTargetFacilityCategory(aidList = [], severity = "serious") {
  const normalizedAid = (aidList || []).map(a => a.toLowerCase()).join(" ");
  const sev = (severity || "serious").toLowerCase();

  // 1. Priority 1: Physical Extrication / Water Rescue
  if (
    normalizedAid.includes("boat") ||
    normalizedAid.includes("raft") ||
    normalizedAid.includes("earthmover") ||
    normalizedAid.includes("debris") ||
    normalizedAid.includes("rope") ||
    normalizedAid.includes("dog")
  ) {
    return {
      category: "Rescue Unit",
      priorityLevel: 1,
      justification: "Physical extrication / water rescue prioritized. Victims stranded in flood or debris require motorized rescue boats or heavy gear before medical transport is viable."
    };
  }

  // 2. Priority 2: Life-Threatening Medical Trauma / Critical Condition
  if (
    sev === "critical" ||
    normalizedAid.includes("oxygen") ||
    normalizedAid.includes("iv fluid") ||
    normalizedAid.includes("stabilization") ||
    normalizedAid.includes("hospital")
  ) {
    return {
      category: "Hospital",
      priorityLevel: 2,
      justification: "Critical / life-threatening injury requires direct ambulance transport to nearest Level-1 trauma ICU and surgical wing."
    };
  }

  // 3. Priority 3: Localized First-Aid & Paramedic Triage
  if (
    normalizedAid.includes("medical kit") ||
    normalizedAid.includes("first-aid") ||
    normalizedAid.includes("first aid") ||
    normalizedAid.includes("splint") ||
    normalizedAid.includes("dressing") ||
    normalizedAid.includes("antibiotic")
  ) {
    return {
      category: "Medic Post",
      priorityLevel: 3,
      justification: "Minor injury / first-aid dressing required. Routing to nearest Urban Health Clinic or Mobile Medic Post prevents hospital crowding."
    };
  }

  // 4. Priority 4: Survival Supplies (Potable Water, Food Rations)
  if (
    normalizedAid.includes("water") ||
    normalizedAid.includes("ration") ||
    normalizedAid.includes("food") ||
    normalizedAid.includes("chlorine") ||
    normalizedAid.includes("blanket")
  ) {
    return {
      category: "Relief Depot",
      priorityLevel: 4,
      justification: "Sustenance & disease prevention supplies (clean drinking water, food packs) prioritized from civil supply logistics depot."
    };
  }

  // 5. Default Priority 5: Shelter & Refuge
  return {
    category: "Relocation Center",
    priorityLevel: 5,
    justification: "Community displacement / temporary shelter refuge designated."
  };
}

/**
 * Calculates optimal dispatch plan from nearest specialized facility to victim
 */
async function calculateDispatchRoute(sosRecord, overrideCategory = null) {
  const aidList = sosRecord.aidList || [];
  const severity = sosRecord.severity || "serious";
  const victimCoords = sosRecord.coords;

  const decision = determineTargetFacilityCategory(aidList, severity);
  const targetCategory = overrideCategory || decision.category;

  // Find facilities matching the designated category
  let candidateFacilities = await Facility.find({ category: targetCategory });

  // Fallback: If no facility in targetCategory is seeded nearby, search all facilities
  if (candidateFacilities.length === 0) {
    candidateFacilities = await Facility.find();
  }

  if (candidateFacilities.length === 0) {
    throw new Error("No emergency facilities found in database to dispatch from.");
  }

  // Find nearest facility of that category
  let nearestFacility = null;
  let minDistance = Infinity;

  candidateFacilities.forEach(f => {
    if (f.coords && f.coords.length === 2) {
      const d = haversineKm(victimCoords[0], victimCoords[1], f.coords[0], f.coords[1]);
      if (d < minDistance) {
        minDistance = d;
        nearestFacility = f;
      }
    }
  });

  const distKm = +minDistance.toFixed(2);
  // Average disaster response transit speed: ~30 km/h
  const estimatedArrivalMinutes = Math.max(3, Math.round((distKm / 30) * 60));

  // Build route polyline waypoints for GIS map rendering
  const origin = nearestFacility.coords;
  const destination = victimCoords;
  const midPoint = [
    +((origin[0] + destination[0]) / 2).toFixed(4),
    +((origin[1] + destination[1]) / 2).toFixed(4)
  ];

  return {
    targetCategory,
    priorityLevel: decision.priorityLevel,
    priorityJustification: decision.justification,
    facility: {
      id: nearestFacility._id,
      name: nearestFacility.name,
      category: nearestFacility.category,
      coords: nearestFacility.coords,
      contact: nearestFacility.contact || "108 / 1077",
      capacity: nearestFacility.capacity || "Operational",
      medicalSupport: nearestFacility.medicalSupport || "Disaster Response Unit",
      distanceKm: distKm,
      estimatedArrivalMinutes
    },
    route: {
      origin,
      destination,
      waypoints: [origin, midPoint, destination]
    }
  };
}

module.exports = {
  determineTargetFacilityCategory,
  calculateDispatchRoute,
  haversineKm
};
