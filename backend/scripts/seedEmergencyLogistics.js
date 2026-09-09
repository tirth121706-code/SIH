const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const RescueUnit = require("../models/RescueUnit");
const ReliefDepot = require("../models/ReliefDepot");
const Facility = require("../models/Facility");

const RESCUE_UNITS = [
  {
    name: "SDRF 9th Bn Flood Rescue Staging Base - Patna",
    unitCode: "RU-PAT-01",
    agency: "SDRF",
    type: "Water Rescue & Boat Staging",
    coords: [25.6350, 85.1050],
    assignedHabitation: "Chandpur Colony",
    proximityToWaterBody: "Ganges Riverfront - 120m",
    equipment: { motorizedBoats: 8, inflatableRafts: 4, lifeJackets: 80, diversOnDuty: 6, dronesAvailable: 2 },
    personnelCount: 24,
    operationalStatus: "Active / Standby",
    contact: "0612-2217310 / 1077",
    isSeeded: true,
    notes: "Primary flood extrication post for Patna riverfront"
  },
  {
    name: "NDRF 11th Bn Water Rescue Staging Base - Varanasi",
    unitCode: "RU-VAR-01",
    agency: "NDRF",
    type: "Water Rescue & Boat Staging",
    coords: [25.2890, 82.9980],
    assignedHabitation: "Kotla Basti",
    proximityToWaterBody: "Ganges Riverfront - 80m",
    equipment: { motorizedBoats: 10, inflatableRafts: 6, lifeJackets: 120, diversOnDuty: 8, dronesAvailable: 3 },
    personnelCount: 32,
    operationalStatus: "Active / Standby",
    contact: "0542-2501201 / 1077",
    isSeeded: true,
    notes: "Deep water rescue and flood evacuation for Varanasi Ghats"
  },
  {
    name: "Kerala SDRF Riverine Rescue Base - Wayanad (Meppadi)",
    unitCode: "RU-WAY-01",
    agency: "SDRF",
    type: "Mountain Torrent Rescue",
    coords: [11.5520, 76.1320],
    assignedHabitation: "Chooralmala (Wayanad)",
    proximityToWaterBody: "Chaliyar River Basin - 100m",
    equipment: { motorizedBoats: 4, inflatableRafts: 4, lifeJackets: 60, diversOnDuty: 4, dronesAvailable: 3 },
    personnelCount: 20,
    operationalStatus: "Active / Standby",
    contact: "04936-202251 / 112",
    isSeeded: true,
    notes: "Torrent stream extrication and mudslide rescue unit"
  },
  {
    name: "NDRF Northern Sector Rapid Water Rescue Base",
    unitCode: "RU-KTM-01",
    agency: "NDRF",
    type: "Flood Rapid Response",
    coords: [27.6820, 85.2980],
    assignedHabitation: "Kathmandu Valley",
    proximityToWaterBody: "River Floodplain - 90m",
    equipment: { motorizedBoats: 6, inflatableRafts: 8, lifeJackets: 90, diversOnDuty: 6, dronesAvailable: 2 },
    personnelCount: 28,
    operationalStatus: "Active / Standby",
    contact: "011-24363260 / 1078",
    isSeeded: true,
    notes: "High-readiness water rescue and flood evacuation base"
  },
  {
    name: "NDRF 2nd Bn Coastal Flood Rescue Staging Base - Canning",
    unitCode: "RU-SUN-01",
    agency: "NDRF",
    type: "Water Rescue & Boat Staging",
    coords: [21.9680, 88.8850],
    assignedHabitation: "Sundarban Ghat",
    proximityToWaterBody: "Matla Estuary Waterfront - 40m",
    equipment: { motorizedBoats: 12, inflatableRafts: 6, lifeJackets: 150, diversOnDuty: 8, dronesAvailable: 2 },
    personnelCount: 30,
    operationalStatus: "Active / Standby",
    contact: "03218-255225 / 1077",
    isSeeded: true,
    notes: "Ocean-grade rigid inflatable boats for tidal surges"
  },
  {
    name: "Uttarakhand SDRF Mountain Torrent Rescue Post - Dehradun",
    unitCode: "RU-DDN-01",
    agency: "SDRF",
    type: "Mountain Torrent Rescue",
    coords: [30.3420, 78.0580],
    assignedHabitation: "Rampur Nagar",
    proximityToWaterBody: "Torrential Stream Confluence - 70m",
    equipment: { motorizedBoats: 4, inflatableRafts: 6, lifeJackets: 70, diversOnDuty: 4, dronesAvailable: 2 },
    personnelCount: 18,
    operationalStatus: "Active / Standby",
    contact: "0135-2710334 / 1070",
    isSeeded: true,
    notes: "Mountain flash flood torrent ropes and rafting gear"
  },
  {
    name: "ODRAF Inshore Surf Rescue Staging Base - Gopalpur",
    unitCode: "RU-GOP-01",
    agency: "ODRAF",
    type: "Coastal Surf Rescue",
    coords: [19.2680, 84.9120],
    assignedHabitation: "Gopalpur",
    proximityToWaterBody: "Coastline / Tidal Inlet - 110m",
    equipment: { motorizedBoats: 8, inflatableRafts: 4, lifeJackets: 100, diversOnDuty: 6, dronesAvailable: 2 },
    personnelCount: 22,
    operationalStatus: "Active / Standby",
    contact: "0680-2244222 / 1077",
    isSeeded: true,
    notes: "High-surf coastal rescue and storm surge boats"
  },
  {
    name: "NDRF 10th Bn Coastal Water Rescue Base - Visakhapatnam",
    unitCode: "RU-VIZ-01",
    agency: "NDRF",
    type: "Coastal Surf Rescue",
    coords: [17.6980, 83.2950],
    assignedHabitation: "Vasant Vihar",
    proximityToWaterBody: "Outer Harbour Channel - 80m",
    equipment: { motorizedBoats: 8, inflatableRafts: 6, lifeJackets: 90, diversOnDuty: 8, dronesAvailable: 2 },
    personnelCount: 26,
    operationalStatus: "Active / Standby",
    contact: "0891-2565451 / 1077",
    isSeeded: true,
    notes: "Gemini craft and deep divers for coastal inundation"
  }
];

