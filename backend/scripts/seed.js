require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Habitation = require("../models/Habitation");
const Facility = require("../models/Facility");

const HABITATIONS = [
  { name: "Kotla Basti", district: "Riverside", hazardType: "Flood", population: 4120, households: 812, hazardDistance: "0.4 km", carryingCapacityStatus: "Exceeded", vulnerabilityScore: 94, riskLevel: "Critical" },
  { name: "Chandpur Colony", district: "Riverside", hazardType: "River Erosion", population: 3860, households: 765, hazardDistance: "0.2 km", carryingCapacityStatus: "Exceeded", vulnerabilityScore: 91, riskLevel: "Critical" },
  { name: "Rampur Nagar", district: "Hillside", hazardType: "Landslide", population: 2910, households: 540, hazardDistance: "0.6 km", carryingCapacityStatus: "Near limit", vulnerabilityScore: 86, riskLevel: "High" },
  { name: "Gopalpur", district: "Coastal", hazardType: "Cyclone", population: 5430, households: 1120, hazardDistance: "1.1 km", carryingCapacityStatus: "Near limit", vulnerabilityScore: 79, riskLevel: "High" },
  { name: "Sundarban Ghat", district: "Riverside", hazardType: "Flood", population: 1780, households: 349, hazardDistance: "1.8 km", carryingCapacityStatus: "Within limit", vulnerabilityScore: 68, riskLevel: "Moderate" },
  { name: "Vasant Vihar", district: "Coastal", hazardType: "Cyclone", population: 960, households: 201, hazardDistance: "3.2 km", carryingCapacityStatus: "Within limit", vulnerabilityScore: 31, riskLevel: "Low" },
];

const FACILITIES = [
  { name: "Sir Sunderlal Hospital (BHU)", category: "Hospital", coords: [25.2750, 82.9980], capacity: "1,500 beds", medicalSupport: "Level-1 Trauma & Critical Care Unit", contact: "108 / 0542-2307500", doctorCount: 75, bedsAvailable: 110 },
  { name: "Varanasi District Flood Relief Shelter", category: "Relocation Center", coords: [25.3280, 82.9850], capacity: "3,000 evacuees", medicalSupport: "Community Kitchen & Relief Camp", contact: "1077", doctorCount: 5, bedsAvailable: 600 },
  { name: "Chowk Urban Primary Health Centre", category: "Medic Post", coords: [25.3120, 83.0100], capacity: "200 patients/day", medicalSupport: "First-Aid & Epidemic Prevention", contact: "102", doctorCount: 6, bedsAvailable: 25 },
  { name: "PMCH Emergency Wing (Patna Medical College)", category: "Hospital", coords: [25.6200, 85.1580], capacity: "2,000 beds", medicalSupport: "Flood Inundation Trauma & Surgery", contact: "108 / 0612-2300080", doctorCount: 90, bedsAvailable: 140 },
  { name: "Patna State Evacuation Complex (Kankarbagh)", category: "Relocation Center", coords: [25.6020, 85.1480], capacity: "4,500 evacuees", medicalSupport: "SDRF Relief Unit & Clean Water Station", contact: "1070", doctorCount: 8, bedsAvailable: 800 },
  { name: "Rajendra Nagar Urban Health Clinic", category: "Medic Post", coords: [25.5980, 85.1520], capacity: "180 patients/day", medicalSupport: "ORS, Triage & First-Aid", contact: "102", doctorCount: 5, bedsAvailable: 20 },
  { name: "Doon Govt Medical College & Hospital", category: "Hospital", coords: [30.3210, 78.0380], capacity: "800 beds", medicalSupport: "Mountain Debris Trauma & Orthopedic Care", contact: "108 / 0135-2726020", doctorCount: 45, bedsAvailable: 70 },
  { name: "State Landslide Evacuation Center (Rajpur Rd)", category: "Relocation Center", coords: [30.3250, 78.0400], capacity: "2,000 evacuees", medicalSupport: "NDRF Base, Emergency Bedding & Heating", contact: "1070", doctorCount: 7, bedsAvailable: 350 },
  { name: "Karanpur Mountain Emergency Clinic", category: "Medic Post", coords: [30.3280, 78.0490], capacity: "150 patients/day", medicalSupport: "Hypothermia & Fracture Stabilization", contact: "102", doctorCount: 4, bedsAvailable: 15 },
  { name: "MKCG Govt Medical College (Berhampur)", category: "Hospital", coords: [19.3100, 84.7950], capacity: "1,100 beds", medicalSupport: "Coastal Trauma, Critical Care & Surgery", contact: "108 / 0680-2292746", doctorCount: 55, bedsAvailable: 95 },
  { name: "Gopalpur Multi-Purpose Cyclone Shelter", category: "Relocation Center", coords: [19.2620, 84.8990], capacity: "4,000 evacuees", medicalSupport: "Reinforced Cyclone Bunker & Water Tanks", contact: "1077", doctorCount: 6, bedsAvailable: 700 },
  { name: "Gopalpur Port Primary Health Centre", category: "Medic Post", coords: [19.2680, 84.9050], capacity: "120 patients/day", medicalSupport: "Coastal Emergency Triage", contact: "102", doctorCount: 4, bedsAvailable: 18 },
  { name: "Canning Sub-Divisional Emergency Hospital", category: "Hospital", coords: [22.3106, 88.6582], capacity: "450 beds", medicalSupport: "Snakebite, Waterborne Trauma & ICU", contact: "108 / 03218-255255", doctorCount: 28, bedsAvailable: 85 },
  { name: "Gosaba Multipurpose Cyclone Shelter", category: "Relocation Center", coords: [22.1652, 88.8072], capacity: "3,500 evacuees", medicalSupport: "High-Plinth Flood Refuge & First-Aid", contact: "03218-236203 / 1077", doctorCount: 5, bedsAvailable: 420 },
  { name: "Basanti Block Primary Health Centre", category: "Medic Post", coords: [22.1920, 88.7180], capacity: "150 patients/day", medicalSupport: "Triage & Rapid Antivenom Administration", contact: "102", doctorCount: 6, bedsAvailable: 24 },
  { name: "King George Govt Hospital (Vizag)", category: "Hospital", coords: [17.7080, 83.2950], capacity: "1,200 beds", medicalSupport: "Level-1 Coastal Trauma & Critical Care", contact: "108 / 0891-2564891", doctorCount: 60, bedsAvailable: 110 },
  { name: "Gajuwaka Cyclone Relief Shelter", category: "Relocation Center", coords: [17.6950, 83.2120], capacity: "2,500 evacuees", medicalSupport: "Disaster Shelter & High-Plinth Hall", contact: "1077", doctorCount: 6, bedsAvailable: 450 },
  { name: "Steel Plant Primary Health (Medic)", category: "Medic Post", coords: [17.6750, 83.1850], capacity: "350 patients/day", medicalSupport: "Industrial & Urban Triage Center", contact: "102", doctorCount: 8, bedsAvailable: 35 },
];

async function run() {
  await connectDB();

  await Habitation.deleteMany({});
  const insertedHabitations = await Habitation.insertMany(HABITATIONS);
  console.log(`✅ Seeded ${insertedHabitations.length} habitations`);

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