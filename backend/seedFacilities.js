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
  // --- 1. KOTLA BASTI [25.3176, 82.9739] — Varanasi, UP ---
  {
    id: 'fac-up-1',
    name: 'Sir Sunderlal Hospital (BHU)',
    category: 'Hospital',
    coords: [25.3050, 82.9870],   // 1.92 km from Kotla Basti
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma & Critical Care Unit',
    contact: '108 / 0542-2307500',
    doctorCount: 75,
    bedsAvailable: 110,
    state: 'Uttar Pradesh'
  },
  {
    id: 'fac-up-2',
    name: 'Varanasi District Flood Relief Shelter',
    category: 'Relocation Center',
    coords: [25.3220, 82.9810],   // 0.87 km from Kotla Basti
    capacity: '3,000 evacuees',
    medicalSupport: 'Community Kitchen & Relief Camp',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 600,
    state: 'Uttar Pradesh'
  },
  {
    id: 'fac-up-3',
    name: 'Chowk Urban Primary Health Centre',
    category: 'Medic Post',
    coords: [25.3140, 82.9780],   // 0.57 km from Kotla Basti
    capacity: '200 patients/day',
    medicalSupport: 'First-Aid & Epidemic Prevention',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 25,
    state: 'Uttar Pradesh'
  },

  // --- 2. CHANDPUR COLONY [25.5941, 85.1376] — Patna, Bihar ---
  {
    id: 'fac-br-1',
    name: 'PMCH Emergency Wing (Patna Medical College)',
    category: 'Hospital',
    coords: [25.6080, 85.1540],   // 2.26 km from Chandpur Colony
    capacity: '2,000 beds',
    medicalSupport: 'Flood Inundation Trauma & Surgery',
    contact: '108 / 0612-2300080',
    doctorCount: 90,
    bedsAvailable: 140,
    state: 'Bihar'
  },
  {
    id: 'fac-br-2',
    name: 'Patna State Evacuation Complex (Kankarbagh)',
    category: 'Relocation Center',
    coords: [25.6010, 85.1450],   // 1.07 km from Chandpur Colony
    capacity: '4,500 evacuees',
    medicalSupport: 'SDRF Relief Unit & Clean Water Station',
    contact: '1070',
    doctorCount: 8,
    bedsAvailable: 800,
    state: 'Bihar'
  },
  {
    id: 'fac-br-3',
    name: 'Rajendra Nagar Urban Health Clinic',
    category: 'Medic Post',
    coords: [25.5970, 85.1410],   // 0.47 km from Chandpur Colony
    capacity: '180 patients/day',
    medicalSupport: 'ORS, Triage & First-Aid',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20,
    state: 'Bihar'
  },

  // --- 3. RAMPUR NAGAR [30.3165, 78.0322] — Dehradun, Uttarakhand ---
  {
    id: 'fac-uk-1',
    name: 'Doon Govt Medical College & Hospital',
    category: 'Hospital',
    coords: [30.3260, 78.0440],   // 1.55 km from Rampur Nagar
    capacity: '800 beds',
    medicalSupport: 'Mountain Debris Trauma & Orthopedic Care',
    contact: '108 / 0135-2726020',
    doctorCount: 45,
    bedsAvailable: 70,
    state: 'Uttarakhand'
  },
  {
    id: 'fac-uk-2',
    name: 'State Landslide Evacuation Center (Rajpur Rd)',
    category: 'Relocation Center',
    coords: [30.3190, 78.0370],   // 0.54 km from Rampur Nagar
    capacity: '2,000 evacuees',
    medicalSupport: 'NDRF Base, Emergency Bedding & Heating',
    contact: '1070',
    doctorCount: 7,
    bedsAvailable: 350,
    state: 'Uttarakhand'
  },
  {
    id: 'fac-uk-3',
    name: 'Karanpur Mountain Emergency Clinic',
    category: 'Medic Post',
    coords: [30.3180, 78.0350],   // 0.32 km from Rampur Nagar
    capacity: '150 patients/day',
    medicalSupport: 'Hypothermia & Fracture Stabilization',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15,
    state: 'Uttarakhand'
  },

  // --- 4. GOPALPUR [19.2600, 84.9000] — Ganjam, Odisha ---
  {
    id: 'fac-od-1',
    name: 'MKCG Govt Medical College (Berhampur)',
    category: 'Hospital',
    coords: [19.2800, 84.8780],   // 3.21 km from Gopalpur
    capacity: '1,100 beds',
    medicalSupport: 'Coastal Trauma, Critical Care & Surgery',
    contact: '108 / 0680-2292746',
    doctorCount: 55,
    bedsAvailable: 95,
    state: 'Odisha'
  },
  {
    id: 'fac-od-2',
    name: 'Gopalpur Multi-Purpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [19.2630, 84.9020],   // 0.39 km from Gopalpur
    capacity: '4,000 evacuees',
    medicalSupport: 'Reinforced Cyclone Bunker & Water Tanks',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 700,
    state: 'Odisha'
  },
  {
    id: 'fac-od-3',
    name: 'Gopalpur Port Primary Health Centre',
    category: 'Medic Post',
    coords: [19.2620, 84.9010],   // 0.25 km from Gopalpur
    capacity: '120 patients/day',
    medicalSupport: 'Coastal Emergency Triage',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 18,
    state: 'Odisha'
  },

  // --- 5. SUNDARBAN GHAT [21.9497, 88.9007] — South 24 Parganas, WB ---
  {
    id: 'fac-wb-1',
    name: 'Canning Sub-Divisional Emergency Hospital',
    category: 'Hospital',
    coords: [21.9720, 88.8840],   // 3.02 km from Sundarban Ghat
    capacity: '450 beds',
    medicalSupport: 'Snakebite, Waterborne Trauma & ICU',
    contact: '108 / 03218-255255',
    doctorCount: 28,
    bedsAvailable: 85,
    state: 'West Bengal'
  },
  {
    id: 'fac-wb-2',
    name: 'Gosaba Multipurpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [21.9540, 88.9060],   // 0.73 km from Sundarban Ghat
    capacity: '3,500 evacuees',
    medicalSupport: 'High-Plinth Flood Refuge & First-Aid',
    contact: '03218-236203 / 1077',
    doctorCount: 5,
    bedsAvailable: 420,
    state: 'West Bengal'
  },
  {
    id: 'fac-wb-3',
    name: 'Basanti Block Primary Health Centre',
    category: 'Medic Post',
    coords: [21.9520, 88.9030],   // 0.35 km from Sundarban Ghat
    capacity: '150 patients/day',
    medicalSupport: 'Triage & Rapid Antivenom Administration',
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

  // --- 6. VASANT VIHAR [17.6868, 83.2185] — Visakhapatnam, AP ---
  {
    id: 'fac-ap-1',
    name: 'King George Govt Hospital (Vizag)',
    category: 'Hospital',
    coords: [17.7020, 83.2380],   // 2.67 km from Vasant Vihar
    capacity: '1,200 beds',
    medicalSupport: 'Level-1 Coastal Trauma & Critical Care',
    contact: '108 / 0891-2564891',
    doctorCount: 60,
    bedsAvailable: 110,
    state: 'Andhra Pradesh'
  },
  {
    id: 'fac-ap-2',
    name: 'Gajuwaka Cyclone Relief Shelter',
    category: 'Relocation Center',
    coords: [17.6900, 83.2230],   // 0.59 km from Vasant Vihar
    capacity: '2,500 evacuees',
    medicalSupport: 'Disaster Shelter & High-Plinth Hall',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 450,
    state: 'Andhra Pradesh'
  },
  {
    id: 'fac-ap-3',
    name: 'Steel Plant Primary Health (Medic)',
    category: 'Medic Post',
    coords: [17.6890, 83.2200],   // 0.29 km from Vasant Vihar
    capacity: '350 patients/day',
    medicalSupport: 'Industrial & Urban Triage Center',
    contact: '102',
    doctorCount: 8,
    bedsAvailable: 35,
    state: 'Andhra Pradesh'
  },

  // --- 7. VADODARA CONTROL BASE [22.3072, 73.1812] — Gujarat ---
  {
    id: 'fac-gj-1',
    name: 'SSG Hospital & Trauma Center (Vadodara)',
    category: 'Hospital',
    coords: [22.3180, 73.1930],   // 2.0 km from base
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma, Burn Unit & ICU',
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
    medicalSupport: 'Community Kitchen & SDRF Base Unit',
    contact: '1070 / 0265-2422106',
    doctorCount: 12,
    bedsAvailable: 850,
    state: 'Gujarat'
  },
  {
    id: 'fac-gj-3',
    name: 'Akota Urban Emergency Clinic',
    category: 'Medic Post',
    coords: [22.3090, 73.1840],   // 0.4 km from base
    capacity: '250 patients/day',
    medicalSupport: 'Heatstroke Hydration & Triage',
    contact: '102',
    doctorCount: 10,
    bedsAvailable: 30,
    state: 'Gujarat'
  },
  {
    id: 'fac-gj-4',
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
    id: 'fac-gj-5',
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

  // --- UTTARAKHAND APEX REFERRAL ---
  {
    id: 'fac-uk-4',
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

  // --- ODISHA APEX REFERRAL ---
  {
    id: 'fac-od-4',
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