const RELIEF_DEPOTS = [
  {
    name: "Patna District Emergency Supplies & Water Hub",
    depotCode: "RD-PAT-01",
    type: "District Civil Supply Warehouse",
    coords: [25.6020, 85.1480],
    assignedHabitation: "Chandpur Colony",
    accessCorridor: "NH-30 / Bailey Road High-Ground Corridor",
    supplies: { potableWaterLitres: 35000, waterPurificationKits: 600, foodRationPacks: 6000, tarpaulinsAndTents: 1200, blanketsAndBedding: 1800 },
    dailyDistributionCapacity: "6,500 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "0612-2219515 / 1967",
    isSeeded: true,
    notes: "Major flood relief distribution warehouse with high-ground access"
  },
  {
    name: "Varanasi Central Emergency Supplies Hub (Sigra)",
    depotCode: "RD-VAR-01",
    type: "Emergency Water & Ration Hub",
    coords: [25.3205, 82.9820],
    assignedHabitation: "Kotla Basti",
    accessCorridor: "Sigra-Cantt Elevated Arterial Road",
    supplies: { potableWaterLitres: 28000, waterPurificationKits: 500, foodRationPacks: 4500, tarpaulinsAndTents: 900, blanketsAndBedding: 1400 },
    dailyDistributionCapacity: "5,000 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "0542-2508412 / 1070",
    isSeeded: true,
    notes: "Elevated hub for drinking water tankers and dry rations"
  },
  {
    name: "Wayanad District Emergency Relief & Supplies Depot",
    depotCode: "RD-WAY-01",
    type: "District Civil Supply Warehouse",
    coords: [11.5650, 76.1050],
    assignedHabitation: "Chooralmala (Wayanad)",
    accessCorridor: "SH-59 High-Elevation Ridge Corridor",
    supplies: { potableWaterLitres: 22000, waterPurificationKits: 450, foodRationPacks: 3800, tarpaulinsAndTents: 1000, blanketsAndBedding: 2000 },
    dailyDistributionCapacity: "4,500 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "04936-202341 / 1077",
    isSeeded: true,
    notes: "Hill station warehouse stocked with thermal bedding and water purification"
  },
  {
    name: "Indian Red Cross Society Regional Emergency Supplies Hub",
    depotCode: "RD-KTM-01",
    type: "Red Cross Supply Depot",
    coords: [27.6970, 85.3080],
    assignedHabitation: "Kathmandu Valley",
    accessCorridor: "Ring Road - Elevated Transit Axis",
    supplies: { potableWaterLitres: 25000, waterPurificationKits: 800, foodRationPacks: 4500, tarpaulinsAndTents: 1500, blanketsAndBedding: 2500 },
    dailyDistributionCapacity: "5,500 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "011-23716441 / 1070",
    isSeeded: true,
    notes: "Regional disaster logistics depot stocked with water kits and dry rations"
  },
  {
    name: "Sundarbans Regional Emergency Supplies & Water Depot",
    depotCode: "RD-SUN-01",
    type: "District Civil Supply Warehouse",
    coords: [21.9820, 88.8520],
    assignedHabitation: "Sundarban Ghat",
    accessCorridor: "Canning-Baruipur Elevated Highway",
    supplies: { potableWaterLitres: 45000, waterPurificationKits: 1200, foodRationPacks: 8000, tarpaulinsAndTents: 2000, blanketsAndBedding: 2500 },
    dailyDistributionCapacity: "8,000 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "03218-255340 / 1967",
    isSeeded: true,
    notes: "Equipped with mobile RO desalination units and high-capacity food stores"
  },
  {
    name: "Dehradun District Emergency Supplies Hub (ISBT)",
    depotCode: "RD-DDN-01",
    type: "Emergency Water & Ration Hub",
    coords: [30.2950, 78.0120],
    assignedHabitation: "Rampur Nagar",
    accessCorridor: "Saharanpur Road / NH-72 Transit Corridor",
    supplies: { potableWaterLitres: 20000, waterPurificationKits: 400, foodRationPacks: 4000, tarpaulinsAndTents: 800, blanketsAndBedding: 1500 },
    dailyDistributionCapacity: "4,500 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "0135-2626066 / 1077",
    isSeeded: true,
    notes: "Direct access to highway junction for heavy supply trucks"
  },
  {
    name: "Ganjam District Emergency Supplies & Cyclone Depot",
    depotCode: "RD-GOP-01",
    type: "District Civil Supply Warehouse",
    coords: [19.2850, 84.8820],
    assignedHabitation: "Gopalpur",
    accessCorridor: "Gopalpur-Berhampur Elevated Highway",
    supplies: { potableWaterLitres: 32000, waterPurificationKits: 600, foodRationPacks: 6000, tarpaulinsAndTents: 1500, blanketsAndBedding: 1800 },
    dailyDistributionCapacity: "6,000 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "0680-2200214 / 1967",
    isSeeded: true,
    notes: "Reinforced cyclone-resistant storage depot"
  },
  {
    name: "Visakhapatnam Metropolitan Emergency Supplies Hub",
    depotCode: "RD-VIZ-01",
    type: "Emergency Water & Ration Hub",
    coords: [17.7250, 83.2450],
    assignedHabitation: "Vasant Vihar",
    accessCorridor: "NH-16 Port High-Speed Connectivity Axis",
    supplies: { potableWaterLitres: 30000, waterPurificationKits: 550, foodRationPacks: 5500, tarpaulinsAndTents: 1100, blanketsAndBedding: 1600 },
    dailyDistributionCapacity: "6,000 persons/day",
    operationalStatus: "Stocked & Ready",
    contact: "0891-2560300 / 1077",
    isSeeded: true,
    notes: "Urban logistics center with direct access to coastal evacuation routes"
  }
];

