require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Habitation = require("../models/Habitation");
const Facility = require("../models/Facility");
const { computeRiskScore } = require("../services/riskScoringService");
const { estimateResourceNeeds } = require("../services/resourceEstimationService");

const HABITATIONS = [
  {
    name: "Kotla Basti",
    district: "Riverside",
    coords: [25.3176, 82.9739],
    hazardType: "Flood",
    population: 4120,
    households: 812,
    hazardDistance: "0.4 km",
    carryingCapacityStatus: "Exceeded",
    vulnerabilityScore: 94,
    riskLevel: "Critical",
    scoreBreakdown: {
      hazardExposure: { raw: 9.6, weight: 0.35, weightedScore: 3.36 },
      populationPressure: { raw: 9.1, weight: 0.25, weightedScore: 2.28 },
      infrastructureGap: { raw: 8.8, weight: 0.20, weightedScore: 1.76 },
      carryingCapacityGap: { raw: 9.9, weight: 0.20, weightedScore: 1.98, safeCapacity: 2800, excessPopulation: 1320 }
    }
  },
  {
    name: "Chandpur Colony",
    district: "Riverside",
    coords: [25.5941, 85.1376],
    hazardType: "River Erosion",
    population: 3860,
    households: 765,
    hazardDistance: "0.2 km",
    carryingCapacityStatus: "Exceeded",
    vulnerabilityScore: 91,
    riskLevel: "Critical",
    scoreBreakdown: {
      hazardExposure: { raw: 9.8, weight: 0.35, weightedScore: 3.43 },
      populationPressure: { raw: 8.7, weight: 0.25, weightedScore: 2.18 },
      infrastructureGap: { raw: 8.5, weight: 0.20, weightedScore: 1.70 },
      carryingCapacityGap: { raw: 8.9, weight: 0.20, weightedScore: 1.78, safeCapacity: 2600, excessPopulation: 1260 }
    }
  },
  {
    name: "Rampur Nagar",
    district: "Hillside",
    coords: [30.3165, 78.0322],
    hazardType: "Landslide",
    population: 2910,
    households: 540,
    hazardDistance: "0.6 km",
    carryingCapacityStatus: "Near limit",
    vulnerabilityScore: 86,
    riskLevel: "High",
    scoreBreakdown: {
      hazardExposure: { raw: 9.0, weight: 0.35, weightedScore: 3.15 },
      populationPressure: { raw: 7.8, weight: 0.25, weightedScore: 1.95 },
      infrastructureGap: { raw: 9.2, weight: 0.20, weightedScore: 1.84 },
      carryingCapacityGap: { raw: 8.3, weight: 0.20, weightedScore: 1.66, safeCapacity: 2400, excessPopulation: 510 }
    }
  },
  {
    name: "Gopalpur",
    district: "Coastal",
    coords: [19.2600, 84.9000],
    hazardType: "Cyclone",
    population: 5430,
    households: 1120,
    hazardDistance: "1.1 km",
    carryingCapacityStatus: "Near limit",
    vulnerabilityScore: 79,
    riskLevel: "High",
    scoreBreakdown: {
      hazardExposure: { raw: 8.2, weight: 0.35, weightedScore: 2.87 },
      populationPressure: { raw: 9.3, weight: 0.25, weightedScore: 2.33 },
      infrastructureGap: { raw: 7.1, weight: 0.20, weightedScore: 1.42 },
      carryingCapacityGap: { raw: 6.4, weight: 0.20, weightedScore: 1.28, safeCapacity: 4800, excessPopulation: 630 }
    }
  },
  {
    name: "Sundarban Ghat",
    district: "Riverside",
    coords: [21.9497, 88.9007],
    hazardType: "Flood",
    population: 1780,
    households: 349,
    hazardDistance: "1.8 km",
    carryingCapacityStatus: "Within limit",
    vulnerabilityScore: 68,
    riskLevel: "Moderate",
    scoreBreakdown: {
      hazardExposure: { raw: 7.2, weight: 0.35, weightedScore: 2.52 },
      populationPressure: { raw: 5.8, weight: 0.25, weightedScore: 1.45 },
      infrastructureGap: { raw: 8.4, weight: 0.20, weightedScore: 1.68 },
      carryingCapacityGap: { raw: 5.7, weight: 0.20, weightedScore: 1.14, safeCapacity: 2000, excessPopulation: 0 }
    }
  },
  {
    name: "Vasant Vihar",
    district: "Coastal",
    coords: [17.6868, 83.2185],
    hazardType: "Cyclone",
    population: 960,
    households: 201,
    hazardDistance: "3.2 km",
    carryingCapacityStatus: "Within limit",
    vulnerabilityScore: 31,
    riskLevel: "Low",
    scoreBreakdown: {
      hazardExposure: { raw: 3.5, weight: 0.35, weightedScore: 1.23 },
      populationPressure: { raw: 2.8, weight: 0.25, weightedScore: 0.70 },
      infrastructureGap: { raw: 3.2, weight: 0.20, weightedScore: 0.64 },
      carryingCapacityGap: { raw: 2.6, weight: 0.20, weightedScore: 0.52, safeCapacity: 1500, excessPopulation: 0 }
    }
  },
  {
    name: "Kathmandu Valley",
    district: "Bagmati Basin, Nepal",
    coords: [27.6850, 85.3150],
    hazardType: "Flood",
    population: 4850,
    households: 970,
    hazardDistance: "0.3 km",
    carryingCapacityStatus: "Exceeded",
    vulnerabilityScore: 95,
    riskLevel: "Critical",
    scoreBreakdown: {
      hazardExposure: { raw: 9.8, weight: 0.35, weightedScore: 3.43 },
      populationPressure: { raw: 9.4, weight: 0.25, weightedScore: 2.35 },
      infrastructureGap: { raw: 8.9, weight: 0.20, weightedScore: 1.78 },
      carryingCapacityGap: { raw: 9.7, weight: 0.20, weightedScore: 1.94, safeCapacity: 2800, excessPopulation: 2050 }
    }
  },
  {
    name: "Chooralmala (Wayanad)",
    district: "Wayanad, Kerala",
    coords: [11.5450, 76.1550],
    hazardType: "Landslide",
    population: 3450,
    households: 710,
    hazardDistance: "0.2 km",
    carryingCapacityStatus: "Exceeded",
    vulnerabilityScore: 97,
    riskLevel: "Critical",
    scoreBreakdown: {
      hazardExposure: { raw: 9.9, weight: 0.35, weightedScore: 3.47 },
      populationPressure: { raw: 8.6, weight: 0.25, weightedScore: 2.15 },
      infrastructureGap: { raw: 9.5, weight: 0.20, weightedScore: 1.90 },
      carryingCapacityGap: { raw: 9.9, weight: 0.20, weightedScore: 1.98, safeCapacity: 1800, excessPopulation: 1650 }
    }
  }
];

