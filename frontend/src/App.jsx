import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5000/api/habitations';
const SOS_API = 'http://localhost:5000/api/sos';
const FACILITIES_API = 'http://localhost:5000/api/facilities';
const DASHBOARD_API = 'http://localhost:5000/api/dashboard/prediction-summary';
const HOTSPOTS_API = 'http://localhost:5000/api/sos/hotspots';

const HABITATION_COORDS = {
  'Kotla Basti': [25.3176, 82.9739],
  'Chandpur Colony': [25.5941, 85.1376],
  'Rampur Nagar': [30.3165, 78.0322],
  'Gopalpur': [19.2600, 84.9000],
  'Sundarban Ghat': [21.9497, 88.9007],
  'Vasant Vihar': [17.6868, 83.2185],
  'Kathmandu Valley': [27.6850, 85.3150],
  'Chooralmala (Wayanad)': [11.5450, 76.1550]
};

const INITIAL_FACILITIES = [
  // --- 1. KOTLA BASTI [25.3176, 82.9739] (Varanasi, UP) ---
  {
    id: 'fac-up-1',
    name: 'Chowk Urban Primary Health Centre',
    category: 'Medic Post',
    coords: [25.3140, 82.9780],   // ~0.57 km SE
    capacity: '200 patients/day',
    medicalSupport: 'First-Aid & Epidemic Prevention',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 25
  },
  {
    id: 'fac-up-2',
    name: 'Sigra Red Cross Emergency Post',
    category: 'Medic Post',
    coords: [25.3130, 82.9670],   // ~0.86 km SW
    capacity: '180 patients/day',
    medicalSupport: 'Trauma Stabilization & Bandaging',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-up-3',
    name: 'Lahurabir Mobile First-Aid Post',
    category: 'Medic Post',
    coords: [25.3210, 82.9790],   // ~0.64 km NE
    capacity: '150 patients/day',
    medicalSupport: 'ORS, Oxygen & Wound Care',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15
  },
  {
    id: 'fac-up-4',
    name: 'Varanasi District Flood Relief Shelter',
    category: 'Relocation Center',
    coords: [25.3220, 82.9810],   // ~0.87 km ENE
    capacity: '3,000 evacuees',
    medicalSupport: 'Community Kitchen & Relief Camp',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 600
  },
  {
    id: 'fac-up-5',
    name: 'Sampurnanand Stadium Evacuation Camp',
    category: 'Relocation Center',
    coords: [25.3195, 82.9660],   // ~0.82 km WNW
    capacity: '2,500 evacuees',
    medicalSupport: 'High-Ground Tents & Relief Supplies',
    contact: '1077',
    doctorCount: 4,
    bedsAvailable: 450
  },
  {
    id: 'fac-up-6',
    name: 'Pandit Deendayal Upadhyay Govt Hospital',
    category: 'Hospital',
    coords: [25.3280, 82.9680],   // ~1.30 km NNW
    capacity: '650 beds',
    medicalSupport: 'Emergency Casualty & Surgery Wing',
    contact: '108 / 0542-2508101',
    doctorCount: 40,
    bedsAvailable: 65
  },
  {
    id: 'fac-up-7',
    name: 'Sir Sunderlal Hospital (BHU)',
    category: 'Hospital',
    coords: [25.3050, 82.9870],   // ~1.92 km SSE
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma & Critical Care Unit',
    contact: '108 / 0542-2307500',
    doctorCount: 75,
    bedsAvailable: 110
  },

  // --- 2. CHANDPUR COLONY [25.5941, 85.1376] (Patna, Bihar) ---
  {
    id: 'fac-br-1',
    name: 'Rajendra Nagar Urban Health Clinic',
    category: 'Medic Post',
    coords: [25.5970, 85.1410],   // ~0.47 km NE
    capacity: '180 patients/day',
    medicalSupport: 'ORS, Triage & First-Aid',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-br-2',
    name: 'Kankarbagh Sector-3 Emergency Clinic',
    category: 'Medic Post',
    coords: [25.5910, 85.1420],   // ~0.56 km SE
    capacity: '220 patients/day',
    medicalSupport: 'Waterborne Triage & Injections',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 25
  },
  {
    id: 'fac-br-3',
    name: 'Mithapur First-Aid Station',
    category: 'Medic Post',
    coords: [25.5960, 85.1320],   // ~0.60 km NW
    capacity: '160 patients/day',
    medicalSupport: 'Emergency Dressing & IV Fluids',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 18
  },
  {
    id: 'fac-br-4',
    name: 'Patna State Evacuation Complex (Kankarbagh)',
    category: 'Relocation Center',
    coords: [25.6010, 85.1450],   // ~1.07 km NNE
    capacity: '4,500 evacuees',
    medicalSupport: 'SDRF Relief Unit & Clean Water Station',
    contact: '1070',
    doctorCount: 8,
    bedsAvailable: 800
  },
  {
    id: 'fac-br-5',
    name: 'Mithapur Community Relief Shelter',
    category: 'Relocation Center',
    coords: [25.5900, 85.1330],   // ~0.65 km SW
    capacity: '2,800 evacuees',
    medicalSupport: 'Disaster Refuge & Community Kitchen',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 500
  },
  {
    id: 'fac-br-6',
    name: 'Nalanda Medical College & Hospital (NMCH)',
    category: 'Hospital',
    coords: [25.5920, 85.1550],   // ~1.76 km E
    capacity: '900 beds',
    medicalSupport: 'Flood Casualty & Trauma ICU',
    contact: '108 / 0612-2354500',
    doctorCount: 55,
    bedsAvailable: 90
  },
  {
    id: 'fac-br-7',
    name: 'PMCH Emergency Wing (Patna Medical College)',
    category: 'Hospital',
    coords: [25.6080, 85.1540],   // ~2.26 km NE
    capacity: '2,000 beds',
    medicalSupport: 'Flood Inundation Trauma & Surgery',
    contact: '108 / 0612-2300080',
    doctorCount: 90,
    bedsAvailable: 140
  },

  // --- 3. RAMPUR NAGAR [30.3165, 78.0322] (Dehradun, Uttarakhand) ---
  {
    id: 'fac-uk-1',
    name: 'Karanpur Mountain Emergency Clinic',
    category: 'Medic Post',
    coords: [30.3180, 78.0350],   // ~0.32 km NE
    capacity: '150 patients/day',
    medicalSupport: 'Hypothermia & Fracture Stabilization',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15
  },
  {
    id: 'fac-uk-2',
    name: 'Dalanwala First-Aid Triage Station',
    category: 'Medic Post',
    coords: [30.3130, 78.0380],   // ~0.68 km SE
    capacity: '180 patients/day',
    medicalSupport: 'Splints, Burns & Debris Triage',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-uk-3',
    name: 'Bindal Bridge Rapid Medic Unit',
    category: 'Medic Post',
    coords: [30.3200, 78.0260],   // ~0.71 km NW
    capacity: '130 patients/day',
    medicalSupport: 'Flash-Flood First Response',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 14
  },
  {
    id: 'fac-uk-4',
    name: 'State Landslide Evacuation Center (Rajpur Rd)',
    category: 'Relocation Center',
    coords: [30.3190, 78.0370],   // ~0.54 km ENE
    capacity: '2,000 evacuees',
    medicalSupport: 'NDRF Base, Emergency Bedding & Heating',
    contact: '1070',
    doctorCount: 7,
    bedsAvailable: 350
  },
  {
    id: 'fac-uk-5',
    name: 'Parade Ground Emergency Shelter',
    category: 'Relocation Center',
    coords: [30.3220, 78.0310],   // ~0.62 km N
    capacity: '3,000 evacuees',
    medicalSupport: 'Large-Capacity Relief Dome & Kitchen',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 600
  },
  {
    id: 'fac-uk-6',
    name: 'Coronation District Hospital',
    category: 'Hospital',
    coords: [30.3110, 78.0450],   // ~1.38 km ESE
    capacity: '450 beds',
    medicalSupport: 'Emergency Debris Trauma Care',
    contact: '108 / 0135-2656100',
    doctorCount: 35,
    bedsAvailable: 50
  },
  {
    id: 'fac-uk-7',
    name: 'Doon Govt Medical College & Hospital',
    category: 'Hospital',
    coords: [30.3260, 78.0440],   // ~1.55 km NE
    capacity: '800 beds',
    medicalSupport: 'Mountain Debris Trauma & Orthopedic Care',
    contact: '108 / 0135-2726020',
    doctorCount: 45,
    bedsAvailable: 70
  },

  // --- 4. GOPALPUR [19.2600, 84.9000] (Ganjam, Odisha) ---
  {
    id: 'fac-od-1',
    name: 'Gopalpur Port Primary Health Centre',
    category: 'Medic Post',
    coords: [19.2620, 84.9010],   // ~0.25 km NE
    capacity: '120 patients/day',
    medicalSupport: 'Coastal Emergency Triage',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 18
  },
  {
    id: 'fac-od-2',
    name: 'Haripur Coastal Health Clinic',
    category: 'Medic Post',
    coords: [19.2560, 84.8960],   // ~0.61 km SW
    capacity: '140 patients/day',
    medicalSupport: 'Emergency IV Fluids & Shock Treatment',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 16
  },
  {
    id: 'fac-od-3',
    name: 'Arjipalli Fishermen Medic Outpost',
    category: 'Medic Post',
    coords: [19.2670, 84.8970],   // ~0.84 km NW
    capacity: '110 patients/day',
    medicalSupport: 'Drowning Rescue & Oxygen Post',
    contact: '102',
    doctorCount: 3,
    bedsAvailable: 12
  },
  {
    id: 'fac-od-4',
    name: 'Gopalpur Multi-Purpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [19.2630, 84.9020],   // ~0.39 km NE
    capacity: '4,000 evacuees',
    medicalSupport: 'Reinforced Cyclone Bunker & Water Tanks',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 700
  },
  {
    id: 'fac-od-5',
    name: 'Coastal Evacuation & Relief Camp',
    category: 'Relocation Center',
    coords: [19.2580, 84.9050],   // ~0.57 km SE
    capacity: '2,200 evacuees',
    medicalSupport: 'High-Elevation Disaster Refuge',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 400
  },
  {
    id: 'fac-od-6',
    name: 'City Hospital Berhampur (Emergency Block)',
    category: 'Hospital',
    coords: [19.2740, 84.8850],   // ~2.21 km NW
    capacity: '500 beds',
    medicalSupport: 'Disaster Inundation Casualty Ward',
    contact: '108 / 0680-2223100',
    doctorCount: 38,
    bedsAvailable: 60
  },
  {
    id: 'fac-od-7',
    name: 'MKCG Govt Medical College (Berhampur)',
    category: 'Hospital',
    coords: [19.2800, 84.8780],   // ~3.21 km NW
    capacity: '1,100 beds',
    medicalSupport: 'Coastal Trauma, Critical Care & Surgery',
    contact: '108 / 0680-2292746',
    doctorCount: 55,
    bedsAvailable: 95
  },

  // --- 5. SUNDARBAN GHAT [21.9497, 88.9007] (South 24 Parganas, WB) ---
  {
    id: 'fac-wb-1',
    name: 'Basanti Block Primary Health Centre',
    category: 'Medic Post',
    coords: [21.9520, 88.9030],   // ~0.35 km NE
    capacity: '150 patients/day',
    medicalSupport: 'Triage & Rapid Antivenom Administration',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 24
  },
  {
    id: 'fac-wb-2',
    name: 'Sonakhali Riverside Medic Post',
    category: 'Medic Post',
    coords: [21.9450, 88.8980],   // ~0.59 km SW
    capacity: '130 patients/day',
    medicalSupport: 'Water-Rescue Paramedic Team',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 18
  },
  {
    id: 'fac-wb-3',
    name: 'Gosaba Jetty Paramedic Outpost',
    category: 'Medic Post',
    coords: [21.9540, 88.8970],   // ~0.61 km NW
    capacity: '120 patients/day',
    medicalSupport: 'Emergency Resuscitation & First-Aid',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15
  },
  {
    id: 'fac-wb-4',
    name: 'Gosaba Multipurpose Cyclone Shelter',
    category: 'Relocation Center',
    coords: [21.9540, 88.9060],   // ~0.73 km ENE
    capacity: '3,500 evacuees',
    medicalSupport: 'High-Plinth Flood Refuge & First-Aid',
    contact: '03218-236203 / 1077',
    doctorCount: 5,
    bedsAvailable: 420
  },
  {
    id: 'fac-wb-5',
    name: 'Pakhirala Flood Refuge Center',
    category: 'Relocation Center',
    coords: [21.9460, 88.9070],   // ~0.77 km SE
    capacity: '2,000 evacuees',
    medicalSupport: 'Clean Water Station & Community Kitchen',
    contact: '1077',
    doctorCount: 4,
    bedsAvailable: 350
  },
  {
    id: 'fac-wb-6',
    name: 'Gosaba Rural Emergency Hospital',
    category: 'Hospital',
    coords: [21.9610, 88.9090],   // ~1.51 km NE
    capacity: '300 beds',
    medicalSupport: 'Snakebite, Flood Trauma & Minor OT',
    contact: '108 / 03218-236100',
    doctorCount: 22,
    bedsAvailable: 45
  },
  {
    id: 'fac-wb-7',
    name: 'Canning Sub-Divisional Emergency Hospital',
    category: 'Hospital',
    coords: [21.9720, 88.8840],   // ~3.02 km NW
    capacity: '450 beds',
    medicalSupport: 'Snakebite, Waterborne Trauma & ICU',
    contact: '108 / 03218-255255',
    doctorCount: 28,
    bedsAvailable: 85
  },

  // --- 6. VASANT VIHAR [17.6868, 83.2185] (Visakhapatnam, AP) ---
  {
    id: 'fac-ap-1',
    name: 'Steel Plant Primary Health (Medic)',
    category: 'Medic Post',
    coords: [17.6890, 83.2200],   // ~0.29 km NE
    capacity: '350 patients/day',
    medicalSupport: 'Industrial & Urban Triage Center',
    contact: '102',
    doctorCount: 8,
    bedsAvailable: 35
  },
  {
    id: 'fac-ap-2',
    name: 'Scindia Coastal First-Aid Dispensary',
    category: 'Medic Post',
    coords: [17.6830, 83.2230],   // ~0.64 km SE
    capacity: '180 patients/day',
    medicalSupport: 'Emergency Burn & Trauma Dressing',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-ap-3',
    name: 'Malkapuram Urban Health Post',
    category: 'Medic Post',
    coords: [17.6910, 83.2120],   // ~0.84 km NW
    capacity: '200 patients/day',
    medicalSupport: 'ORS, Oxygen & Minor Trauma',
    contact: '102',
    doctorCount: 5,
    bedsAvailable: 22
  },
  {
    id: 'fac-ap-4',
    name: 'Gajuwaka Cyclone Relief Shelter',
    category: 'Relocation Center',
    coords: [17.6900, 83.2230],   // ~0.59 km ENE
    capacity: '2,500 evacuees',
    medicalSupport: 'Disaster Shelter & High-Plinth Hall',
    contact: '1077',
    doctorCount: 6,
    bedsAvailable: 450
  },
  {
    id: 'fac-ap-5',
    name: 'Sriharipuram Community Evacuation Hall',
    category: 'Relocation Center',
    coords: [17.6820, 83.2140],   // ~0.72 km SW
    capacity: '2,000 evacuees',
    medicalSupport: 'Emergency Bedding & Feeding Center',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 380
  },
  {
    id: 'fac-ap-6',
    name: 'INS Kalyani Naval & Disaster Hospital',
    category: 'Hospital',
    coords: [17.6960, 83.2290],   // ~1.49 km ENE
    capacity: '600 beds',
    medicalSupport: 'Naval Disaster Trauma & Critical Care',
    contact: '108 / 0891-2812000',
    doctorCount: 45,
    bedsAvailable: 75
  },
  {
    id: 'fac-ap-7',
    name: 'King George Govt Hospital (Vizag)',
    category: 'Hospital',
    coords: [17.7020, 83.2380],   // ~2.67 km NE
    capacity: '1,200 beds',
    medicalSupport: 'Level-1 Coastal Trauma & Critical Care',
    contact: '108 / 0891-2564891',
    doctorCount: 60,
    bedsAvailable: 110
  },

  // --- 7. VADODARA CONTROL BASE [22.3072, 73.1812] (Gujarat) ---
  {
    id: 'fac-gj-1',
    name: 'Akota Urban Emergency Clinic',
    category: 'Medic Post',
    coords: [22.3090, 73.1840],   // ~0.36 km NE
    capacity: '250 patients/day',
    medicalSupport: 'Heatstroke Hydration & Triage',
    contact: '102',
    doctorCount: 10,
    bedsAvailable: 30
  },
  {
    id: 'fac-gj-2',
    name: 'Sayajigunj Red Cross First-Aid Post',
    category: 'Medic Post',
    coords: [22.3120, 73.1800],   // ~0.54 km N
    capacity: '200 patients/day',
    medicalSupport: 'Mobile Paramedic & Dressing Station',
    contact: '102',
    doctorCount: 6,
    bedsAvailable: 20
  },
  {
    id: 'fac-gj-3',
    name: 'Vadodara Central Emergency Shelter',
    category: 'Relocation Center',
    coords: [22.3072, 73.1812],
    capacity: '5,000 evacuees',
    medicalSupport: 'Community Kitchen & SDRF Base Unit',
    contact: '1070 / 0265-2422106',
    doctorCount: 12,
    bedsAvailable: 850
  },
  {
    id: 'fac-gj-4',
    name: 'Polo Ground Disaster Refuge Camp',
    category: 'Relocation Center',
    coords: [22.3020, 73.1860],   // ~0.76 km SE
    capacity: '3,500 evacuees',
    medicalSupport: 'Open-Air Relief Distribution Dome',
    contact: '1077',
    doctorCount: 8,
    bedsAvailable: 550
  },
  {
    id: 'fac-gj-5',
    name: 'GMERS Gotri Govt Hospital',
    category: 'Hospital',
    coords: [22.3150, 73.1650],   // ~1.87 km WNW
    capacity: '750 beds',
    medicalSupport: 'Emergency Casualty & Burn ICU',
    contact: '108 / 0265-2398000',
    doctorCount: 50,
    bedsAvailable: 80
  },
  {
    id: 'fac-gj-6',
    name: 'SSG Hospital & Trauma Center (Vadodara)',
    category: 'Hospital',
    coords: [22.3180, 73.1930],   // ~1.72 km NE
    capacity: '1,500 beds',
    medicalSupport: 'Level-1 Trauma, Burn Unit & ICU',
    contact: '108 / 0265-2424848',
    doctorCount: 85,
    bedsAvailable: 120
  },

  // --- 8. KATHMANDU VALLEY [27.6850, 85.3150] (Bagmati Basin, Nepal) ---
  {
    id: 'fac-np-1',
    name: 'Patan Urban Emergency Health Post',
    category: 'Medic Post',
    coords: [27.6790, 85.3210],   // ~0.88 km SE
    capacity: '200 patients/day',
    medicalSupport: 'Water-Rescue Triage & First-Aid',
    contact: '+977-1-5522295 / 102',
    doctorCount: 6,
    bedsAvailable: 25
  },
  {
    id: 'fac-np-2',
    name: 'Balkhu Riverfront First-Aid Clinic',
    category: 'Medic Post',
    coords: [27.6870, 85.3040],   // ~1.10 km WNW
    capacity: '180 patients/day',
    medicalSupport: 'Emergency IV Fluids & Shock Treatment',
    contact: '+977-1-4271890 / 102',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-np-3',
    name: 'Teku Emergency Communicable Disease Post',
    category: 'Medic Post',
    coords: [27.6940, 85.3080],   // ~1.22 km NNW
    capacity: '250 patients/day',
    medicalSupport: 'Waterborne Epidemic & Wound Care',
    contact: '+977-1-4253396',
    doctorCount: 7,
    bedsAvailable: 30
  },
  {
    id: 'fac-np-4',
    name: 'Kathmandu Disaster Relief & Shelter Dome',
    category: 'Relocation Center',
    coords: [27.6910, 85.3220],   // ~0.95 km NE
    capacity: '4,000 evacuees',
    medicalSupport: 'Community Kitchen & Nepal Army Relief Base',
    contact: '+977-1-4221447 / 1149',
    doctorCount: 8,
    bedsAvailable: 750
  },
  {
    id: 'fac-np-5',
    name: 'Jawalakhel Community Evacuation Camp',
    category: 'Relocation Center',
    coords: [27.6720, 85.3120],   // ~1.47 km S
    capacity: '3,000 evacuees',
    medicalSupport: 'Nepal Red Cross Relief Camp & Clean Water',
    contact: '+977-1-5521048',
    doctorCount: 6,
    bedsAvailable: 500
  },
  {
    id: 'fac-np-6',
    name: 'Bir Hospital Emergency & Trauma Center',
    category: 'Hospital',
    coords: [27.7040, 85.3130],   // ~2.12 km N
    capacity: '1,200 beds',
    medicalSupport: 'Apex National Disaster Trauma & Surgery',
    contact: '+977-1-4221119 / 102',
    doctorCount: 85,
    bedsAvailable: 120
  },
  {
    id: 'fac-np-7',
    name: 'Patan Hospital & Emergency Wing',
    category: 'Hospital',
    coords: [27.6680, 85.3210],   // ~1.98 km SSE
    capacity: '850 beds',
    medicalSupport: 'Level-1 Disaster Trauma & Critical Care',
    contact: '+977-1-5522278',
    doctorCount: 65,
    bedsAvailable: 95
  },

  // --- 9. CHOORALMALA (WAYANAD) [11.5450, 76.1550] (Wayanad, Kerala) ---
  {
    id: 'fac-wy-1',
    name: 'Chooralmala Rapid First-Aid Post',
    category: 'Medic Post',
    coords: [11.5420, 76.1580],   // ~0.46 km SE
    capacity: '160 patients/day',
    medicalSupport: 'Debris Trauma, Splints & Hypothermia',
    contact: '102 / 04936-255100',
    doctorCount: 5,
    bedsAvailable: 20
  },
  {
    id: 'fac-wy-2',
    name: 'Vellarmala Rescue Paramedic Unit',
    category: 'Medic Post',
    coords: [11.5490, 76.1510],   // ~0.62 km NW
    capacity: '140 patients/day',
    medicalSupport: 'Indian Army & NDRF First-Response Post',
    contact: '102',
    doctorCount: 4,
    bedsAvailable: 15
  },
  {
    id: 'fac-wy-3',
    name: 'Meppadi Primary Health Centre',
    category: 'Medic Post',
    coords: [11.5480, 76.1420],   // ~1.45 km W
    capacity: '220 patients/day',
    medicalSupport: 'Triage, Oxygen & Emergency Dressing',
    contact: '102 / 04936-282250',
    doctorCount: 6,
    bedsAvailable: 25
  },
  {
    id: 'fac-wy-4',
    name: 'Chooralmala Community Relief Hall',
    category: 'Relocation Center',
    coords: [11.5430, 76.1520],   // ~0.40 km SW
    capacity: '2,000 evacuees',
    medicalSupport: 'Emergency Evacuation & Feeding Camp',
    contact: '1077',
    doctorCount: 5,
    bedsAvailable: 350
  },
  {
    id: 'fac-wy-5',
    name: 'Meppadi Higher Secondary Disaster Camp',
    category: 'Relocation Center',
    coords: [11.5500, 76.1400],   // ~1.72 km WNW
    capacity: '3,500 evacuees',
    medicalSupport: 'Central SDRF Relief Shelter & Family Tents',
    contact: '1077 / 04936-282100',
    doctorCount: 8,
    bedsAvailable: 600
  },
  {
    id: 'fac-wy-6',
    name: 'Wayanad Medical College & Trauma Unit',
    category: 'Hospital',
    coords: [11.5550, 76.1360],   // ~2.35 km WNW
    capacity: '700 beds',
    medicalSupport: 'Multi-Specialty Mountain Trauma & Surgery',
    contact: '108 / 04936-220000',
    doctorCount: 50,
    bedsAvailable: 90
  },
  {
    id: 'fac-wy-7',
    name: 'Wayanad District Disaster Relief Hospital',
    category: 'Hospital',
    coords: [11.5620, 76.1280],   // ~3.5 km NW
    capacity: '500 beds',
    medicalSupport: 'Level-1 Crush Injury & ICU Unit',
    contact: '108 / 04936-202221',
    doctorCount: 40,
    bedsAvailable: 75
  }
];