async function seedEmergencyLogistics() {
  await connectDB();
  console.log("Connected to MongoDB for Emergency Logistics re-seeding...");

  // 1. Seed Rescue Units
  await RescueUnit.deleteMany({});
  const insertedRescueUnits = await RescueUnit.insertMany(RESCUE_UNITS);
  console.log(`✅ Successfully seeded ${insertedRescueUnits.length} Indian Rescue Units.`);

  // 2. Seed Relief Depots
  await ReliefDepot.deleteMany({});
  const insertedReliefDepots = await ReliefDepot.insertMany(RELIEF_DEPOTS);
  console.log(`✅ Successfully seeded ${insertedReliefDepots.length} Indian Relief Depots.`);

  // 3. Keep Facility collection synchronized for seamless dispatchRoutingService integration
  console.log("Synchronizing specialized units into Facility collection...");
  await Facility.deleteMany({ category: { $in: ["Rescue Unit", "Relief Depot"] } });

  const facilityRescueUnits = RESCUE_UNITS.map(ru => ({
    name: ru.name,
    category: "Rescue Unit",
    coords: ru.coords,
    capacity: `${ru.equipment.motorizedBoats} IRBs, ${ru.equipment.inflatableRafts} Rafts, ${ru.personnelCount} Personnel`,
    medicalSupport: "Swiftwater & Flood Extrication, Rescue Divers",
    contact: ru.contact,
    doctorCount: 2,
    bedsAvailable: 0,
    assignedHabitation: ru.assignedHabitation,
    equipment: ru.equipment,
    isSeeded: true
  }));

  const facilityReliefDepots = RELIEF_DEPOTS.map(rd => ({
    name: rd.name,
    category: "Relief Depot",
    coords: rd.coords,
    capacity: `${rd.supplies.potableWaterLitres.toLocaleString()}L Water, ${rd.supplies.foodRationPacks.toLocaleString()} Rations`,
    medicalSupport: "Potable Water, Food Rations & Tents Distribution",
    contact: rd.contact,
    doctorCount: 1,
    bedsAvailable: 0,
    assignedHabitation: rd.assignedHabitation,
    supplies: rd.supplies,
    isSeeded: true
  }));

  await Facility.insertMany([...facilityRescueUnits, ...facilityReliefDepots]);
  console.log(`✅ Synchronized ${facilityRescueUnits.length + facilityReliefDepots.length} units into Facility collection.`);

  // Count totals
  const totalFacilities = await Facility.countDocuments();
  console.log(`📊 Total emergency facilities now active: ${totalFacilities}`);

  process.exit(0);
}

seedEmergencyLogistics().catch(err => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
