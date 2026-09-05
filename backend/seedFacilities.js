// backend/seedFacilities.js
const mongoose = require('mongoose');

const MONGO_URI = 'mongodb://127.0.0.1:27017/abhaya';

const facilitySchema = new mongoose.Schema({
  id: String,
  name: { type: String, required: true },
  category: { type: String, enum: ['Relocation Center', 'Hospital', 'Medic Post'], required: true },
  coords: { type: [Number], required: true }, // [lat, lng]
  capacity: String,
  medicalSupport: String,
  contact: String,
  doctorCount: Number,
  bedsAvailable: Number,
  state: String
});

const EmergencyFacility = mongoose.model('EmergencyFacility', facilitySchema);

const NATIONWIDE_FACILITIES = [
  // --- WEST BENGAL & SUNDARBANS ---
  {
    id: 'fac-wb-1',
    name: 'Gosaba Multipurpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [22.1652, 88.8072],
    capacity: '3,500 evacuees',
    medicalSupport: 'High-Plinth Flood Refuge & First-Aid',
    contact: '03218-236203 / 1077',
    doctorCount: 5,
    bedsAvailable: 420,
    state: 'West Bengal'
  },
  {
    id: 'fac-wb-2',
    name: 'Canning Sub-Divisional Emergency Hospital',
    category: 'Hospital',
    coords: [22.3106, 88.6582],
    capacity: '450 beds',
    medicalSupport: 'Snakebite & Waterborne Trauma Unit',
    contact: '108 / 03218-255255',
    doctorCount: 28,
    bedsAvailable: 85,
    state: 'West Bengal'
  },
  {
    id: 'fac-wb-3',
    name: 'Basanti Block Primary Health Centre',
    category: 'Medic Post',
    coords: [22.1920, 88.7180],
    capacity: '150 patients/day',
    medicalSupport: 'Emergency Triage & ORS Center',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 24,
    state: 'West Bengal'
  },
  {
    id: 'fac-wb-4',
    name: 'SSKM Govt Medical College & Hospital (Kolkata)',
    category: 'Hospital',
    coords: [22.5396, 88.3432],
    capacity: '2,200 beds',
    medicalSupport: 'Level-1 Apex Trauma & Burn Care',
    contact: '108 / 033-22231589',
    doctorCount: 140,
    bedsAvailable: 210,
    state: 'West Bengal'
  },

  // --- GUJARAT & ARID / FLOOD ZONE ---
  {
    id: 'fac-gj-1',
    name: 'SSG Hospital & Trauma Center (Vadodara)',
    category: 'Hospital',
    coords: [22.3122, 73.1920],
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma & ICU',
    contact: '108 / 0265-2424848',
    doctorCount: 85,
    bedsAvailable: 120,
    state: 'Gujarat'
  },
  {
    id: 'fac-gj-2',
    name: 'Vadodara Central Emergency Shelter',
    category: 'Relocation Center',
    coords: [22.3072, 73.1812],
    capacity: '5,000 evacuees',
    medicalSupport: 'Community Kitchen & SDRF Unit',
    contact: '1070 / 0265-2422106',
    doctorCount: 12,
    bedsAvailable: 850,
    state: 'Gujarat'
  },
  {
    id: 'fac-gj-3',
    name: 'Civil Hospital Ahmedabad (Asarwa)',
    category: 'Hospital',
    coords: [23.0526, 72.6033],
    capacity: '2,800 beds',
    medicalSupport: 'Multi-Specialty Disaster Casualty Wing',
    contact: '108 / 079-22683721',
    doctorCount: 180,
    bedsAvailable: 340,
    state: 'Gujarat'
  },
  {
    id: 'fac-gj-4',
    name: 'Bhuj General Hospital & Earthquake Relief Wing',
    category: 'Hospital',
    coords: [23.2530, 69.6693],
    capacity: '600 beds',
    medicalSupport: 'Seismic Structural Resilient ICU',
    contact: '108',
    doctorCount: 35,
    bedsAvailable: 90,
    state: 'Gujarat'
  },

  // --- ODISHA COASTAL CYCLONE CORRIDOR ---
  {
    id: 'fac-od-1',
    name: 'Gopalpur Multi-Purpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [19.2620, 84.8990],
    capacity: '4,000 evacuees',
    medicalSupport: 'Reinforced Cyclone Bunker & Water Tanks',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 700,
    state: 'Odisha'
  },
  {
    id: 'fac-od-2',
    name: 'MKCG Govt Medical College (Berhampur)',
    category: 'Hospital',
    coords: [19.3100, 84.7950],
    capacity: '1,100 beds',
    medicalSupport: 'Critical Care & Emergency Surgery',
    contact: '108 / 0680-2292746',
    doctorCount: 55,
    bedsAvailable: 95,
    state: 'Odisha'
  },
  {
    id: 'fac-od-3',
    name: 'AIIMS Bhubaneswar Emergency Block',
    category: 'Hospital',
    coords: [20.2312, 85.7758],
    capacity: '1,400 beds',
    medicalSupport: 'Apex National Disaster Triage',
    contact: '108 / 0674-2476789',
    doctorCount: 110,
    bedsAvailable: 150,
    state: 'Odisha'
  },

  // --- UTTAR PRADESH & BIHAR (GANGETIC FLOOD PLAINS) ---
  {
    id: 'fac-up-1',
    name: 'Sir Sunderlal Hospital, BHU (Varanasi)',
    category: 'Hospital',
    coords: [25.2750, 82.9980],
    capacity: '1,500 beds',
    medicalSupport: 'Trauma & Epidemic Containment Unit',
    contact: '108 / 0542-2307500',
    doctorCount: 75,
    bedsAvailable: 110,
    state: 'Uttar Pradesh'
  },
  {
    id: 'fac-up-2',
    name: 'District Flood Relief Center (Kotla / Varanasi)',
    category: 'Relocation Center',
    coords: [25.3280, 82.9850],
    capacity: '3,000 evacuees',
    medicalSupport: 'Dry Ration Distribution & Medical Camp',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 600,
    state: 'Uttar Pradesh'
  },
  {
    id: 'fac-br-1',
    name: 'Patna Medical College & Hospital (PMCH)',
    category: 'Hospital',
    coords: [25.6200, 85.1580],
    capacity: '2,000 beds',
    medicalSupport: 'High-Water Inundation Emergency Ward',
    contact: '108 / 0612-2300080',
    doctorCount: 90,
    bedsAvailable: 140,
    state: 'Bihar'
  },
  {
    id: 'fac-br-2',
    name: 'Patna State Evacuation Complex',
    category: 'Relocation Center',
    coords: [25.6020, 85.1480],
    capacity: '4,500 evacuees',
    medicalSupport: 'SDRF Base & Relief Distribution',
    contact: '1070',
    doctorCount: 8,
    bedsAvailable: 800,
    state: 'Bihar'
  },

  // --- UTTARAKHAND (HIMALAYAN LANDSLIDE & FLASH FLOOD) ---
  {
    id: 'fac-uk-1',
    name: 'Doon Govt Medical College & Hospital',
    category: 'Hospital',
    coords: [30.3210, 78.0380],
    capacity: '800 beds',
    medicalSupport: 'Orthopedic, Trauma & Mountain Rescue',
    contact: '108 / 0135-2726020',
    doctorCount: 45,
    bedsAvailable: 70,
    state: 'Uttarakhand'
  },
  {
    id: 'fac-uk-2',
    name: 'State Landslide Evacuation Center (Dehradun)',
    category: 'Relocation Center',
    coords: [30.3250, 78.0400],
    capacity: '2,000 evacuees',
    medicalSupport: 'NDRF Search & Rescue Mobilization Base',
    contact: '1070',
    doctorCount: 7,
    bedsAvailable: 350,
    state: 'Uttarakhand'
  },
  {
    id: 'fac-uk-3',
    name: 'AIIMS Rishikesh Emergency Division',
    category: 'Hospital',
    coords: [30.0760, 78.2882],
    capacity: '1,000 beds',
    medicalSupport: 'Heli-Ambulance & Extreme Trauma Facility',
    contact: '108 / 0135-2462929',
    doctorCount: 80,
    bedsAvailable: 95,
    state: 'Uttarakhand'
  },

  // --- ANDHRA PRADESH & SOUTHERN COAST ---
  {
    id: 'fac-ap-1',
    name: 'King George Hospital (Visakhapatnam)',
    category: 'Hospital',
    coords: [17.7080, 83.2950],
    capacity: '1,200 beds',
    medicalSupport: 'Coastal Trauma, Burn & Critical Care',
    contact: '108 / 0891-2564891',
    doctorCount: 60,
    bedsAvailable: 110,
    state: 'Andhra Pradesh'
  },
  {
    id: 'fac-ap-2',
    name: 'Gajuwaka Cyclone Relief Shelter',
    category: 'Relocation Center',
    coords: [17.6950, 83.2120],
    capacity: '2,500 evacuees',
    medicalSupport: 'Disaster Shelter & High-Plinth Hall',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 450,
    state: 'Andhra Pradesh'
  },

  // --- ASSAM & NORTH-EAST (BRAHMAPUTRA FLOODS) ---
  {
    id: 'fac-as-1',
    name: 'Gauhati Medical College and Hospital (GMCH)',
    category: 'Hospital',
    coords: [26.1558, 91.7766],
    capacity: '1,900 beds',
    medicalSupport: 'Emergency Waterborne Triage & Surgery',
    contact: '108 / 0361-2529457',
    doctorCount: 95,
    bedsAvailable: 160,
    state: 'Assam'
  },
  {
    id: 'fac-as-2',
    name: 'Guwahati Multi-Hazard Relief Camp',
    category: 'Relocation Center',
    coords: [26.1859, 91.7478],
    capacity: '4,000 evacuees',
    medicalSupport: 'State Disaster Response Force Unit',
    contact: '1070',
    doctorCount: 8,
    bedsAvailable: 600,
    state: 'Assam'
  },

  // --- KERALA (HILLSIDE LANDSLIDE & FLOOD) ---
  {
    id: 'fac-kl-1',
    name: 'Wayanad District Disaster Relief Hospital',
    category: 'Hospital',
    coords: [11.6854, 76.1320],
    capacity: '500 beds',
    medicalSupport: 'Debris Trauma & Orthopedic Care',
    contact: '108 / 04936-202221',
    doctorCount: 30,
    bedsAvailable: 80,
    state: 'Kerala'
  },
  {
    id: 'fac-kl-2',
    name: 'Meppadi Disaster Relief Camp',
    category: 'Relocation Center',
    coords: [11.5510, 76.1264],
    capacity: '2,500 evacuees',
    medicalSupport: 'First Response Paramedic Station',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 400,
    state: 'Kerala'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    await EmergencyFacility.deleteMany({});
    console.log('Cleared existing facilities.');

    await EmergencyFacility.insertMany(NATIONWIDE_FACILITIES);
    console.log(`Successfully seeded ${NATIONWIDE_FACILITIES.length} nationwide disaster shelters and hospitals.`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();