const FACILITIES = [
  // --- 1. KOTLA BASTI [25.3176, 82.9739] (Varanasi, UP) ---
  { name: "Chowk Urban Primary Health Centre", category: "Medic Post", coords: [25.3140, 82.9780], capacity: "200 patients/day", medicalSupport: "First-Aid & Epidemic Prevention", contact: "102", doctorCount: 6, bedsAvailable: 25 },
  { name: "Sigra Red Cross Emergency Post", category: "Medic Post", coords: [25.3130, 82.9670], capacity: "180 patients/day", medicalSupport: "Trauma Stabilization & Bandaging", contact: "102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Lahurabir Mobile First-Aid Post", category: "Medic Post", coords: [25.3210, 82.9790], capacity: "150 patients/day", medicalSupport: "ORS, Oxygen & Wound Care", contact: "102", doctorCount: 4, bedsAvailable: 15 },
  { name: "Varanasi District Flood Relief Shelter", category: "Relocation Center", coords: [25.3220, 82.9810], capacity: "3,000 evacuees", medicalSupport: "Community Kitchen & Relief Camp", contact: "1077", doctorCount: 5, bedsAvailable: 600 },
  { name: "Sampurnanand Stadium Evacuation Camp", category: "Relocation Center", coords: [25.3195, 82.9660], capacity: "2,500 evacuees", medicalSupport: "High-Ground Tents & Relief Supplies", contact: "1077", doctorCount: 4, bedsAvailable: 450 },
  { name: "Pandit Deendayal Upadhyay Govt Hospital", category: "Hospital", coords: [25.3280, 82.9680], capacity: "650 beds", medicalSupport: "Emergency Casualty & Surgery Wing", contact: "108 / 0542-2508101", doctorCount: 40, bedsAvailable: 65 },
  { name: "Sir Sunderlal Hospital (BHU)", category: "Hospital", coords: [25.3050, 82.9870], capacity: "1,500 beds", medicalSupport: "Level-1 Trauma & Critical Care Unit", contact: "108 / 0542-2307500", doctorCount: 75, bedsAvailable: 110 },

  // --- 2. CHANDPUR COLONY [25.5941, 85.1376] (Patna, Bihar) ---
  { name: "Rajendra Nagar Urban Health Clinic", category: "Medic Post", coords: [25.5970, 85.1410], capacity: "180 patients/day", medicalSupport: "ORS, Triage & First-Aid", contact: "102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Kankarbagh Sector-3 Emergency Clinic", category: "Medic Post", coords: [25.5910, 85.1420], capacity: "220 patients/day", medicalSupport: "Waterborne Triage & Injections", contact: "102", doctorCount: 6, bedsAvailable: 25 },
  { name: "Mithapur First-Aid Station", category: "Medic Post", coords: [25.5960, 85.1320], capacity: "160 patients/day", medicalSupport: "Emergency Dressing & IV Fluids", contact: "102", doctorCount: 4, bedsAvailable: 18 },
  { name: "Patna State Evacuation Complex (Kankarbagh)", category: "Relocation Center", coords: [25.6010, 85.1450], capacity: "4,500 evacuees", medicalSupport: "SDRF Relief Unit & Clean Water Station", contact: "1070", doctorCount: 8, bedsAvailable: 800 },
  { name: "Mithapur Community Relief Shelter", category: "Relocation Center", coords: [25.5900, 85.1330], capacity: "2,800 evacuees", medicalSupport: "Disaster Refuge & Community Kitchen", contact: "1077", doctorCount: 5, bedsAvailable: 500 },
  { name: "Nalanda Medical College & Hospital (NMCH)", category: "Hospital", coords: [25.5920, 85.1550], capacity: "900 beds", medicalSupport: "Flood Casualty & Trauma ICU", contact: "108 / 0612-2354500", doctorCount: 55, bedsAvailable: 90 },
  { name: "PMCH Emergency Wing (Patna Medical College)", category: "Hospital", coords: [25.6080, 85.1540], capacity: "2,000 beds", medicalSupport: "Flood Inundation Trauma & Surgery", contact: "108 / 0612-2300080", doctorCount: 90, bedsAvailable: 140 },

  // --- 3. RAMPUR NAGAR [30.3165, 78.0322] (Dehradun, Uttarakhand) ---
  { name: "Karanpur Mountain Emergency Clinic", category: "Medic Post", coords: [30.3180, 78.0350], capacity: "150 patients/day", medicalSupport: "Hypothermia & Fracture Stabilization", contact: "102", doctorCount: 4, bedsAvailable: 15 },
  { name: "Dalanwala First-Aid Triage Station", category: "Medic Post", coords: [30.3130, 78.0380], capacity: "180 patients/day", medicalSupport: "Splints, Burns & Debris Triage", contact: "102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Bindal Bridge Rapid Medic Unit", category: "Medic Post", coords: [30.3200, 78.0260], capacity: "130 patients/day", medicalSupport: "Flash-Flood First Response", contact: "102", doctorCount: 4, bedsAvailable: 14 },
  { name: "State Landslide Evacuation Center (Rajpur Rd)", category: "Relocation Center", coords: [30.3190, 78.0370], capacity: "2,000 evacuees", medicalSupport: "NDRF Base, Emergency Bedding & Heating", contact: "1070", doctorCount: 7, bedsAvailable: 350 },
  { name: "Parade Ground Emergency Shelter", category: "Relocation Center", coords: [30.3220, 78.0310], capacity: "3,000 evacuees", medicalSupport: "Large-Capacity Relief Dome & Kitchen", contact: "1077", doctorCount: 6, bedsAvailable: 600 },
  { name: "Coronation District Hospital", category: "Hospital", coords: [30.3110, 78.0450], capacity: "450 beds", medicalSupport: "Emergency Debris Trauma Care", contact: "108 / 0135-2656100", doctorCount: 35, bedsAvailable: 50 },
  { name: "Doon Govt Medical College & Hospital", category: "Hospital", coords: [30.3260, 78.0440], capacity: "800 beds", medicalSupport: "Mountain Debris Trauma & Orthopedic Care", contact: "108 / 0135-2726020", doctorCount: 45, bedsAvailable: 70 },

  // --- 4. GOPALPUR [19.2600, 84.9000] (Ganjam, Odisha) ---
  { name: "Gopalpur Port Primary Health Centre", category: "Medic Post", coords: [19.2620, 84.9010], capacity: "120 patients/day", medicalSupport: "Coastal Emergency Triage", contact: "102", doctorCount: 4, bedsAvailable: 18 },
  { name: "Haripur Coastal Health Clinic", category: "Medic Post", coords: [19.2560, 84.8960], capacity: "140 patients/day", medicalSupport: "Emergency IV Fluids & Shock Treatment", contact: "102", doctorCount: 4, bedsAvailable: 16 },
  { name: "Arjipalli Fishermen Medic Outpost", category: "Medic Post", coords: [19.2670, 84.8970], capacity: "110 patients/day", medicalSupport: "Drowning Rescue & Oxygen Post", contact: "102", doctorCount: 3, bedsAvailable: 12 },
  { name: "Gopalpur Multi-Purpose Cyclone Shelter", category: "Relocation Center", coords: [19.2630, 84.9020], capacity: "4,000 evacuees", medicalSupport: "Reinforced Cyclone Bunker & Water Tanks", contact: "1077", doctorCount: 6, bedsAvailable: 700 },
  { name: "Coastal Evacuation & Relief Camp", category: "Relocation Center", coords: [19.2580, 84.9050], capacity: "2,200 evacuees", medicalSupport: "High-Elevation Disaster Refuge", contact: "1077", doctorCount: 5, bedsAvailable: 400 },
  { name: "City Hospital Berhampur (Emergency Block)", category: "Hospital", coords: [19.2740, 84.8850], capacity: "500 beds", medicalSupport: "Disaster Inundation Casualty Ward", contact: "108 / 0680-2223100", doctorCount: 38, bedsAvailable: 60 },
  { name: "MKCG Govt Medical College (Berhampur)", category: "Hospital", coords: [19.2800, 84.8780], capacity: "1,100 beds", medicalSupport: "Coastal Trauma, Critical Care & Surgery", contact: "108 / 0680-2292746", doctorCount: 55, bedsAvailable: 95 },

  // --- 5. SUNDARBAN GHAT [21.9497, 88.9007] (South 24 Parganas, WB) ---
  { name: "Basanti Block Primary Health Centre", category: "Medic Post", coords: [21.9520, 88.9030], capacity: "150 patients/day", medicalSupport: "Triage & Rapid Antivenom Administration", contact: "102", doctorCount: 6, bedsAvailable: 24 },
  { name: "Sonakhali Riverside Medic Post", category: "Medic Post", coords: [21.9450, 88.8980], capacity: "130 patients/day", medicalSupport: "Water-Rescue Paramedic Team", contact: "102", doctorCount: 4, bedsAvailable: 18 },
  { name: "Gosaba Jetty Paramedic Outpost", category: "Medic Post", coords: [21.9540, 88.8970], capacity: "120 patients/day", medicalSupport: "Emergency Resuscitation & First-Aid", contact: "102", doctorCount: 4, bedsAvailable: 15 },
  { name: "Gosaba Multipurpose Cyclone Shelter", category: "Relocation Center", coords: [21.9540, 88.9060], capacity: "3,500 evacuees", medicalSupport: "High-Plinth Flood Refuge & First-Aid", contact: "03218-236203 / 1077", doctorCount: 5, bedsAvailable: 420 },
  { name: "Pakhirala Flood Refuge Center", category: "Relocation Center", coords: [21.9460, 88.9070], capacity: "2,000 evacuees", medicalSupport: "Clean Water Station & Community Kitchen", contact: "1077", doctorCount: 4, bedsAvailable: 350 },
  { name: "Gosaba Rural Emergency Hospital", category: "Hospital", coords: [21.9610, 88.9090], capacity: "300 beds", medicalSupport: "Snakebite, Flood Trauma & Minor OT", contact: "108 / 03218-236100", doctorCount: 22, bedsAvailable: 45 },
  { name: "Canning Sub-Divisional Emergency Hospital", category: "Hospital", coords: [21.9720, 88.8840], capacity: "450 beds", medicalSupport: "Snakebite, Waterborne Trauma & ICU", contact: "108 / 03218-255255", doctorCount: 28, bedsAvailable: 85 },

  // --- 6. VASANT VIHAR [17.6868, 83.2185] (Visakhapatnam, AP) ---
  { name: "Steel Plant Primary Health (Medic)", category: "Medic Post", coords: [17.6890, 83.2200], capacity: "350 patients/day", medicalSupport: "Industrial & Urban Triage Center", contact: "102", doctorCount: 8, bedsAvailable: 35 },
  { name: "Scindia Coastal First-Aid Dispensary", category: "Medic Post", coords: [17.6830, 83.2230], capacity: "180 patients/day", medicalSupport: "Emergency Burn & Trauma Dressing", contact: "102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Malkapuram Urban Health Post", category: "Medic Post", coords: [17.6910, 83.2120], capacity: "200 patients/day", medicalSupport: "ORS, Oxygen & Minor Trauma", contact: "102", doctorCount: 5, bedsAvailable: 22 },
  { name: "Gajuwaka Cyclone Relief Shelter", category: "Relocation Center", coords: [17.6900, 83.2230], capacity: "2,500 evacuees", medicalSupport: "Disaster Shelter & High-Plinth Hall", contact: "1077", doctorCount: 6, bedsAvailable: 450 },
  { name: "Sriharipuram Community Evacuation Hall", category: "Relocation Center", coords: [17.6820, 83.2140], capacity: "2,000 evacuees", medicalSupport: "Emergency Bedding & Feeding Center", contact: "1077", doctorCount: 5, bedsAvailable: 380 },
  { name: "INS Kalyani Naval & Disaster Hospital", category: "Hospital", coords: [17.6960, 83.2290], capacity: "600 beds", medicalSupport: "Naval Disaster Trauma & Critical Care", contact: "108 / 0891-2812000", doctorCount: 45, bedsAvailable: 75 },
  { name: "King George Govt Hospital (Vizag)", category: "Hospital", coords: [17.7020, 83.2380], capacity: "1,200 beds", medicalSupport: "Level-1 Coastal Trauma & Critical Care", contact: "108 / 0891-2564891", doctorCount: 60, bedsAvailable: 110 },

  // --- 7. VADODARA CONTROL BASE [22.3072, 73.1812] (Gujarat) ---
  { name: "Akota Urban Emergency Clinic", category: "Medic Post", coords: [22.3090, 73.1840], capacity: "250 patients/day", medicalSupport: "Heatstroke Hydration & Triage", contact: "102", doctorCount: 10, bedsAvailable: 30 },
  { name: "Sayajigunj Red Cross First-Aid Post", category: "Medic Post", coords: [22.3120, 73.1800], capacity: "200 patients/day", medicalSupport: "Mobile Paramedic & Dressing Station", contact: "102", doctorCount: 6, bedsAvailable: 20 },
  { name: "Vadodara Central Emergency Shelter", category: "Relocation Center", coords: [22.3072, 73.1812], capacity: "5,000 evacuees", medicalSupport: "Community Kitchen & SDRF Base Unit", contact: "1070 / 0265-2422106", doctorCount: 12, bedsAvailable: 850 },
  { name: "Polo Ground Disaster Refuge Camp", category: "Relocation Center", coords: [22.3020, 73.1860], capacity: "3,500 evacuees", medicalSupport: "Open-Air Relief Distribution Dome", contact: "1077", doctorCount: 8, bedsAvailable: 550 },
  { name: "GMERS Gotri Govt Hospital", category: "Hospital", coords: [22.3150, 73.1650], capacity: "750 beds", medicalSupport: "Emergency Casualty & Burn ICU", contact: "108 / 0265-2398000", doctorCount: 50, bedsAvailable: 80 },
  { name: "SSG Hospital & Trauma Center (Vadodara)", category: "Hospital", coords: [22.3180, 73.1930], capacity: "1,500 beds", medicalSupport: "Level-1 Trauma, Burn Unit & ICU", contact: "108 / 0265-2424848", doctorCount: 85, bedsAvailable: 120 },

  // --- 8. KATHMANDU VALLEY [27.6850, 85.3150] (Bagmati Basin, Nepal) ---
  { name: "Patan Urban Emergency Health Post", category: "Medic Post", coords: [27.6790, 85.3210], capacity: "200 patients/day", medicalSupport: "Water-Rescue Triage & First-Aid", contact: "+977-1-5522295 / 102", doctorCount: 6, bedsAvailable: 25 },
  { name: "Balkhu Riverfront First-Aid Clinic", category: "Medic Post", coords: [27.6870, 85.3040], capacity: "180 patients/day", medicalSupport: "Emergency IV Fluids & Shock Treatment", contact: "+977-1-4271890 / 102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Teku Emergency Communicable Disease Post", category: "Medic Post", coords: [27.6940, 85.3080], capacity: "250 patients/day", medicalSupport: "Waterborne Epidemic & Wound Care", contact: "+977-1-4253396", doctorCount: 7, bedsAvailable: 30 },
  { name: "Kathmandu Disaster Relief & Shelter Dome", category: "Relocation Center", coords: [27.6910, 85.3220], capacity: "4,000 evacuees", medicalSupport: "Community Kitchen & Nepal Army Relief Base", contact: "+977-1-4221447 / 1149", doctorCount: 8, bedsAvailable: 750 },
  { name: "Jawalakhel Community Evacuation Camp", category: "Relocation Center", coords: [27.6720, 85.3120], capacity: "3,000 evacuees", medicalSupport: "Nepal Red Cross Relief Camp & Clean Water", contact: "+977-1-5521048", doctorCount: 6, bedsAvailable: 500 },
  { name: "Bir Hospital Emergency & Trauma Center", category: "Hospital", coords: [27.7040, 85.3130], capacity: "1,200 beds", medicalSupport: "Apex National Disaster Trauma & Surgery", contact: "+977-1-4221119 / 102", doctorCount: 85, bedsAvailable: 120 },
  { name: "Patan Hospital & Emergency Wing", category: "Hospital", coords: [27.6680, 85.3210], capacity: "850 beds", medicalSupport: "Level-1 Disaster Trauma & Critical Care", contact: "+977-1-5522278", doctorCount: 65, bedsAvailable: 95 },

  // --- 9. CHOORALMALA (WAYANAD) [11.5450, 76.1550] (Wayanad, Kerala) ---
  { name: "Chooralmala Rapid First-Aid Post", category: "Medic Post", coords: [11.5420, 76.1580], capacity: "160 patients/day", medicalSupport: "Debris Trauma, Splints & Hypothermia", contact: "102 / 04936-255100", doctorCount: 5, bedsAvailable: 20 },
  { name: "Vellarmala Rescue Paramedic Unit", category: "Medic Post", coords: [11.5490, 76.1510], capacity: "140 patients/day", medicalSupport: "Indian Army & NDRF First-Response Post", contact: "102", doctorCount: 4, bedsAvailable: 15 },
  { name: "Meppadi Primary Health Centre", category: "Medic Post", coords: [11.5480, 76.1420], capacity: "220 patients/day", medicalSupport: "Triage, Oxygen & Emergency Dressing", contact: "102 / 04936-282250", doctorCount: 6, bedsAvailable: 25 },
  { name: "Chooralmala Community Relief Hall", category: "Relocation Center", coords: [11.5430, 76.1520], capacity: "2,000 evacuees", medicalSupport: "Emergency Evacuation & Feeding Camp", contact: "1077", doctorCount: 5, bedsAvailable: 350 },
  { name: "Meppadi Higher Secondary Disaster Camp", category: "Relocation Center", coords: [11.5500, 76.1400], capacity: "3,500 evacuees", medicalSupport: "Central SDRF Relief Shelter & Family Tents", contact: "1077 / 04936-282100", doctorCount: 8, bedsAvailable: 600 },
  { name: "Wayanad Medical College & Trauma Unit", category: "Hospital", coords: [11.5550, 76.1360], capacity: "700 beds", medicalSupport: "Multi-Specialty Mountain Trauma & Surgery", contact: "108 / 04936-220000", doctorCount: 50, bedsAvailable: 90 },
  { name: "Wayanad District Disaster Relief Hospital", category: "Hospital", coords: [11.5620, 76.1280], capacity: "500 beds", medicalSupport: "Level-1 Crush Injury & ICU Unit", contact: "108 / 04936-202221", doctorCount: 40, bedsAvailable: 75 }
];

async function run() {
  await connectDB();

  await Habitation.deleteMany({});
  const enrichedHabitations = HABITATIONS.map((h) => {
    const computed = computeRiskScore(h);
    const habData = {
      ...h,
      hazardDistanceKm: h.hazardDistanceKm || parseFloat(h.hazardDistance) || 0.5,
      vulnerabilityScore: h.vulnerabilityScore || computed.vulnerabilityScore,
      riskLevel: h.riskLevel || computed.riskLevel,
      carryingCapacityStatus: h.carryingCapacityStatus || computed.carryingCapacityStatus,
      scoreBreakdown: h.scoreBreakdown || computed.scoreBreakdown,
      topDrivers: computed.topDrivers,
      explanationText: computed.explanationText
    };
    habData.resourceEstimates = estimateResourceNeeds(habData);
    return habData;
  });

  const insertedHabitations = await Habitation.insertMany(enrichedHabitations);
  console.log(`✅ Seeded ${insertedHabitations.length} habitations with explainable risk scores`);

  await Facility.deleteMany({});
  const insertedFacilities = await Facility.insertMany(FACILITIES);
  console.log(`✅ Seeded ${insertedFacilities.length} facilities`);

  await mongoose.connection.close();
  console.log("Done.");
}

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});