const FACILITY_THEMES = {
  'Relocation Center': { color: '#059669', icon: '🛡️', badgeBg: '#ecfdf5', badgeColor: '#047857' },
  'Hospital': { color: '#2563eb', icon: '🏥', badgeBg: '#eff6ff', badgeColor: '#1d4ed8' },
  'Medic Post': { color: '#0891b2', icon: '🩺', badgeBg: '#ecfeff', badgeColor: '#0e7490' },
  'Rescue Unit': { color: '#ea580c', icon: '🚤', badgeBg: '#fff7ed', badgeColor: '#c2410c' },
  'Relief Depot': { color: '#8b5cf6', icon: '📦', badgeBg: '#f5f3ff', badgeColor: '#6d28d9' }
};

// Map string hazards to appropriate dynamic emojis
const getHazardConfig = (type = '') => {
  const lower = type.toLowerCase();
  if (lower.includes('wildfire') || lower.includes('fire')) return '🔥';
  if (lower.includes('landslide')) return '⛰️';
  if (lower.includes('cyclone')) return '🌪️';
  if (lower.includes('earthquake')) return '🌍';
  if (lower.includes('tsunami')) return '🌊';
  if (lower.includes('lightning') || lower.includes('storm')) return '⚡';
  if (lower.includes('heat')) return '☀️';
  if (lower.includes('flood') || lower.includes('erosion')) return '🌊';
  return '⚠️'; // Default Warning
};

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// India mainland boundary polygon for strict territorial validation (rejects China/Tibet, Pakistan, Nepal, etc.)
const INDIA_BORDER_POLYGON = [
  [37.05, 74.50], [35.50, 77.00], [35.50, 79.50], [34.00, 79.00],
  [32.80, 78.50], [31.50, 78.80], [31.10, 80.80],
  [30.20, 80.60], [28.80, 80.10], [28.30, 81.30], [27.50, 82.50], [27.00, 84.00], [26.50, 85.50], [26.40, 87.30], [26.80, 88.10],
  [27.10, 88.10], [28.10, 88.60], [27.80, 88.90], [27.10, 88.90],
  [26.70, 89.80], [26.80, 91.50], [27.30, 91.80],
  [27.80, 91.80], [28.60, 93.50], [29.40, 95.00], [28.20, 97.00], [28.00, 97.40],
  [27.00, 96.50], [26.00, 95.20], [24.50, 94.50], [23.50, 93.30], [22.00, 93.00], [21.50, 92.50],
  [23.00, 91.50], [24.00, 91.50], [25.10, 91.80], [25.20, 89.80], [26.00, 89.80], [26.00, 88.20],
  [25.00, 87.80], [24.00, 88.20], [22.50, 89.20], [21.50, 87.50], [19.80, 86.20], [17.50, 84.00],
  [16.00, 82.50], [14.00, 80.50], [13.00, 80.40], [10.00, 80.00], [9.20, 79.40], [8.08, 77.55],
  [9.00, 76.50], [11.00, 75.60], [13.00, 74.50], [15.00, 73.60], [17.00, 73.00], [19.00, 72.60],
  [21.00, 72.40], [20.80, 70.60], [22.40, 68.80], [23.80, 68.10], [24.50, 68.60],
  [24.80, 71.00], [26.00, 70.30], [27.50, 69.80], [29.00, 71.50], [30.50, 73.80], [32.00, 74.80],
  [33.00, 74.00], [34.50, 73.80], [36.00, 73.50], [37.05, 74.50]
];

function isInsideIndia(lat, lng) {
  // Cross-border regional coverage includes India & Nepal
  if (lat >= 26.3 && lat <= 30.5 && lng >= 80.0 && lng <= 88.25) return true; // Nepal coverage
  if (lat < 8.0 || lat > 37.1 || lng < 68.0 || lng > 97.5) return false;
  let inside = false;
  for (let i = 0, j = INDIA_BORDER_POLYGON.length - 1; i < INDIA_BORDER_POLYGON.length; j = i++) {
    const xi = INDIA_BORDER_POLYGON[i][0], yi = INDIA_BORDER_POLYGON[i][1];
    const xj = INDIA_BORDER_POLYGON[j][0], yj = INDIA_BORDER_POLYGON[j][1];
    const intersect = ((yi > lng) !== (yj > lng)) && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// Operational threshold: disaster havens beyond 50 km are outside local emergency response range
const MAX_EVACUATION_DISTANCE_KM = 50;

export function getRiskExplanation(hab) {
  if (!hab) return { short: '', detailed: '', drivers: [], primaryDriver: '', secondaryDriver: '' };

  const name = hab.name || 'This settlement';
  const risk = hab.riskLevel || 'Moderate';
  const hazard = hab.hazardType || 'hazard';

  let breakdown = hab.scoreBreakdown;
  if (!breakdown) {
    const isCrit = risk === 'Critical';
    const isHigh = risk === 'High';
    const rawExposure = isCrit ? 9.6 : isHigh ? 8.5 : 5.0;
    const rawPop = isCrit ? 9.0 : isHigh ? 7.8 : 4.5;
    const rawInfra = isCrit ? 8.8 : isHigh ? 7.5 : 4.8;
    const rawCap = hab.carryingCapacityStatus === 'Exceeded' ? 9.5 : hab.carryingCapacityStatus === 'Near limit' ? 7.8 : 3.0;
    const safeCap = hab.carryingCapacityStatus === 'Exceeded' ? Math.round((hab.population || 3000) * 0.68) : (hab.population || 2000);
    const excess = hab.carryingCapacityStatus === 'Exceeded' ? (hab.population || 3000) - safeCap : 0;

    breakdown = {
      hazardExposure: { raw: rawExposure, weight: 0.35, weightedScore: +(rawExposure * 0.35).toFixed(2) },
      populationPressure: { raw: rawPop, weight: 0.25, weightedScore: +(rawPop * 0.25).toFixed(2) },
      infrastructureGap: { raw: rawInfra, weight: 0.20, weightedScore: +(rawInfra * 0.20).toFixed(2) },
      carryingCapacityGap: { raw: rawCap, weight: 0.20, weightedScore: +(rawCap * 0.20).toFixed(2), safeCapacity: safeCap, excessPopulation: excess }
    };
  }

  const { hazardExposure, populationPressure, infrastructureGap, carryingCapacityGap } = breakdown;
  const excessPop = carryingCapacityGap?.excessPopulation || 0;

  const capacityDetail = excessPop > 0 
    ? `critical land carrying capacity deficits (population exceeds safe threshold by ~${excessPop.toLocaleString()} residents)`
    : `land carrying capacity constraints`;

  const factors = [
    {
      id: 'hazardExposure',
      name: 'Hazard Exposure',
      phrase: `severe proximity to active ${hazard.toLowerCase()} zones (${hab.hazardDistance || 'high-risk perimeter'})`,
      shortPhrase: `acute ${hazard.toLowerCase()} exposure (${hab.hazardDistance || 'critical proximity'})`,
      weightedScore: hazardExposure?.weightedScore || 0,
      raw: hazardExposure?.raw || 0,
      weightPct: '35%'
    },
    {
      id: 'populationPressure',
      name: 'Population Density',
      phrase: `high density with ${hab.population ? hab.population.toLocaleString() : 'numerous'} residents located in vulnerable terrain`,
      shortPhrase: `dense population concentration (${hab.population ? hab.population.toLocaleString() : ''} residents)`,
      weightedScore: populationPressure?.weightedScore || 0,
      raw: populationPressure?.raw || 0,
      weightPct: '25%'
    },
    {
      id: 'carryingCapacityGap',
      name: 'Carrying Capacity Deficit',
      phrase: capacityDetail,
      shortPhrase: excessPop > 0 
        ? `safe capacity exceeded by ~${excessPop.toLocaleString()} people`
        : `carrying capacity pressure`,
      weightedScore: carryingCapacityGap?.weightedScore || 0,
      raw: carryingCapacityGap?.raw || 0,
      weightPct: '20%',
      excessPop
    },
    {
      id: 'infrastructureGap',
      name: 'Infrastructure Deficit',
      phrase: `critical deficits in evacuation roads and storm drainage`,
      shortPhrase: `severe infrastructure access deficits`,
      weightedScore: infrastructureGap?.weightedScore || 0,
      raw: infrastructureGap?.raw || 0,
      weightPct: '20%'
    }
  ];

  factors.sort((a, b) => b.weightedScore - a.weightedScore);
  const primary = factors[0];
  const secondary = factors[1];

  // Template variation using settlement name hash
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const templateIdx = hash % 3;

  const isWeatherElevated = hab.liveWeather?.isElevating !== false;
  const weatherPhrase = (hab.liveWeather && hab.liveWeather.rainfall24hMm > 0)
    ? `${hab.liveWeather.rainfall24hMm}mm rainfall forecasted in the next 24h`
    : (hab.liveWeather && hab.liveWeather.weatherSummaryText)
    ? hab.liveWeather.weatherSummaryText
    : '';

  let shortSentence = '';
  if (weatherPhrase) {
    if (templateIdx === 0) {
      shortSentence = `${name} is flagged ${risk} primarily due to ${primary.shortPhrase}, compounded by ${weatherPhrase}, alongside ${secondary.shortPhrase}.`;
    } else if (templateIdx === 1) {
      shortSentence = `${name}'s ${risk} risk level is driven predominantly by ${primary.shortPhrase}, aggravated by ${weatherPhrase}, alongside ${secondary.shortPhrase}.`;
    } else {
      shortSentence = `${name} is assigned to the ${risk} category largely on account of ${primary.shortPhrase}, alongside ${weatherPhrase} and ${secondary.shortPhrase}.`;
    }
  } else {
    if (templateIdx === 0) {
      shortSentence = `${name} is flagged ${risk} primarily due to ${primary.shortPhrase}, compounded by ${secondary.shortPhrase}.`;
    } else if (templateIdx === 1) {
      shortSentence = `${name}'s ${risk} risk level is driven predominantly by ${primary.shortPhrase}, aggravated by ${secondary.shortPhrase}.`;
    } else {
      shortSentence = `${name} is assigned to the ${risk} category largely on account of ${primary.shortPhrase}, alongside ${secondary.shortPhrase}.`;
    }
  }

  let detailedText = '';
  if (risk === 'Critical' || risk === 'High') {
    detailedText = `${name} is flagged under ${risk} priority because ${primary.phrase} represents the primary driver of its vulnerability index (${primary.weightedScore.toFixed(2)} pts). This exposure is significantly compounded by ${weatherPhrase || secondary.phrase}. `;
    if (excessPop > 0) {
      detailedText += `Because the local population exceeds safe geological carrying capacity by ~${excessPop.toLocaleString()} people, planned phased relocation and shelter decongestion are strongly flagged.`;
    } else {
      detailedText += `Targeted engineering mitigation and resilient evacuation corridors are required to curtail potential calamity impact.`;
    }
  } else {
    detailedText = `${name} maintains a ${risk} vulnerability profile as ${primary.shortPhrase} is buffered by manageable capacity and access margins. Continual sensor monitoring is maintained.`;
  }

  return {
    short: shortSentence,
    detailed: detailedText,
    primaryDriver: primary.name,
    secondaryDriver: secondary.name,
    factors
  };
}

function HazardMap({ habitations, sosRequests, facilities = INITIAL_FACILITIES, hotspots = [], isFull = false }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const overlayTileLayerRef = useRef(null);

  const habitationsLayerRef = useRef(null);
  const facilitiesLayerRef = useRef(null);
  const sosLayerRef = useRef(null);
  const hotspotsLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const userMarkerRef = useRef(null);
  const abortControllerRef = useRef(null);

  const [showHotspots, setShowHotspots] = useState(true);
  const [activeFacilityFilter, setActiveFacilityFilter] = useState('All');
  const [mapStyle, setMapStyle] = useState('streets');
  const [routeInfo, setRouteInfo] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [mapReady, setMapReady] = useState(0);

  const activeFacilityFilterRef = useRef(activeFacilityFilter);

  useEffect(() => {
    activeFacilityFilterRef.current = activeFacilityFilter;
  }, [activeFacilityFilter]);

  const applyTileLayers = useCallback((map, style) => {
    if (!map || !window.L) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
      tileLayerRef.current = null;
    }
    if (overlayTileLayerRef.current) {
      map.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    if (style === 'satellite') {
      // 1. High-resolution Satellite Imagery Base (Esri World Imagery)
      const baseSatellite = window.L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          crossOrigin: true,
          attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics'
        }
      );
      baseSatellite.addTo(map);
      tileLayerRef.current = baseSatellite;

      // 2. High-contrast Reference Overlay (City/Town Names, Borders & Places)
      // Placed in tilePane so it renders below markers and vector routes
      const labelsOverlay = window.L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          crossOrigin: true,
          pointerEvents: 'none',
          opacity: 0.95,
          attribution: '&copy; Esri Reference'
        }
      );

      // 3. Transportation Overlay (Highways and City Streets)
      const roadsOverlay = window.L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 19,
          crossOrigin: true,
          pointerEvents: 'none',
          opacity: 0.85
        }
      );

      const overlayGroup = window.L.layerGroup([labelsOverlay, roadsOverlay]);
      overlayGroup.addTo(map);
      overlayTileLayerRef.current = overlayGroup;
    } else {
      // Standard OpenStreetMap Streets (includes all cartography & place labels)
      const osmStreets = window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        crossOrigin: true,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });
      osmStreets.addTo(map);
      tileLayerRef.current = osmStreets;
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayers(mapInstanceRef.current, mapStyle);
    }
  }, [mapStyle, applyTileLayers]);

  const findNearestFacility = useCallback((lat, lng, targetCategory = 'All') => {
    const pool = targetCategory === 'All' 
      ? facilities 
      : facilities.filter(f => f.category === targetCategory);

    if (!pool || pool.length === 0) return null;

    let nearest = pool[0];
    let minDist = getDistanceKm(lat, lng, nearest.coords[0], nearest.coords[1]);

    for (let i = 1; i < pool.length; i++) {
      const d = getDistanceKm(lat, lng, pool[i].coords[0], pool[i].coords[1]);
      if (d < minDist) {
        minDist = d;
        nearest = pool[i];
      }
    }
    return {
      facility: nearest,
      distanceKm: minDist.toFixed(1),
      isOutOfRange: minDist > MAX_EVACUATION_DISTANCE_KM
    };
  }, [facilities]);

  // Added autoFitBounds flag to prevent jumping camera on manual clicks
  const drawRouteToFacility = useCallback(async (startLat, startLng, destCoords, label, category, autoFitBounds = true) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    // Safety guard: reject evacuation requests exceeding safe operational distance
    const directDist = getDistanceKm(startLat, startLng, destCoords[0], destCoords[1]);
    if (directDist > MAX_EVACUATION_DISTANCE_KM) {
      alert(`⚠️ Evacuation request exceeds safe operational distance (${directDist.toFixed(1)} km > 50 km).\nEmergency routes cannot be calculated across this distance. Please seek local shelter or contact Disaster Helpline (1070 / 112).`);
      setIsLoadingRoute(false);
      return;
    }

    if (map.closePopup) map.closePopup();
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setIsLoadingRoute(true);

    try {
      let coords = [];
      let distanceKm = 0;
      let durationMins = 0;
      let isWaterwayTransit = false;

      try {
        const osrmRes = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${destCoords[1]},${destCoords[0]}?overview=full&geometries=geojson`,
          { signal: abortControllerRef.current.signal }
        );

        if (osrmRes.ok) {
          const osrmData = await osrmRes.json();
          const route = osrmData.routes?.[0];
          if (route && route.geometry?.coordinates?.length > 0) {
            coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            distanceKm = (route.distance / 1000).toFixed(1);
            durationMins = Math.round(route.duration / 60);
          }
        }
      } catch (e) {
        // Silently caught if request was aborted
      }

      if (coords.length === 0) {
        coords = [
          [startLat, startLng],
          [destCoords[0], destCoords[1]]
        ];
        distanceKm = getDistanceKm(startLat, startLng, destCoords[0], destCoords[1]).toFixed(1);
        durationMins = Math.round((distanceKm / 20) * 60); 
        isWaterwayTransit = true;
      }

      if (coords.length > 0) {
        if (routeLayerRef.current) routeLayerRef.current.clearLayers();

        const routeOutline = window.L.polyline(coords, {
          color: isWaterwayTransit ? '#0284c7' : '#1a73e8',
          weight: 8,
          opacity: 0.9,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isWaterwayTransit ? '8, 8' : undefined
        });

        const routeCore = window.L.polyline(coords, {
          color: isWaterwayTransit ? '#38bdf8' : '#4285f4',
          weight: 5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round',
          dashArray: isWaterwayTransit ? '8, 8' : undefined
        });

        routeLayerRef.current.addLayer(routeOutline);
        routeLayerRef.current.addLayer(routeCore);

        // Only zoom and jump the camera if autoFitBounds is true
        if (autoFitBounds) {
          map.fitBounds(routeOutline.getBounds(), { padding: [50, 50], maxZoom: 14 });
        }

        setRouteInfo({
          targetName: label,
          category: isWaterwayTransit ? `${category} (Boat / Ferry Transit)` : (category || 'Evacuation Route'),
          distance: distanceKm,
          duration: durationMins,
          contact: '1070 / 108'
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('Routing error:', err);
    } finally {
      setIsLoadingRoute(false);
    }
  }, []);

  const drawRouteToFacilityRef = useRef(drawRouteToFacility);
  useEffect(() => {
    drawRouteToFacilityRef.current = drawRouteToFacility;
  }, [drawRouteToFacility]);

  useEffect(() => {
    window.__abhayaEvacuate = (startLat, startLng, destLat, destLng, name, category) => {
      if (drawRouteToFacilityRef.current) {
        drawRouteToFacilityRef.current(startLat, startLng, [destLat, destLng], name, category, true);
      }
    };
    return () => {
      delete window.__abhayaEvacuate;
    };
  }, []);

  useEffect(() => {
    window.__abhayaOpenWeatherPopup = (habName, e) => {
      if (e) {
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        if (e.cancelBubble !== undefined) e.cancelBubble = true;
      }
      const map = mapInstanceRef.current;
      if (!map || !window.L) return;

      const hab = habitations.find(h => h.name === habName);
      if (!hab || !hab.liveWeather) return;

      // Close any open popup to avoid overlapping / visual collision
      map.closePopup();

      const coords = HABITATION_COORDS[hab.name] || hab.coords || [21.0, 78.0];
      const w = hab.liveWeather;
      const bonus = w.elevationScoreBonus || 1;
      const baseScore = hab.baseVulnerabilityScore || Math.max(10, (hab.vulnerabilityScore || 70) - bonus);

      const weatherPopupHtml = `
        <div style="font-family: inherit; min-width: 220px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">
            <span style="font-size: 12px; font-weight: 800; color: #0369a1; display: flex; align-items: center; gap: 4px;">
              🌧️ Live Weather Impact
            </span>
            <span style="background: #e0f2fe; color: #0284c7; font-size: 10px; font-weight: 800; padding: 2px 6px; border-radius: 8px;">
              +${bonus} PTS
            </span>
          </div>
          
          <h4 style="margin: 0 0 2px; font-size: 13px; font-weight: 700; color: #0f172a;">${hab.name}</h4>
          <p style="margin: 0 0 8px; font-size: 11px; color: #64748b;">${hab.district} • ${hab.hazardType}</p>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;">
            <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #0369a1; text-transform: uppercase; font-weight: 700;">24h Forecast</div>
              <div style="font-size: 14px; font-weight: 800; color: #0284c7; font-family: var(--font-mono);">${w.rainfall24hMm} mm</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px;">
              <div style="font-size: 9px; color: #64748b; text-transform: uppercase; font-weight: 700;">Wind &amp; Temp</div>
              <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px;">${w.windSpeedKmH} km/h · ${w.temperatureC}°C</div>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 8px; font-size: 11px; line-height: 1.35; color: #334155;">
            <strong style="color: #0f172a; display: block; font-size: 10px; text-transform: uppercase; margin-bottom: 2px;">⚡ Score Elevation:</strong>
            Elevates vulnerability index from <strong>${baseScore}</strong> to <strong style="color: #dc2626;">${hab.vulnerabilityScore}/100</strong> due to live meteorological factors &amp; precipitation.
          </div>
        </div>
      `;

      window.L.popup({
        offset: [14, -18],
        maxWidth: 260,
        autoPan: true
      })
        .setLatLng(coords)
        .setContent(weatherPopupHtml)
        .openOn(map);
    };

    return () => {
      delete window.__abhayaOpenWeatherPopup;
    };
  }, [habitations]);

  const handleSetUserLocation = useCallback((lat, lng, label = 'Chosen Location', autoRoute = false) => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;

    if (!isInsideIndia(lat, lng)) {
      alert("⚠️ Emergency evacuation assistance is restricted to India & Nepal disaster monitoring coverage.\nSelected location is outside the operational boundary.");
      return;
    }

    if (userMarkerRef.current) map.removeLayer(userMarkerRef.current);

    const userMarker = window.L.circleMarker([lat, lng], {
      radius: 8,
      fillColor: '#4f46e5',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 1
    }).addTo(map);

    const res = findNearestFacility(lat, lng, activeFacilityFilterRef.current);

    let popupContent = `
      <div style="font-family: inherit; min-width: 220px; padding: 2px;">
        <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700;">📍 ${label}</h4>
        <p style="margin: 0 0 4px; font-size: 11px; color: #64748b;">${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E</p>
    `;

    if (!res || !res.facility || res.isOutOfRange) {
      const distText = res ? `${res.distanceKm} km` : 'N/A';
      popupContent += `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 6px; margin: 4px 0;">
          <p style="margin: 0; font-size: 11px; color: #b91c1c; font-weight: 700;">⚠️ Outside Haven Coverage Zone</p>
          <p style="margin: 3px 0 0; font-size: 10px; color: #7f1d1d; line-height: 1.3;">
            Nearest facility is <strong>${distText}</strong> away (exceeds 50 km emergency response radius). Stay sheltered locally or contact Emergency Helpline <strong>112 / 1070</strong>.
          </p>
        </div>
      `;
    } else {
      popupContent += `
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; padding: 6px; margin: 4px 0;">
          <p style="margin: 0; font-size: 11px; color: #15803d; font-weight: 700;">Nearest Haven: ${res.facility.name}</p>
          <p style="margin: 2px 0 0; font-size: 10px; color: #166534;">Category: ${res.facility.category} • Distance: <strong>${res.distanceKm} km</strong></p>
        </div>
        <button id="btn-user-evacuate" onclick="if(window.__abhayaEvacuate){window.__abhayaEvacuate(${lat}, ${lng}, ${res.facility.coords[0]}, ${res.facility.coords[1]}, '${res.facility.name.replace(/'/g, "\\'")}', '${res.facility.category}')}" style="background: #2563eb; color: #ffffff; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 700; width: 100%; margin-top: 4px;">
          🚗 Evacuate to ${res.facility.category} (${res.distanceKm} km)
        </button>
      `;
    }

    popupContent += `</div>`;

    const triggerEvacuate = () => {
      drawRouteToFacility(lat, lng, res.facility.coords, res.facility.name, res.facility.category, true);
    };

    // Attach popupopen listener BEFORE openPopup to prevent race condition
    userMarker.on('popupopen', () => {
      const btn = document.getElementById('btn-user-evacuate');
      if (btn && res?.facility && !res.isOutOfRange) {
        btn.onclick = triggerEvacuate;
      }
    });

    userMarker.bindPopup(popupContent, { maxWidth: 260 }).openPopup();
    userMarkerRef.current = userMarker;

    // Fallback: in case openPopup executes synchronously
    setTimeout(() => {
      const btn = document.getElementById('btn-user-evacuate');
      if (btn && res?.facility && !res.isOutOfRange) {
        btn.onclick = triggerEvacuate;
      }
    }, 20);

    if (autoRoute && res?.facility && !res.isOutOfRange) {
      drawRouteToFacility(lat, lng, res.facility.coords, res.facility.name, res.facility.category, true);
    }
  }, [findNearestFacility, drawRouteToFacility]);

  const focusIndiaView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    map.flyTo([22.5, 82.0], 5, { animate: true, duration: 1.2 });
  }, []);

  const resetMapView = useCallback(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.L) return;
    const points = [
      ...Object.values(HABITATION_COORDS),
      ...facilities.map(f => f.coords)
    ];
    if (points.length > 0) {
      map.fitBounds(window.L.latLngBounds(points), { padding: isFull ? [40, 40] : [10, 10] });
    }
  }, [facilities, isFull]);

  const handleSetUserLocationRef = useRef(handleSetUserLocation);
  handleSetUserLocationRef.current = handleSetUserLocation;

  const resetMapViewRef = useRef(resetMapView);
  resetMapViewRef.current = resetMapView;

  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    let resizeObserver = null;

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Restrict map panning specifically to India's coordinates
      const indiaBounds = window.L.latLngBounds(
        [6.0, 68.0], // Southwest (Kerala/Lakshadweep area)
        [37.2, 97.5] // Northeast (Kashmir/Arunachal area)
      );

      const map = window.L.map(mapContainerRef.current, {
        zoomControl: false,
        scrollWheelZoom: isFull,
        dragging: true,
        maxBounds: indiaBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 4
      });

      // Always add zoom controls (+ / -) to both full map and dashboard preview map
      window.L.control.zoom({ position: 'bottomright' }).addTo(map);

      if (isFull) {
        
        map.on('click', e => {
          const { lat, lng } = e.latlng;
          
          // Strict territorial validation using polygon
          if (!isInsideIndia(lat, lng)) {
            alert("⚠️ Emergency evacuation assistance is restricted to India & Nepal disaster monitoring coverage.\nSelected point is outside the operational boundary.");
            return;
          }
          
          if (handleSetUserLocationRef.current) {
            handleSetUserLocationRef.current(lat, lng, 'Selected Point', false);
          }
        });
      }

      mapInstanceRef.current = map;

      applyTileLayers(map, mapStyle);

      habitationsLayerRef.current = window.L.layerGroup().addTo(map);
      facilitiesLayerRef.current = window.L.layerGroup().addTo(map);
      sosLayerRef.current = window.L.layerGroup().addTo(map);
      hotspotsLayerRef.current = window.L.layerGroup().addTo(map);
      routeLayerRef.current = window.L.layerGroup().addTo(map);

      if (resetMapViewRef.current) {
        resetMapViewRef.current();
      }

      setMapReady(v => v + 1);

      resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 500);
    };

    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      if (mapInstanceRef.current) {
        if (tileLayerRef.current) mapInstanceRef.current.removeLayer(tileLayerRef.current);
        if (overlayTileLayerRef.current) mapInstanceRef.current.removeLayer(overlayTileLayerRef.current);
        if (hotspotsLayerRef.current) mapInstanceRef.current.removeLayer(hotspotsLayerRef.current);
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isFull]);

  useEffect(() => {
    const handleFocus = async (event) => {
      const sos = event.detail;
      const map = mapInstanceRef.current;
      if (!map || !sos) return;

      map.invalidateSize();
      map.flyTo(sos.coords, 15, { animate: true, duration: 1.2 });
      
      try {
        const res = await fetch(`http://localhost:5000/api/sos/${sos._id || sos.id}/dispatch-route`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          const { facility, targetCategory } = data.dispatchPlan;
          drawRouteToFacility(
            facility.coords[0],
            facility.coords[1],
            sos.coords,
            `Dispatch: ${facility.name} (${targetCategory}) ➔ ${sos.victimName}`,
            targetCategory,
            true
          );
          return;
        }
      } catch (err) {
        console.warn('Backend dispatch route failed, falling back to client triage:', err);
      }

      const norm = (sos.aidList || []).join(' ').toLowerCase();
      let cat = 'Hospital';
      if (norm.includes('boat') || norm.includes('raft') || norm.includes('debris') || norm.includes('earthmover')) cat = 'Rescue Unit';
      else if (norm.includes('water') || norm.includes('ration') || norm.includes('food')) cat = 'Relief Depot';
      else if (norm.includes('medical kit') || norm.includes('first-aid')) cat = 'Medic Post';

      const nearestHaven = findNearestFacility(sos.coords[0], sos.coords[1], cat) || findNearestFacility(sos.coords[0], sos.coords[1], 'All');
      const baseCoords = nearestHaven ? nearestHaven.facility.coords : [22.3072, 73.1812];
      drawRouteToFacility(baseCoords[0], baseCoords[1], sos.coords, `Dispatch to ${sos.victimName} (${cat})`, cat, true);
    };

    window.addEventListener('focus-sos-beacon', handleFocus);
    return () => window.removeEventListener('focus-sos-beacon', handleFocus);
  }, [findNearestFacility, drawRouteToFacility]);

  // Habitations Markers (Calamities)
  useEffect(() => {
    if (!habitationsLayerRef.current || !window.L) return;
    habitationsLayerRef.current.clearLayers();

    habitations.forEach(hab => {
      const coords = HABITATION_COORDS[hab.name] || [21.0, 78.0];
      const isCrit = hab.riskLevel === 'Critical';
      const hazardEmoji = getHazardConfig(hab.hazardType);
      const isWeatherElevated = hab.liveWeather?.isElevating;

      // Create visually distinct bouncing emoji markers (36x36px)
      const iconHtml = `<div class="marker-hazard ${isCrit ? 'critical' : 'high'}">${hazardEmoji}</div>`;
      
      const marker = window.L.marker(coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: iconHtml, iconSize: [36, 36], iconAnchor: [18, 18] }),
        zIndexOffset: isCrit ? 1100 : 1000 // Always render above Facilities
      });

      const explanation = getRiskExplanation(hab);

      let popupContent = `
        <div style="font-family: inherit; min-width: 220px; padding: 2px;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700;">${hab.name}</h4>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Zone:</strong> ${hab.district} (${hab.hazardType} ${hazardEmoji})</p>
          <p style="margin: 0 0 4px; font-size: 11px;"><strong>Risk:</strong> <span style="color:${isCrit ? '#dc2626' : '#f97316'}; font-weight:700;">${hab.riskLevel}</span> (${hab.vulnerabilityScore}/100)</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; margin: 6px 0; font-size: 11px; line-height: 1.35; color: #334155;">
            <strong style="color: #0f172a; display: block; margin-bottom: 2px;">💡 Why this score:</strong>
            ${explanation.short}
          </div>
      `;

      if (isFull) {
        popupContent += `
          <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 6px;">
            <button id="btn-rescue-${hab.name.replace(/\s+/g, '')}" style="background: #ea580c; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🚤 Route to Nearest Rescue Unit
            </button>
            <button id="btn-depot-${hab.name.replace(/\s+/g, '')}" style="background: #8b5cf6; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              📦 Route to Nearest Relief Depot
            </button>
            <button id="btn-shelter-${hab.name.replace(/\s+/g, '')}" style="background: #059669; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🛡️ Route to Nearest Shelter
            </button>
            <button id="btn-hospital-${hab.name.replace(/\s+/g, '')}" style="background: #2563eb; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🏥 Route to Nearest Hospital
            </button>
            <button id="btn-clinic-${hab.name.replace(/\s+/g, '')}" style="background: #0891b2; color: #fff; border: none; padding: 5px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 600;">
              🩺 Route to Nearest Clinic
            </button>
          </div>
        `;
      }
      popupContent += `</div>`;

      marker.bindPopup(popupContent, { maxWidth: 270 });

      if (isFull) {
        marker.on('popupopen', () => {
          const btnRescue = document.getElementById(`btn-rescue-${hab.name.replace(/\s+/g, '')}`);
          const btnDepot = document.getElementById(`btn-depot-${hab.name.replace(/\s+/g, '')}`);
          const btnShelter = document.getElementById(`btn-shelter-${hab.name.replace(/\s+/g, '')}`);
          const btnHosp = document.getElementById(`btn-hospital-${hab.name.replace(/\s+/g, '')}`);
          const btnClinic = document.getElementById(`btn-clinic-${hab.name.replace(/\s+/g, '')}`);

          if (btnRescue) {
            btnRescue.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Rescue Unit') || findNearestFacility(coords[0], coords[1], 'All');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category, true);
              }
            };
          }
          if (btnDepot) {
            btnDepot.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Relief Depot') || findNearestFacility(coords[0], coords[1], 'All');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category, true);
              }
            };
          }
          if (btnShelter) {
            btnShelter.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Relocation Center');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category, true);
              }
            };
          }
          if (btnHosp) {
            btnHosp.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Hospital');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category, true);
              }
            };
          }
          if (btnClinic) {
            btnClinic.onclick = () => {
              const res = findNearestFacility(coords[0], coords[1], 'Medic Post');
              if (res?.facility) {
                drawRouteToFacility(coords[0], coords[1], res.facility.coords, res.facility.name, res.facility.category, true);
              }
            };
          }
        });
      }

      habitationsLayerRef.current.addLayer(marker);

      // Dedicated Companion Weather Marker (30x30px prominent circle, visible at normal zoom) on all natural calamity sites
      if (hab.liveWeather) {
        const weatherHtml = `
          <div 
            class="marker-weather" 
            title="Live Weather Impact: ${hab.liveWeather.rainfall24hMm}mm rainfall (+${hab.liveWeather.elevationScoreBonus || 1} pts). Click for impact analysis."
          >
            🌧️
          </div>
        `;

        // iconAnchor: [-9, 31] places the 30px weather circle exactly 24px right and 16px above coords in fixed screen pixels
        const weatherMarker = window.L.marker(coords, {
          icon: window.L.divIcon({ 
            className: 'custom-weather-icon', 
            html: weatherHtml, 
            iconSize: [30, 30], 
            iconAnchor: [-9, 31] 
          }),
          zIndexOffset: 1500 // Render prominently above roads, boundaries, and facilities
        });

        weatherMarker.on('click', (e) => {
          if (window.L) {
            window.L.DomEvent.stopPropagation(e);
            window.L.DomEvent.preventDefault(e);
          }
          if (window.__abhayaOpenWeatherPopup) {
            window.__abhayaOpenWeatherPopup(hab.name, e);
          }
        });

        habitationsLayerRef.current.addLayer(weatherMarker);
      }
    });
  }, [habitations, isFull, findNearestFacility, drawRouteToFacility, mapReady]);

  // Facilities Markers
  useEffect(() => {
    if (!facilitiesLayerRef.current || !window.L || !isFull) return;
    facilitiesLayerRef.current.clearLayers();

    const displayList = activeFacilityFilter === 'All' 
      ? facilities 
      : facilities.filter(f => f.category === activeFacilityFilter);

    displayList.forEach(fac => {
      const theme = FACILITY_THEMES[fac.category] || FACILITY_THEMES['Hospital'];
      const facIconHtml = `<div class="marker-facility" style="background-color: ${theme.color};">${theme.icon}</div>`;

      // Locate nearest natural calamity / flood zone (Habitation)
      let nearestCalamity = null;
      let minCalamityDist = Infinity;

      if (habitations && habitations.length > 0) {
        habitations.forEach(hab => {
          const habCoords = hab.coords || HABITATION_COORDS[hab.name];
          if (habCoords && habCoords.length === 2) {
            const d = getDistanceKm(fac.coords[0], fac.coords[1], habCoords[0], habCoords[1]);
            if (d < minCalamityDist) {
              minCalamityDist = d;
              nearestCalamity = { hab, coords: habCoords, distKm: d };
            }
          }
        });
      }

      // Fallback to static HABITATION_COORDS dictionary if habitations list is still loading
      if (!nearestCalamity) {
        Object.entries(HABITATION_COORDS).forEach(([name, coords]) => {
          const d = getDistanceKm(fac.coords[0], fac.coords[1], coords[0], coords[1]);
          if (d < minCalamityDist) {
            minCalamityDist = d;
            nearestCalamity = { 
              hab: { name, hazardType: 'Flood / Calamity' }, 
              coords, 
              distKm: d 
            };
          }
        });
      }

      const calamityName = nearestCalamity ? nearestCalamity.hab.name : 'Calamity Zone';
      const hazardType = nearestCalamity?.hab?.hazardType || 'Flood';
      const hazardEmoji = getHazardConfig(hazardType);

      const facMarker = window.L.marker(fac.coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: facIconHtml, iconSize: [26, 26], iconAnchor: [13, 13] }),
        zIndexOffset: 10 // Keep lower than calamities and SOS
      });

      facMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 9px; background: ${theme.badgeBg}; color: ${theme.badgeColor}; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${theme.icon} ${fac.category}
            </span>
          </div>
          <h4 style="margin: 4px 0 3px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${fac.name}</h4>
          <p style="margin: 0 0 2px; font-size: 11px; color: #475569;"><strong>Capacity:</strong> ${fac.capacity}</p>
          <p style="margin: 0 0 6px; font-size: 11px; color: #475569;"><strong>Helpline:</strong> ${fac.contact}</p>

          ${nearestCalamity ? `
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 4px; padding: 5px 7px; margin-bottom: 7px; font-size: 11px; color: #991b1b; line-height: 1.3;">
              <strong>${hazardEmoji} Serving Calamity:</strong> ${calamityName}<br/>
              <span style="color: #64748b; font-size: 10px;">Distance to Hazard Zone: ${nearestCalamity.distKm.toFixed(2)} km</span>
            </div>
          ` : ''}

          <button id="btn-direct-${fac.id || fac._id}" style="background: ${theme.color}; color: #fff; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 700; width: 100%; transition: opacity 0.2s;">
            🚗 Evacuate from ${calamityName}
          </button>
        </div>
      `, { maxWidth: 260 });

      facMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-direct-${fac.id || fac._id}`);
        if (btn) {
          btn.onclick = () => {
            const originCoords = nearestCalamity ? nearestCalamity.coords : fac.coords;
            const originLabel = nearestCalamity ? `${calamityName} (${hazardType})` : 'Disaster Zone';
            drawRouteToFacility(
              originCoords[0],
              originCoords[1],
              fac.coords,
              `Evacuation: ${originLabel} ➔ ${fac.name}`,
              fac.category,
              true
            );
          };
        }
      });

      facilitiesLayerRef.current.addLayer(facMarker);
    });
  }, [facilities, habitations, activeFacilityFilter, isFull, drawRouteToFacility, mapReady]);

  // SOS Distress Pins
  useEffect(() => {
    if (!sosLayerRef.current || !window.L || !isFull) return;
    sosLayerRef.current.clearLayers();

    sosRequests.forEach(sos => {
      const isResolved = sos.status === 'Resolved';
      const sosIconHtml = `
        <div class="marker-sos-beacon ${isResolved ? 'sos-resolved' : 'animate-pulse-sos'}">
          ${isResolved ? '✅' : '🚨'}
        </div>
      `;

      const sosMarker = window.L.marker(sos.coords, {
        icon: window.L.divIcon({ className: 'custom-div-icon', html: sosIconHtml, iconSize: [28, 28], iconAnchor: [14, 14] }),
        zIndexOffset: 2000 // Ensure SOS beacons are ALWAYS on top of everything
      });

      sosMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 220px; padding: 2px;">
          <span style="font-size: 10px; background: ${isResolved ? '#ecfdf5' : '#fee2e2'}; color: ${isResolved ? '#047857' : '#b91c1c'}; font-weight: 800; padding: 2px 6px; border-radius: 4px;">
            ${isResolved ? 'RESCUE COMPLETED' : 'EMERGENCY SOS ACTIVE'}
          </span>
          <h4 style="margin: 6px 0 2px 0; font-size: 14px;">${sos.victimName}</h4>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Phone:</strong> <a href="tel:${sos.phone}">${sos.phone}</a></p>
          <p style="margin: 0 0 2px; font-size: 11px;"><strong>Calamity:</strong> <span style="color:#dc2626; font-weight:700;">${sos.calamity}</span></p>
          <p style="margin: 0 0 4px; font-size: 11px;"><strong>Aid Required:</strong> ${sos.aidList?.join(', ')}</p>
          ${!isResolved ? `
            <button id="btn-dispatch-${sos._id || sos.id}" style="background: #dc2626; color: #fff; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 700; width: 100%;">
              👷 Dispatch Worker / Route Here
            </button>
          ` : ''}
        </div>
      `, { maxWidth: 240 });

      sosMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-dispatch-${sos._id || sos.id}`);
        if (btn) {
          btn.onclick = async () => {
            btn.innerText = '⏳ Routing Aid...';
            try {
              const res = await fetch(`http://localhost:5000/api/sos/${sos._id || sos.id}/dispatch-route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              if (res.ok) {
                const data = await res.json();
                const { facility, targetCategory } = data.dispatchPlan;
                drawRouteToFacility(
                  facility.coords[0],
                  facility.coords[1],
                  sos.coords,
                  `${targetCategory}: ${facility.name}`,
                  targetCategory,
                  true
                );
                btn.innerText = `✅ Dispatched: ${facility.name}`;
                btn.style.background = '#059669';
                return;
              }
            } catch (err) {
              console.warn('Backend dispatch routing failed, using client triage:', err);
            }

            // Client-side fallback
            const norm = (sos.aidList || []).join(' ').toLowerCase();
            let cat = 'Hospital';
            if (norm.includes('boat') || norm.includes('raft') || norm.includes('debris') || norm.includes('earthmover')) cat = 'Rescue Unit';
            else if (norm.includes('water') || norm.includes('ration') || norm.includes('food')) cat = 'Relief Depot';
            else if (norm.includes('medical kit') || norm.includes('first-aid')) cat = 'Medic Post';

            const nearestBase = findNearestFacility(sos.coords[0], sos.coords[1], cat) || findNearestFacility(sos.coords[0], sos.coords[1], 'All');
            const origin = nearestBase ? nearestBase.facility.coords : [22.3072, 73.1812];
            drawRouteToFacility(origin[0], origin[1], sos.coords, `Victim: ${sos.victimName} (${cat})`, cat, true);
            btn.innerText = `✅ Dispatched (${cat})`;
            btn.style.background = '#059669';
          };
        }
      });

      sosLayerRef.current.addLayer(sosMarker);
    });
  }, [sosRequests, isFull, findNearestFacility, drawRouteToFacility, mapReady]);

  // SOS Hotspot Clusters Overlay (Spatial incident clustering)
  useEffect(() => {
    if (!hotspotsLayerRef.current || !window.L) return;
    hotspotsLayerRef.current.clearLayers();
    if (!showHotspots) return;

    hotspots.forEach(cluster => {
      if (!cluster.centroid || cluster.centroid.length !== 2) return;
      const isRed = cluster.alertLevel === 'RED' || cluster.type === 'EMERGING_ANOMALOUS_HOTSPOT';
      const clusterColor = isRed ? '#dc2626' : '#ea580c';
      const clusterFill = isRed ? '#ef4444' : '#f97316';

      // 1. Circle perimeter representing incident density spread
      const circle = window.L.circle(cluster.centroid, {
        radius: cluster.radiusMeters || 650,
        color: clusterColor,
        weight: 2,
        dashArray: '5, 5',
        fillColor: clusterFill,
        fillOpacity: 0.18
      });

      // 2. Center Hotspot Beacon Icon
      const beaconHtml = `
        <div class="marker-hotspot-beacon" style="
          background: ${clusterColor};
          color: #fff;
          padding: 3px 8px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 0 10px ${clusterColor};
          white-space: nowrap;
          border: 2px solid #fff;
          cursor: pointer;
        ">
          🔥 ${cluster.callCount} SOS Calls
        </div>
      `;

      const beaconMarker = window.L.marker(cluster.centroid, {
        icon: window.L.divIcon({
          className: 'custom-div-icon',
          html: beaconHtml,
          iconSize: [95, 24],
          iconAnchor: [47, 12]
        }),
        zIndexOffset: 1600
      });

      const popupHtml = `
        <div style="font-family: inherit; min-width: 250px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
            <span style="font-size: 9px; background: ${isRed ? '#fee2e2' : '#ffedd5'}; color: ${clusterColor}; font-weight: 800; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">
              ${cluster.type === 'EMERGING_ANOMALOUS_HOTSPOT' ? '🚨 EMERGING UNMAPPED HOTSPOT' : '⚠️ CONFIRMED INCIDENT CLUSTER'}
            </span>
          </div>
          <h4 style="margin: 0 0 4px; font-size: 13px; font-weight: 700; color: #0f172a;">${cluster.headline || 'Active Incident Cluster'}</h4>
          <p style="margin: 0 0 4px; font-size: 11px; color: #475569;">${cluster.advisory || ''}</p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px 8px; margin: 6px 0; font-size: 11px; line-height: 1.4;">
            <div><strong>Calls in Cluster:</strong> <span style="font-weight:700; color:${clusterColor}">${cluster.callCount} active calls</span></div>
            <div><strong>Dominant Calamity:</strong> ${cluster.dominantCalamity}</div>
            <div><strong>Severity Index:</strong> ${cluster.severityIndex} (${cluster.severityBreakdown?.critical || 0} Critical, ${cluster.severityBreakdown?.serious || 0} Serious)</div>
            ${cluster.nearestHabitation ? `
              <div style="margin-top: 3px; color: #64748b; font-size: 10px;">
                Nearest Settlement: <strong>${cluster.nearestHabitation.name}</strong> (${cluster.nearestHabitation.distanceKm} km)
              </div>
            ` : ''}
          </div>
          <button id="btn-cluster-fly-${cluster.clusterId}" style="background: ${clusterColor}; color: #fff; border: none; padding: 6px 8px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: 700; width: 100%;">
            🎯 Center & Inspect Cluster Area
          </button>
        </div>
      `;

      beaconMarker.bindPopup(popupHtml, { maxWidth: 280 });
      beaconMarker.on('popupopen', () => {
        const btn = document.getElementById(`btn-cluster-fly-${cluster.clusterId}`);
        if (btn) {
          btn.onclick = () => {
            const map = mapInstanceRef.current;
            if (map) map.flyTo(cluster.centroid, 16, { animate: true, duration: 1.0 });
          };
        }
      });

      hotspotsLayerRef.current.addLayer(circle);
      hotspotsLayerRef.current.addLayer(beaconMarker);
    });
  }, [hotspots, showHotspots, mapReady]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        if (!isInsideIndia(latitude, longitude)) {
           alert('Your current GPS location is outside the operational boundary (India).');
           return;
        }
        handleSetUserLocation(latitude, longitude, 'Your GPS Position', true);
      },
      () => {
        alert('Could not retrieve GPS. Using local base.');
        handleSetUserLocation(22.3072, 73.1812, 'Base Location (Vadodara)', true);
      },
      { timeout: 6000, enableHighAccuracy: true }
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        /* --- Dynamic Calamity Emoji Markers --- */
        .marker-hazard {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: #ffffff;
          font-size: 18px;
          border: 3px solid;
          box-shadow: 0 4px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        }
        .marker-hazard.critical {
          border-color: #dc2626;
          animation: pulse-crit-hazard 1.2s infinite;
        }
        .marker-hazard.high {
          border-color: #f97316;
          animation: pulse-high-hazard 2s infinite;
        }
        @keyframes pulse-crit-hazard {
          0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); transform: scale(0.95) translateY(0); }
          50% { transform: scale(1.1) translateY(-4px); }
          70% { box-shadow: 0 0 0 16px rgba(220, 38, 38, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); transform: scale(0.95) translateY(0); }
        }
        @keyframes pulse-high-hazard {
          0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7); transform: scale(0.95) translateY(0); }
          50% { transform: scale(1.05) translateY(-2px); }
          70% { box-shadow: 0 0 0 12px rgba(249, 115, 22, 0); }
          100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); transform: scale(0.95) translateY(0); }
        }

        /* --- Standard Facilities --- */
        .marker-facility {
          display: flex; align-items: center; justify-content: center;
          width: 26px; height: 26px; border-radius: 50%; border: 2px solid white;
          color: white; font-size: 13px; box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        
        /* --- SOS Distress Beacons --- */
        .marker-sos-beacon {
          display: flex; align-items: center; justify-content: center;
          width: 28px; height: 28px; border-radius: 50%; background: #ef4444;
          color: white; font-size: 14px; border: 2px solid white; cursor: pointer;
        }
        .marker-sos-beacon.sos-resolved {
          background: #10b981;
          animation: none;
        }
        .animate-pulse-sos { animation: pulse-sos 1.2s infinite; }
        @keyframes pulse-sos {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.8); }
          70% { box-shadow: 0 0 0 14px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        .custom-div-icon { background: none; border: none; }
        .custom-weather-icon { background: none; border: none; }

        /* --- Live Weather Surge Satellite Markers (30px prominent circle) --- */
        .marker-weather {
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 50%;
          background: #0284c7;
          color: #ffffff;
          font-size: 15px;
          border: 2.5px solid #ffffff;
          box-shadow: 0 4px 10px rgba(2, 132, 199, 0.45);
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          animation: pulse-weather 2.5s infinite ease-in-out;
        }
        .marker-weather:hover {
          transform: scale(1.18);
          box-shadow: 0 6px 14px rgba(2, 132, 199, 0.7);
        }
        @keyframes pulse-weather {
          0% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0.7); }
          50% { transform: scale(1.05); }
          70% { box-shadow: 0 0 0 8px rgba(2, 132, 199, 0); }
          100% { box-shadow: 0 0 0 0 rgba(2, 132, 199, 0); transform: scale(1); }
        }
      `}</style>

      {isFull && (
        <div style={{
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 14px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          zIndex: 10,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TARGET HAVEN:</span>
            <select
              value={activeFacilityFilter}
              onChange={e => setActiveFacilityFilter(e.target.value)}
              style={{ background: '#f8fafc', color: '#0f172a', padding: '6px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="All">All Emergency Sites ({facilities.length})</option>
              <option value="Rescue Unit">🚤 Rescue Staging Units</option>
              <option value="Relief Depot">📦 Relief Supply Depots</option>
              <option value="Hospital">🏥 Emergency Hospitals</option>
              <option value="Medic Post">🩺 Medic Clinics</option>
              <option value="Relocation Center">🛡️ Relocation Centers</option>
            </select>

            <select
              value={mapStyle}
              onChange={e => setMapStyle(e.target.value)}
              style={{ background: '#f8fafc', color: '#0f172a', padding: '6px 10px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px' }}
            >
              <option value="streets">🗺️ OpenStreetMap Streets</option>
              <option value="satellite">🛰️ Public Satellite (Hybrid)</option>
            </select>

            <button
              onClick={() => setShowHotspots(v => !v)}
              style={{
                background: showHotspots ? '#fef2f2' : '#f8fafc',
                color: showHotspots ? '#dc2626' : '#64748b',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${showHotspots ? '#fca5a5' : '#cbd5e1'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              🔥 Hotspots ({hotspots.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={focusIndiaView} title="Center view on India & Nepal" style={{ background: '#f8fafc', color: '#0f172a', padding: '6px 12px', fontSize: '12px', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>🌏 Focus Region</button>
            <button onClick={resetMapView} title="Fit active calamity habitation sites" style={{ background: '#f8fafc', color: '#334155', padding: '6px 12px', fontSize: '12px', fontWeight: 600, border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>🎯 Calamity Sites</button>
            <button onClick={handleLocateMe} style={{ background: '#2563eb', color: '#ffffff', padding: '6px 14px', fontSize: '12px', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(37,99,235,0.3)' }}>📍 Evacuate From My Location</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, minHeight: 0, position: 'relative', width: '100%' }}>
        {isFull && routeInfo && (
          <div style={{
            position: 'absolute', bottom: 12, left: 12, zIndex: 1000, background: '#ffffff',
            padding: '12px 16px', borderRadius: '6px', boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
            borderLeft: `5px solid ${FACILITY_THEMES[routeInfo.category]?.color || '#2563eb'}`, maxWidth: '290px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', fontSize: '10px' }}>
                {routeInfo.category}
              </span>
              <button onClick={() => { setRouteInfo(null); if (routeLayerRef.current) routeLayerRef.current.clearLayers(); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}>✕</button>
            </div>
            <h3 style={{ margin: '4px 0 2px 0', fontSize: '13px', fontWeight: 700 }}>{routeInfo.targetName}</h3>
            <div style={{ display: 'flex', gap: '10px', margin: '4px 0', color: '#475569', fontSize: '12px' }}>
              <span><strong>Dist:</strong> {routeInfo.distance} km</span>
              <span><strong>Est:</strong> {routeInfo.duration} mins</span>
            </div>
            <p style={{ margin: '3px 0 0 0', color: '#b91c1c', fontWeight: 700, fontSize: '12px' }}>Control Helpline: {routeInfo.contact}</p>
          </div>
        )}

        {isFull && isLoadingRoute && (
          <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: '#0f172a', color: '#fff', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
            Calculating safest road path...
          </div>
        )}

        <div ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />
      </div>
    </div>
  );
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [habitations, setHabitations] = useState([]);
  const [stats, setStats] = useState({ totalHabitations: 0, criticalZones: 0, populationAtRisk: 0, relocationsFlagged: 0 });
  const [priorities, setPriorities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hazardFilter, setHazardFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sosFilter, setSosFilter] = useState('all');

  const [predictionData, setPredictionData] = useState(null);
  const [hotspots, setHotspots] = useState([]);

  const [facilities, setFacilities] = useState(INITIAL_FACILITIES);
  const [sosRequests, setSosRequests] = useState([]);
  const [expandedHabScore, setExpandedHabScore] = useState({});
  const toggleScoreExplainer = id => setExpandedHabScore(p => ({ ...p, [id]: !p[id] }));

  const [showSosModal, setShowSosModal] = useState(false);
  const [victimName, setVictimName] = useState('');
  const [victimPhone, setVictimPhone] = useState('');
  const [victimCalamity, setVictimCalamity] = useState('Flood');
  const [victimSeverity, setVictimSeverity] = useState('serious');
  const [sosProximityWarning, setSosProximityWarning] = useState(null); // null | 'far' | 'near'
  const [selectedAids, setSelectedAids] = useState(['🍲 Food & Clean Water']);

  const aidOptions = [
    '🍲 Food & Clean Water',
    '🚑 Medical Aid / Paramedic',
    '🛟 Search & Rescue / Evacuation',
    '👕 Clothing & Blankets',
    '⛺ Temporary Shelter'
  ];

  const toggleAid = aid => {
    if (selectedAids.includes(aid)) {
      setSelectedAids(selectedAids.filter(a => a !== aid));
    } else {
      setSelectedAids([...selectedAids, aid]);
    }
  };

  // Haversine distance in km between two lat/lng points
  const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // Open SOS modal and silently run GPS proximity check in background
  const openSosModal = () => {
    setSosProximityWarning(null);
    setShowSosModal(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        const nearestKm = Math.min(
          ...Object.values(HABITATION_COORDS).map(([hlat, hlng]) =>
            haversineKm(latitude, longitude, hlat, hlng)
          )
        );
        setSosProximityWarning(nearestKm <= 50 ? 'near' : 'far');
      }, () => {
        setSosProximityWarning(null); // GPS denied — don't block submission
      }, { timeout: 5000 });
    }
  };

  useEffect(() => {
    fetch(API_BASE).then(res => res.json()).then(data => setHabitations(data)).catch(err => console.error(err));
    fetch(`${API_BASE}/stats`).then(res => res.json()).then(data => setStats(data)).catch(err => console.error(err));
    fetch(`${API_BASE}/priorities`).then(res => res.json()).then(data => setPriorities(data)).catch(err => console.error(err));

    fetch(SOS_API)
      .then(res => res.json())
      .then(data => setSosRequests(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to load SOS records:', err));

    fetch(FACILITIES_API)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFacilities(data);
        }
      })
      .catch(err => console.error('Failed to load facilities from DB:', err));

    fetch(DASHBOARD_API)
      .then(res => res.json())
      .then(data => {
        if (data && data.systemStatus) {
          setPredictionData(data);
          if (Array.isArray(data.activeHotspots)) {
            setHotspots(data.activeHotspots);
          }
        }
      })
      .catch(err => console.error('Failed to load prediction dashboard data:', err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(SOS_API)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSosRequests(data);
        })
        .catch(() => {});

      fetch(DASHBOARD_API)
        .then(res => res.json())
        .then(data => {
          if (data && data.systemStatus) {
            setPredictionData(data);
            if (Array.isArray(data.activeHotspots)) {
              setHotspots(data.activeHotspots);
            }
          }
        })
        .catch(() => {});
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (sosId, newStatus) => {
    try {
      const res = await fetch(`${SOS_API}/${sosId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) throw new Error('Status update failed');

      const updated = await res.json();
      setSosRequests(prev => prev.map(item => item._id === sosId ? updated : item));
    } catch (err) {
      console.error(err);
      alert('Could not update status on the server.');
    }
  };

  // DELETE SOS Distress Request Handler
  const handleDeleteSos = async (sosId) => {
    if (!window.confirm('Are you sure you want to permanently delete this emergency distress call?')) return;
    try {
      const res = await fetch(`${SOS_API}/${sosId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Delete failed');

      setSosRequests(prev => prev.filter(item => (item._id || item.id) !== sosId));
    } catch (err) {
      console.error(err);
      alert('Could not delete SOS request from server. Check that backend DELETE route is set up.');
    }
  };

  const handleVictimSubmit = e => {
    e.preventDefault();
    if (!victimName || !victimPhone) {
      alert('Please provide your name and phone number.');
      return;
    }

    const dispatchSos = async (coords) => {
      const payload = {
        victimName,
        phone: victimPhone,
        calamity: victimCalamity,
        severity: victimSeverity,
        aidList: selectedAids,
        coords: coords
      };

      try {
        const res = await fetch(SOS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Server returned an error');

        const savedRecord = await res.json();
        setSosRequests(prev => [savedRecord, ...prev]);

        setShowSosModal(false);
        setVictimName('');
        setVictimPhone('');
        setCurrentView('map');

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: savedRecord }));
        }, 350);
      } catch (err) {
        console.error('Submission error:', err);
        alert('Could not save SOS request. Please ensure the backend is running.');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => dispatchSos([pos.coords.latitude, pos.coords.longitude]),
        () => dispatchSos([22.3072 + (Math.random() - 0.5) * 0.02, 73.1812 + (Math.random() - 0.5) * 0.02]),
        { timeout: 4000 }
      );
    } else {
      dispatchSos([22.3072, 73.1812]);
    }
  };

  const filteredHabitations = habitations.filter(hab => {
    const matchesSearch = hab.name?.toLowerCase().includes(searchQuery.toLowerCase()) || hab.district?.toLowerCase().includes(searchQuery.toLowerCase()) || hab.hazardType?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHazard = hazardFilter === 'all' || hab.hazardType?.toLowerCase().includes(hazardFilter.toLowerCase());
    const matchesRisk = riskFilter === 'all' || hab.riskLevel?.toLowerCase() === riskFilter.toLowerCase();
    return matchesSearch && matchesHazard && matchesRisk;
  });

  const activeSosCount = sosRequests.filter(s => s.status !== 'Resolved').length;

  const viewMeta = {
    dashboard: { title: 'Prediction & Command Dashboard', subtitle: 'Real-time multi-factor risk scores, live SOS hotspots, resource forecasting & anomaly alerts' },
    map: { title: 'Hazard & Evacuation Route Map', subtitle: 'Interactive live navigation to government relief hubs, trauma hospitals, and active SOS beacons' },
    habitations: { title: 'All Habitations Risk Register', subtitle: 'Comprehensive inventory of settlements and infrastructure exposure' },
    groundworker: { title: 'Ground Worker SOS Response Feed', subtitle: 'Live feed of distress calls, victim locations, and dispatch routing' },
    relocation: { title: 'Relocation Priority Ranking', subtitle: 'High-risk habitations scheduled for relocation and emergency response transfers' },
    about: { title: 'How Scoring Works', subtitle: 'Composite risk formulation and weighting criteria' }
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">अ</span>
          <div className="brand-text">
            <span className="brand-name">ABHAYA</span>
            <span className="brand-sub">Hazard &amp; Vulnerability System</span>
          </div>
        </div>

        <div style={{ padding: '0 12px 14px' }}>
          <button
            onClick={openSosModal}
            style={{
              width: '100%',
              background: '#dc2626',
              color: '#ffffff',
              padding: '10px 8px',
              fontSize: '12px',
              fontWeight: 800,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
            }}
          >
            🚨 VICTIM SOS: REQUEST AID
          </button>
        </div>

        <nav className="nav">
          <button className={`nav-item ${currentView === 'dashboard' ? 'is-active' : ''}`} onClick={() => setCurrentView('dashboard')}>
            <span className="nav-dot"></span>Prediction Dashboard
          </button>
          <button className={`nav-item ${currentView === 'map' ? 'is-active' : ''}`} onClick={() => { setCurrentView('map'); setSearchQuery(''); }}>
            <span className="nav-dot"></span>Hazard Map
          </button>
          <button className={`nav-item ${currentView === 'groundworker' ? 'is-active' : ''}`} onClick={() => { setCurrentView('groundworker'); setSearchQuery(''); }}>
            <span className="nav-dot" style={{ background: '#dc2626' }}></span>Ground Worker Feed ({activeSosCount})
          </button>
          <button className={`nav-item ${currentView === 'habitations' ? 'is-active' : ''}`} onClick={() => setCurrentView('habitations')}>
            <span className="nav-dot"></span>Habitations
          </button>
          <button className={`nav-item ${currentView === 'relocation' ? 'is-active' : ''}`} onClick={() => { setCurrentView('relocation'); setSearchQuery(''); }}>
            <span className="nav-dot"></span>Relocation Priority
          </button>
          <button className={`nav-item ${currentView === 'about' ? 'is-active' : ''}`} onClick={() => { setCurrentView('about'); setSearchQuery(''); }}>
            <span className="nav-dot"></span>How Scoring Works
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="status-pill"><span className="pulse"></span>Live data · Connected</div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-title">
            <h1 id="view-title">{viewMeta[currentView].title}</h1>
            <p id="view-subtitle">{viewMeta[currentView].subtitle}</p>
          </div>
          <div className="topbar-actions">
            {(currentView === 'dashboard' || currentView === 'habitations') && (
              <div className="search">
                <input type="text" placeholder="Search habitation, district, hazard type…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            )}
            <button className="btn btn-outline" onClick={() => window.print()}>Export Report</button>
            <div className="avatar">DM</div>
          </div>
        </header>

        {currentView === 'dashboard' && (
          <section className="view is-active" id="view-dashboard">
            {/* 1. Live Prediction & Threat Status Banner */}
            <div style={{
              background: 'linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              marginBottom: '20px',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.15)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  background: (predictionData?.systemStatus?.overallThreatLevel === 'CRITICAL' || stats.criticalZones > 0) ? '#dc2626' : '#ea580c',
                  color: '#ffffff',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-pill)',
                  fontWeight: 800,
                  fontSize: '11px',
                  letterSpacing: '0.05em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 0 16px rgba(220, 38, 38, 0.6)'
                }}>
                  <span className="pulse" style={{ background: '#fff' }}></span>
                  STATUS: {predictionData?.systemStatus?.overallThreatLevel || 'CRITICAL'} THREAT
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Real-time AI Prediction &amp; Resource Forecasting Layer
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Aggregating Risk Scores, SOS Hotspots, Relief Resource Projections &amp; Anomaly Alerts
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Population at Risk</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                    {(predictionData?.systemStatus?.populationAtRisk || stats.populationAtRisk || 24620).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => {
                    fetch(DASHBOARD_API)
                      .then(r => r.json())
                      .then(d => {
                        if (d && d.systemStatus) {
                          setPredictionData(d);
                          if (Array.isArray(d.activeHotspots)) setHotspots(d.activeHotspots);
                        }
                      })
                      .catch(e => console.error(e));
                  }}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Force re-fetch from aggregated prediction endpoint"
                >
                  🔄 Live Sync
                </button>
              </div>
            </div>

            {/* 2. Top Metric KPI Cards */}
            <div className="stat-grid" style={{ marginBottom: '20px' }}>
              <div className="stat-card">
                <span className="stat-label">Habitations Monitored</span>
                <span className="stat-value">{predictionData?.systemStatus?.totalHabitationsMonitored || stats.totalHabitations || 8}</span>
                <span className="stat-trend">active vulnerability records</span>
              </div>
              <div className="stat-card stat-card--dark">
                <span className="stat-label">Critical Risk Zones</span>
                <span className="stat-value">{predictionData?.systemStatus?.criticalZonesCount || stats.criticalZones || 4}</span>
                <span className="stat-trend">score &ge; 80 (immediate action)</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active SOS Hotspots</span>
                <span className="stat-value" style={{ color: '#dc2626' }}>
                  {hotspots.length || predictionData?.systemStatus?.activeHotspotsCount || 0}
                </span>
                <span className="stat-trend">density clusters detected</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Flagged Trend Anomalies</span>
                <span className="stat-value" style={{ color: '#ea580c' }}>
                  {predictionData?.trendAnomalies?.length || predictionData?.systemStatus?.anomaliesCount || 2}
                </span>
                <span className="stat-trend">unusual vulnerability jumps</span>
              </div>
            </div>

            {/* 3. Aggregate Relief Resource Needs (from /api/dashboard/prediction-summary) */}
            <div className="panel" style={{ marginBottom: '20px', padding: '20px' }}>
              <div className="panel-head" style={{ marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>
                    📦 Total Estimated Resource Needs (Critical Priority Zones)
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--gray-600)' }}>
                    Calculated via transparent, explainable formulas (% evacuation by risk tier, shelter capacity, and sustenance baselines)
                  </p>
                </div>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#047857', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                  Live Logistics Projection
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '12px'
              }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>👥 Evacuees to Transfer</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {(predictionData?.resourceLogistics?.totalEstimatedEvacuees || 19726).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>High &amp; Critical displaced pop.</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>🏕️ Shelters Required</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {predictionData?.resourceLogistics?.totalSheltersRequired || 43} units
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Capacity @ 500 persons/camp</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>💧 Daily Potable Water</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#2563eb', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {(predictionData?.resourceLogistics?.totalDailyWaterLitres || 78904).toLocaleString()} L
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Baseline: 4 Litres / person / day</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>🍲 Daily Food Rations</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#ea580c', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {(predictionData?.resourceLogistics?.totalDailyFoodRations || 39452).toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Dry ration packs (2 meals/day)</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>🩺 Emergency Medical Kits</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0891b2', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {predictionData?.resourceLogistics?.totalMedicalKitsRequired || 396}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Trauma &amp; first-aid units</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-sm)', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>👨‍⚕️ Medical Personnel</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-mono)', margin: '4px 0 2px' }}>
                    {predictionData?.resourceLogistics?.totalMedicalPersonnelRequired || 134}
                  </div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>Paramedics, nurses &amp; doctors</div>
                </div>
              </div>
            </div>

            {/* 4. Risk Distribution & Exposure Visuals */}
            <div className="panel-grid" style={{ marginBottom: '20px' }}>
              {/* Chart A: Risk Tier Distribution */}
              <div className="panel" style={{ padding: '18px' }}>
                <div className="panel-head" style={{ marginBottom: '12px' }}>
                  <h2>📊 Risk Level Distribution</h2>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>{habitations.length || 8} Monitored Zones</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { level: 'Critical Risk (80-100)', count: habitations.filter(h => h.riskLevel === 'Critical').length || 4, total: habitations.length || 8, color: '#dc2626' },
                    { level: 'High Risk (60-79)',     count: habitations.filter(h => h.riskLevel === 'High').length || 2,     total: habitations.length || 8, color: '#ea580c' },
                    { level: 'Moderate Risk (40-59)', count: habitations.filter(h => h.riskLevel === 'Moderate').length || 2, total: habitations.length || 8, color: '#ca8a04' },
                    { level: 'Low Risk (0-39)',      count: habitations.filter(h => h.riskLevel === 'Low').length || 0,      total: habitations.length || 8, color: '#16a34a' }
                  ].map((tier, idx) => {
                    const pct = Math.round((tier.count / tier.total) * 100);
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tier.color }}></span>
                            {tier.level}
                          </span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{tier.count} zones ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: tier.color, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Chart B: Hazard Exposure Types */}
              <div className="panel" style={{ padding: '18px' }}>
                <div className="panel-head" style={{ marginBottom: '12px' }}>
                  <h2>🌊 Hazard Exposure Breakdown</h2>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Primary Threat Vector</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { type: 'Flood & River Inundation', icon: '🌊', count: 4, color: '#2563eb' },
                    { type: 'Landslide & Mountain Mudflow', icon: '⛰️', count: 2, color: '#d97706' },
                    { type: 'Cyclone & Storm Surge', icon: '🌪️', count: 2, color: '#7c3aed' }
                  ].map((haz, idx) => {
                    const pct = Math.round((haz.count / (habitations.length || 8)) * 100);
                    return (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, marginBottom: '4px' }}>
                          <span>{haz.icon} {haz.type}</span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{haz.count} sites ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: haz.color, borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Top-N Critical Zones with Factor Breakdown */}
            <div className="panel" style={{ marginBottom: '20px', padding: '20px' }}>
              <div className="panel-head" style={{ marginBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: 0 }}>🚨 Top Critical Priority Zones &amp; Risk Drivers</h2>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--gray-600)' }}>
                    Ranked by multi-factor vulnerability score with primary weighted drivers and immediate relief needs
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(predictionData?.criticalZones || []).map((zone, idx) => (
                  <div
                    key={zone.id || idx}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderLeft: '4px solid #dc2626',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
                      <span style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: '#fee2e2', color: '#dc2626',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '12px', fontFamily: 'var(--font-mono)'
                      }}>
                        0{zone.rank || idx + 1}
                      </span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700 }}>{zone.name}</h4>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {zone.district} • {zone.hazardType}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center', minWidth: '85px' }}>
                        <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase' }}>Score</div>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                          {zone.vulnerabilityScore}/100
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {zone.topDrivers?.map((d, i) => (
                          <span
                            key={i}
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600
                            }}
                          >
                            💡 {d.factor}: <strong>{d.score}</strong>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ fontSize: '11px', color: '#475569', textAlign: 'right' }}>
                        <div><strong>{(zone.reliefNeeds?.estimatedEvacuees || zone.population || 0).toLocaleString()}</strong> Evacuees</div>
                        <div style={{ color: '#64748b' }}>{zone.reliefNeeds?.sheltersNeeded || 5} Shelters • {(zone.reliefNeeds?.dailyWaterLitres || 15000).toLocaleString()}L Water</div>
                      </div>

                      <button
                        onClick={() => {
                          setCurrentView('map');
                          setTimeout(() => {
                            if (zone.coords) {
                              window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: { coords: zone.coords, victimName: zone.name, aidList: [] } }));
                            }
                          }, 300);
                        }}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          color: '#0f172a',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        🗺️ View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 6. Active SOS Hotspots & Trend Anomalies (2-Column Grid) */}
            <div className="panel-grid" style={{ marginBottom: '20px' }}>
              {/* Active Hotspots Panel */}
              <div className="panel" style={{ padding: '18px' }}>
                <div className="panel-head" style={{ marginBottom: '12px' }}>
                  <div>
                    <h2>🔥 Active Incident Hotspots ({hotspots.length})</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--gray-600)' }}>
                      Spatial density clusters in rolling 60-min window
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', background: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                    LIVE DENSITY
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {hotspots.length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      No emerging spatial clusters detected in the last 60 minutes.
                    </div>
                  ) : (
                    hotspots.map((cluster, idx) => {
                      const isRed = cluster.alertLevel === 'RED' || cluster.type === 'EMERGING_ANOMALOUS_HOTSPOT';
                      return (
                        <div
                          key={cluster.clusterId || idx}
                          style={{
                            background: '#f8fafc',
                            border: `1px solid ${isRed ? '#fca5a5' : '#fed7aa'}`,
                            borderLeft: `4px solid ${isRed ? '#dc2626' : '#ea580c'}`,
                            borderRadius: '6px',
                            padding: '10px 12px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, color: isRed ? '#dc2626' : '#ea580c', textTransform: 'uppercase' }}>
                              {cluster.type === 'EMERGING_ANOMALOUS_HOTSPOT' ? '🚨 EMERGING UNMAPPED' : '⚠️ CONFIRMED INCIDENT'}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 800, background: '#fff', border: '1px solid #e2e8f0', padding: '1px 6px', borderRadius: '4px' }}>
                              🔥 {cluster.callCount} Calls Clustered
                            </span>
                          </div>
                          <h4 style={{ margin: '4px 0 2px', fontSize: '12px', fontWeight: 700 }}>
                            {cluster.headline}
                          </h4>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: 1.35 }}>
                            {cluster.advisory}
                          </p>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                            <span style={{ fontSize: '10px', color: '#64748b' }}>
                              {cluster.dominantCalamity} • Severity {cluster.severityIndex}
                            </span>
                            <button
                              onClick={() => {
                                setCurrentView('map');
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: { coords: cluster.centroid, victimName: cluster.headline, aidList: [] } }));
                                }, 300);
                              }}
                              style={{
                                background: isRed ? '#dc2626' : '#ea580c',
                                color: '#fff',
                                border: 'none',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              🗺️ Fly on Map
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Trend Anomalies Panel */}
              <div className="panel" style={{ padding: '18px' }}>
                <div className="panel-head" style={{ marginBottom: '12px' }}>
                  <div>
                    <h2>📈 Flagged Trend Anomalies ({(predictionData?.trendAnomalies || []).length})</h2>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--gray-600)' }}>
                      Abrupt score jump beyond historical moving average
                    </p>
                  </div>
                  <span style={{ fontSize: '10px', background: '#ffedd5', color: '#c2410c', padding: '2px 8px', borderRadius: '10px', fontWeight: 800 }}>
                    ANOMALIES FLAGGED
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(predictionData?.trendAnomalies || []).length === 0 ? (
                    <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                      No sudden statistical anomalies detected this cycle.
                    </div>
                  ) : (
                    (predictionData?.trendAnomalies || []).map((anomaly, idx) => (
                      <div
                        key={anomaly.habitationId || idx}
                        style={{
                          background: '#fff7ed',
                          border: '1px solid #fdba74',
                          borderRadius: '6px',
                          padding: '10px 12px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>
                            {anomaly.name} ({anomaly.district})
                          </h4>
                          <span style={{
                            background: '#ea580c', color: '#fff', fontWeight: 800,
                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px'
                          }}>
                            ▲ +{anomaly.delta} pts (+{anomaly.percentChange}%)
                          </span>
                        </div>
                        <p style={{ margin: '4px 0 2px', fontSize: '11px', color: '#7c2d12', lineHeight: 1.35 }}>
                          {anomaly.narrative}
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid #fed7aa', borderRadius: '4px', padding: '4px 8px', marginTop: '4px', fontSize: '10px', color: '#9a3412' }}>
                          <strong>Action:</strong> {anomaly.recommendedAction}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 7. Live Hazard Map Preview & Relocation Priorities List */}
            <div className="panel-grid">
              <div className="panel panel-map">
                <div className="panel-head">
                  <h2>Hazard Exposure &amp; Hotspot Overlay</h2>
                  <div className="legend">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #dc2626', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⚠️</div>
                      Critical Risk
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #f97316', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>⚠️</div>
                      High Risk
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#dc2626', fontWeight: 700 }}>
                      🔥 SOS Hotspots
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
                      🌧️ Weather Surge
                    </span>
                  </div>
                </div>
                <div style={{ height: '380px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                  <HazardMap habitations={habitations} sosRequests={sosRequests} facilities={facilities} hotspots={hotspots} isFull={false} />
                </div>
              </div>

              <div className="panel panel-list">
                <div className="panel-head"><h2>Top Relocation Priorities</h2></div>
                <ol className="priority-list">
                  {priorities.map((item, idx) => (
                    <li key={item._id || idx}><span className="rank">0{idx + 1}</span><span className="name">{item.name}</span><span className="score">{(item.vulnerabilityScore / 10).toFixed(1)}</span></li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="panel panel-table">
              <div className="panel-head">
                <h2>Habitation Risk Register</h2>
                <div className="filters">
                  <select value={hazardFilter} onChange={e => setHazardFilter(e.target.value)}>
                    <option value="all">All hazard types</option>
                    <option value="flood">🌊 Flood</option>
                    <option value="wildfire">🔥 Wildfire</option>
                    <option value="landslide">⛰️ Landslide</option>
                    <option value="cyclone">🌪️ Cyclone</option>
                    <option value="earthquake">🌍 Earthquake</option>
                    <option value="tsunami">🌊 Tsunami</option>
                    <option value="lightning">⚡ Lightning/Storm</option>
                    <option value="heat">☀️ Extreme heat</option>
                  </select>
                  <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)}>
                    <option value="all">All risk levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="moderate">Moderate</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <table className="data-table" id="riskTable">
                <thead><tr><th>Habitation</th><th>District</th><th>Hazard Type</th><th>Population</th><th>Vulnerability Score</th><th>Risk Level</th></tr></thead>
                <tbody>
                  {filteredHabitations.map((hab, idx) => {
                    const habId = hab._id || hab.name || idx;
                    const isExpanded = !!expandedHabScore[habId];
                    const explanation = isExpanded ? getRiskExplanation(hab) : null;

                    return (
                      <React.Fragment key={habId}>
                        <tr>
                          <td>
                            <div style={{ fontWeight: 600 }}>{hab.name}</div>
                            <button
                              type="button"
                              onClick={() => toggleScoreExplainer(habId)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                padding: 0,
                                color: '#2563eb',
                                fontSize: '11px',
                                cursor: 'pointer',
                                textDecoration: 'underline',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                marginTop: '3px'
                              }}
                            >
                              💡 {isExpanded ? 'Hide explanation' : 'Why this score?'}
                            </button>
                          </td>
                          <td>{hab.district}</td>
                          <td>{hab.hazardType}</td>
                          <td>{hab.population?.toLocaleString()}</td>
                          <td><div className="bar"><span style={{ width: `${hab.vulnerabilityScore}%` }}></span></div></td>
                          <td><span className={`badge badge-${hab.riskLevel?.toLowerCase()}`}>{hab.riskLevel}</span></td>
                        </tr>
                        {isExpanded && explanation && (
                          <tr style={{ background: '#f8fafc' }}>
                            <td colSpan={6} style={{ padding: '10px 16px', borderTop: 'none', borderBottom: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>
                                    💡 Risk Driver Breakdown:
                                  </span>
                                  {explanation.topDrivers?.map((d, i) => (
                                    <span
                                      key={i}
                                      style={{
                                        background: '#e0e7ff',
                                        color: '#3730a3',
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        padding: '2px 8px',
                                        borderRadius: '12px'
                                      }}
                                    >
                                      Driver {i + 1}: {d.name} (+{Math.round(d.weightedScore)} pts)
                                    </span>
                                  ))}
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#334155', lineHeight: 1.45 }}>
                                  {explanation.short}
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentView === 'map' && (
          <section className="view is-active" id="view-map">
            <div className="panel panel-full" style={{ paddingBottom: '16px' }}>
              <div className="panel-head">
                <h2>Emergency Safe Havens &amp; SOS Distress Beacons</h2>
                <div className="legend">
                  <span><i className="sw" style={{ background: '#ef4444' }}></i>🚨 Victim SOS</span>
                  <span><i className="sw" style={{ background: '#ea580c' }}></i>🚤 Rescue Unit</span>
                  <span><i className="sw" style={{ background: '#8b5cf6' }}></i>📦 Relief Depot</span>
                  <span><i className="sw" style={{ background: '#2563eb' }}></i>🏥 Hospital</span>
                  <span><i className="sw" style={{ background: '#0891b2' }}></i>🩺 Clinic</span>
                  <span><i className="sw" style={{ background: '#059669' }}></i>🛡️ Shelter</span>
                  <span><i className="sw" style={{ background: '#0284c7' }}></i>🌧️ Live Weather Surge</span>
                </div>
              </div>
              
              <div style={{ height: '640px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                <HazardMap habitations={habitations} sosRequests={sosRequests} facilities={facilities} hotspots={hotspots} isFull={true} />
              </div>

              <p className="hint" style={{ marginTop: '12px' }}>
                Click any settlement marker or 🚨 SOS beacon to plot safe road routes to the closest haven.
              </p>
            </div>
          </section>
        )}

        {currentView === 'groundworker' && (
          <section className="view is-active" id="view-groundworker">
            <div className="panel panel-full" style={{ padding: '24px' }}>
              <div className="panel-head" style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                    Active Citizen SOS Distress Signals ({sosRequests.length})
                  </h2>
                  <p style={{ margin: '3px 0 0', fontSize: '12px', color: 'var(--gray-600)' }}>
                    Field Ground Worker CAD Dispatch Feed · Live victim assistance queue
                  </p>
                </div>

                {/* Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { id: 'all', label: `All (${sosRequests.length})` },
                    { id: 'critical', label: `🔴 Critical (${sosRequests.filter(s => s.severity === 'critical').length})` },
                    { id: 'serious', label: `🟠 Serious (${sosRequests.filter(s => s.severity === 'serious').length})` },
                    { id: 'pending', label: `⏳ Pending (${sosRequests.filter(s => (s.status || 'Pending Dispatch') === 'Pending Dispatch').length})` }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setSosFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: '1px solid',
                        borderColor: sosFilter === tab.id ? '#0f172a' : '#cbd5e1',
                        background: sosFilter === tab.id ? '#0f172a' : '#ffffff',
                        color: sosFilter === tab.id ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Incident Cards Queue */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(() => {
                  const filtered = sosRequests
                    .filter(sos => {
                      if (sosFilter === 'critical') return sos.severity === 'critical';
                      if (sosFilter === 'serious') return sos.severity === 'serious';
                      if (sosFilter === 'pending') return (sos.status || 'Pending Dispatch') === 'Pending Dispatch';
                      return true;
                    })
                    .filter(sos => {
                      if (!searchQuery.trim()) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        (sos.victimName || '').toLowerCase().includes(q) ||
                        (sos.phone || '').toLowerCase().includes(q) ||
                        (sos.calamity || '').toLowerCase().includes(q) ||
                        (sos.aidList || []).some(a => a.toLowerCase().includes(q))
                      );
                    });

                  if (filtered.length === 0) {
                    return (
                      <div style={{
                        textAlign: 'center',
                        padding: '48px 24px',
                        background: '#f8fafc',
                        borderRadius: '12px',
                        border: '1px dashed #cbd5e1',
                        color: '#64748b'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: '8px' }}>🛡️</div>
                        <h4 style={{ margin: 0, fontSize: '15px', color: '#1e293b' }}>No Distress Calls in this Queue</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px' }}>All emergency dispatch signals have been routed or resolved.</p>
                      </div>
                    );
                  }

                  return filtered.map(sos => {
                    const sevConfig = {
                      critical: { label: '🔴 Life-Threatening', color: '#dc2626', bg: '#fef2f2', border: '#ef4444' },
                      serious:  { label: '🟠 Serious',          color: '#ea580c', bg: '#fff7ed', border: '#f97316' },
                      moderate: { label: '🟡 Moderate',         color: '#ca8a04', bg: '#fefce8', border: '#eab308' },
                      stable:   { label: '🟢 Stable',           color: '#16a34a', bg: '#f0fdf4', border: '#22c55e' }
                    };
                    const sev = sevConfig[sos.severity] || sevConfig['serious'];

                    const norm = (sos.aidList || []).join(' ').toLowerCase();
                    let targetBadge = { icon: '🛡️', label: 'Relocation Center', bg: '#f0fdf4', color: '#15803d' };
                    if (norm.includes('boat') || norm.includes('raft') || norm.includes('debris') || norm.includes('earthmover')) {
                      targetBadge = { icon: '🚤', label: 'Rescue Unit (SDRF/NDRF Base)', bg: '#fff7ed', color: '#c2410c' };
                    } else if (sos.severity === 'critical' || norm.includes('oxygen') || norm.includes('iv fluid') || norm.includes('hospital')) {
                      targetBadge = { icon: '🏥', label: 'Hospital (Trauma ICU)', bg: '#eff6ff', color: '#1d4ed8' };
                    } else if (norm.includes('medical kit') || norm.includes('first-aid')) {
                      targetBadge = { icon: '🩺', label: 'Medic Post (Clinic)', bg: '#ecfeff', color: '#0e7490' };
                    } else if (norm.includes('water') || norm.includes('ration') || norm.includes('food')) {
                      targetBadge = { icon: '📦', label: 'Relief Depot (Supplies Hub)', bg: '#f5f3ff', color: '#6d28d9' };
                    }

                    const timeString = new Date(sos.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Recent';

                    return (
                      <div
                        key={sos._id || sos.id}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderLeft: `5px solid ${sev.border}`,
                          borderRadius: '12px',
                          padding: '16px 20px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          transition: 'box-shadow 0.2s ease'
                        }}
                      >
                        {/* 1. Header Row: Severity + Name + Phone + Time + Status Dropdown */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{
                              background: sev.bg,
                              color: sev.color,
                              fontWeight: 800,
                              fontSize: '11px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              whiteSpace: 'nowrap'
                            }}>
                              {sev.label}
                            </span>
                            <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', fontFamily: 'var(--font-display)' }}>
                              {sos.victimName}
                            </span>
                            <a
                              href={`tel:${sos.phone}`}
                              style={{
                                fontSize: '12px',
                                color: '#2563eb',
                                textDecoration: 'none',
                                fontWeight: 600,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              📞 {sos.phone}
                            </a>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              ⏱️ {timeString}
                            </span>
                          </div>

                          {/* Status Dropdown - Always visible at top-right without scrolling */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status:</span>
                            <select
                              value={sos.status || 'Pending Dispatch'}
                              onChange={e => handleUpdateStatus(sos._id, e.target.value)}
                              style={{
                                padding: '5px 10px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '12px',
                                border: '1px solid #cbd5e1',
                                background: sos.status === 'Resolved' ? '#ecfdf5' : sos.status === 'En Route' ? '#eff6ff' : '#fee2e2',
                                color: sos.status === 'Resolved' ? '#047857' : sos.status === 'En Route' ? '#1d4ed8' : '#b91c1c',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="Pending Dispatch">Pending Dispatch</option>
                              <option value="En Route">En Route</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </div>

                        {/* 2. Middle Row: Hazard & Required Aid Pills */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Calamity:</span>
                            <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '12px' }}>🌊 {sos.calamity}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Required Aid:</span>
                            {sos.aidList?.map((aid, i) => (
                              <span key={i} style={{ background: '#ffffff', border: '1px solid #e2e8f0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 500 }}>
                                {aid}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 3. Bottom Row: Target Aid Facility + Action Controls */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Target Haven:</span>
                            <span style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              gap: '5px',
                              background: targetBadge.bg, 
                              color: targetBadge.color, 
                              fontWeight: 700, 
                              fontSize: '11px', 
                              padding: '4px 10px', 
                              borderRadius: '12px',
                              whiteSpace: 'nowrap'
                            }}>
                              <span>{targetBadge.icon}</span>
                              <span>{targetBadge.label}</span>
                            </span>
                          </div>

                          {/* Action Buttons - Always visible without scrolling */}
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => {
                                setCurrentView('map');
                                setTimeout(() => {
                                  window.dispatchEvent(new CustomEvent('focus-sos-beacon', { detail: sos }));
                                }, 350);
                              }}
                              style={{
                                background: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                padding: '6px 14px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '5px',
                                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                                whiteSpace: 'nowrap'
                              }}
                              title="Calculate aid-type-aware dispatch route on Hazard Map"
                            >
                              ⚡ Dispatch &amp; Route
                            </button>
                            <button
                              onClick={() => handleDeleteSos(sos._id || sos.id)}
                              style={{
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: '1px solid #fca5a5',
                                padding: '6px 10px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 700
                              }}
                              title="Delete SOS record"
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </section>
        )}

        {currentView === 'habitations' && (
          <section className="view is-active" id="view-habitations">
            <div className="panel panel-full">
              <div className="panel-head"><h2>All Monitored Habitations</h2></div>
              <table className="data-table">
                <thead><tr><th>Habitation</th><th>District</th><th>Population</th><th>Households</th><th>Hazard Distance</th><th>Carrying Capacity</th></tr></thead>
                <tbody>
                  {filteredHabitations.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                        No habitations match your search.
                      </td>
                    </tr>
                  ) : (
                    filteredHabitations.map((hab, idx) => (
                      <tr key={hab._id || idx}><td>{hab.name}</td><td>{hab.district}</td><td>{hab.population?.toLocaleString()}</td><td>{hab.households}</td><td>{hab.hazardDistance}</td><td>{hab.carryingCapacityStatus}</td></tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {currentView === 'relocation' && (
          <section className="view is-active" id="view-relocation">
            <div className="panel panel-full">
              <div className="panel-head"><h2>Relocation Priority Ranking</h2></div>
              <ol className="priority-list priority-list--wide">
                {priorities.map((item, idx) => (
                  <li key={item._id || idx}><span className="rank">0{idx + 1}</span><span className="name">{item.name} — {item.district} ({item.hazardType})</span><span className="score">{(item.vulnerabilityScore / 10).toFixed(1)}</span></li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {currentView === 'about' && (() => {
          const kotla = habitations.find(h => h.name === 'Kotla Basti') || {
            name: 'Kotla Basti',
            district: 'Haridwar',
            hazardType: 'Flood',
            population: 4120,
            vulnerabilityScore: 94,
            riskLevel: 'Critical',
            scoreBreakdown: {
              hazardExposure: { raw: 9.5, weight: 0.35, weightedScore: 33.25 },
              populationPressure: { raw: 8.8, weight: 0.25, weightedScore: 22.0 },
              infrastructureGap: { raw: 9.2, weight: 0.20, weightedScore: 18.4 },
              carryingCapacityGap: { raw: 9.8, weight: 0.20, weightedScore: 19.6, safeCapacity: 2800, excessPopulation: 1320 }
            }
          };
          const kotlaExp = getRiskExplanation(kotla);

          return (
            <section className="view is-active" id="view-about">
              <div className="panel panel-full panel-about">
                <div className="panel-head"><h2>How the Risk &amp; Vulnerability Score Works</h2></div>
                <div className="about-grid">
                  <div className="about-card"><span className="about-step">01</span><h3>Hazard Layer (35%)</h3><p>Flood, landslide, cyclone, and erosion probability surfaces are derived from terrain slope, rainfall, and historical events.</p></div>
                  <div className="about-card"><span className="about-step">02</span><h3>Exposure Layer (25%)</h3><p>Habitation boundaries and population counts are overlaid on hazard surfaces to measure human exposure and density.</p></div>
                  <div className="about-card"><span className="about-step">03</span><h3>Vulnerability Layer (20%)</h3><p>Critical infrastructure access gaps (distance to medical centers, paved access roads, and communication shelters).</p></div>
                  <div className="about-card"><span className="about-step">04</span><h3>Carrying Capacity (20%)</h3><p>Terrain ecological capacity and resource limits compared against active density to flag overextended habitations.</p></div>
                </div>

                <div style={{ marginTop: '28px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                        📖 Worked Case Study: {kotla.name} ({kotla.district})
                      </h3>
                      <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748b' }}>
                        Primary Threat: {kotla.hazardType} • Population: {kotla.population?.toLocaleString()} • Safe Capacity: {kotla.scoreBreakdown?.carryingCapacityGap?.safeCapacity?.toLocaleString() || '2,800'}
                      </p>
                    </div>
                    <span className="badge badge-critical" style={{ fontSize: '12px', padding: '4px 10px' }}>
                      Score: {kotla.vulnerabilityScore}/100 ({kotla.riskLevel})
                    </span>
                  </div>

                  <h4 style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 10px 0', color: '#1e293b' }}>
                    Mathematical Breakdown &amp; Weighted Contribution
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>1. HAZARD EXPOSURE</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', margin: '4px 0' }}>
                        33.3 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ 35 pts</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>Raw: 9.5/10 × 35% Weight</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>2. POPULATION PRESSURE</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#ea580c', margin: '4px 0' }}>
                        22.0 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ 25 pts</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>Raw: 8.8/10 × 25% Weight</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>3. INFRASTRUCTURE GAP</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706', margin: '4px 0' }}>
                        18.4 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ 20 pts</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>Raw: 9.2/10 × 20% Weight</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>4. CARRYING CAPACITY GAP</div>
                      <div style={{ fontSize: '18px', fontWeight: 800, color: '#7c3aed', margin: '4px 0' }}>
                        19.6 <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>/ 20 pts</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>Raw: 9.8/10 × 20% Weight (+1,320 excess)</div>
                    </div>
                  </div>

                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px' }}>💡</span>
                      <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>Plain-Language Risk Explanation (Generated by Abhaya Scoring Engine):</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: 1.6 }}>
                      {kotlaExp.detailed}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
      </main>

      {showSosModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '12px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626', margin: 0 }}>🚨 Citizen Emergency SOS</h2>
              <button onClick={() => setShowSosModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer', fontWeight: 700 }}>✕</button>
            </div>

            {/* ── Proximity warning banner ── */}
            {sosProximityWarning === 'far' && (
              <div style={{ background: '#fefce8', border: '1px solid #fbbf24', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#92400e' }}>You appear to be far from any active disaster zone</p>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#78350f' }}>Your location is more than 50 km from all monitored hazard areas. If this is a genuine emergency, please continue. False alarms delay help to real victims.</p>
                </div>
              </div>
            )}
            {sosProximityWarning === 'near' && (
              <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px', flexShrink: 0 }}>📍</span>
                <div>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#991b1b' }}>Active hazard zone detected near your location</p>
                  <p style={{ margin: '3px 0 0', fontSize: '11px', color: '#7f1d1d' }}>Ground teams are on alert. Fill in your details — help is being dispatched to your area.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleVictimSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Your Name:</label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={victimName}
                  onChange={e => setVictimName(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Mobile Phone Number:</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={victimPhone}
                  onChange={e => setVictimPhone(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              {/* ── Severity Level ── */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>Emergency Severity Level:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {[
                    { value: 'critical', label: '🔴 Life-Threatening', desc: 'Immediate evacuation needed', border: '#dc2626', bg: '#fef2f2', active: '#dc2626' },
                    { value: 'serious', label: '🟠 Serious', desc: 'Medical aid within hours', border: '#ea580c', bg: '#fff7ed', active: '#ea580c' },
                    { value: 'moderate', label: '🟡 Moderate', desc: 'Aid needed, not urgent', border: '#ca8a04', bg: '#fefce8', active: '#ca8a04' },
                    { value: 'stable', label: '🟢 Stable', desc: 'Reporting for others', border: '#16a34a', bg: '#f0fdf4', active: '#16a34a' }
                  ].map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setVictimSeverity(s.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: `2px solid ${victimSeverity === s.value ? s.active : '#e2e8f0'}`,
                        background: victimSeverity === s.value ? s.bg : '#f8fafc',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: victimSeverity === s.value ? s.active : '#334155' }}>{s.label}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Choose Current Calamity / Hazard:</label>
                <select
                  value={victimCalamity}
                  onChange={e => setVictimCalamity(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600 }}
                >
                  <option value="Flood">🌊 Flood</option>
                  <option value="Wildfire">🔥 Wildfire</option>
                  <option value="Landslide">⛰️ Landslide</option>
                  <option value="Cyclone">🌪️ Cyclone</option>
                  <option value="Earthquake">🌍 Earthquake</option>
                  <option value="Tsunami">🌊 Tsunami</option>
                  <option value="Lightning/Storm">⚡ Lightning/Storm</option>
                  <option value="Extreme heat">☀️ Extreme heat</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Select Required Aid:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {aidOptions.map(aid => (
                    <label key={aid} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedAids.includes(aid)}
                        onChange={() => toggleAid(aid)}
                      />
                      {aid}
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                style={{
                  width: '100%',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(220, 38, 38, 0.4)'
                }}
              >
                🚨 TRANSMIT EMERGENCY SOS TO GROUND TEAMS
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}