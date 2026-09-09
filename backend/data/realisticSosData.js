// backend/data/realisticSosData.js

const REGIONAL_ZONES = [
  {
    key: "wayanad",
    name: "Chooralmala (Wayanad)",
    coords: [11.5450, 76.1550],
    calamity: "Landslide / Debris Flow",
    severities: ["critical", "critical", "serious", "critical", "serious"],
    aidOptions: [
      ["Heavy Earthmover", "Emergency Stretcher", "Trauma Stabilization Kit"],
      ["Search & Rescue Dogs", "Oxygen Cylinders", "Emergency Splints"],
      ["Rescue Stretcher", "Clean Drinking Water", "Trauma Kit"],
      ["Debris Clearance Unit", "IV Fluids & Wound Dressing", "Emergency Blankets"]
    ],
    names: [
      "Sujith Menon",
      "Ananya Nambiar",
      "Jithin Thomas",
      "Fathima Raheem",
      "Vineeth K. Nair",
      "Aswathy Pillai"
    ],
    phonePrefix: "+91-9847"
  },
  {
    key: "varanasi",
    name: "Kotla Basti",
    coords: [25.3176, 82.9739],
    calamity: "Ganga River Inundation",
    severities: ["critical", "serious", "serious", "moderate"],
    aidOptions: [
      ["Inflatable Motorboat", "Life Jackets", "Clean Drinking Water"],
      ["Rescue Raft", "ORS & Oral Rehydration", "Dry Food Rations"],
      ["Flood Evacuation Boat", "Emergency Medical Kit", "Water Purification Tablets"],
      ["High-Ground Tents", "Infant Baby Food", "Chlorine Tablets"]
    ],
    names: [
      "Rajeshwar Pandey",
      "Sunita Devi",
      "Amitabh Tripathi",
      "Mohammad Farooqi",
      "Pooja Yadav"
    ],
    phonePrefix: "+91-9450"
  },
  {
    key: "kathmandu",
    name: "Kathmandu Valley",
    coords: [27.6850, 85.3150],
    calamity: "Flash River Overflow",
    severities: ["critical", "critical", "serious", "moderate"],
    aidOptions: [
      ["Rescue Raft", "Rope Rescue Team", "High-Energy Food Rations"],
      ["Thermal Blankets", "Clean Water Jerricans", "Trauma Kit"],
      ["Inflatable Boat", "Emergency Lighting & Megaphones", "First-Aid Supplies"],
      ["Stretcher Team", "Emergency Antibiotics", "Clean Water"]
    ],
    names: [
      "Bikash Shrestha",
      "Srijana Thapa",
      "Dipendra Koirala",
      "Aayush Maharjan",
      "Pema Tamang"
    ],
    phonePrefix: "+977-9841"
  },
  {
    key: "visakhapatnam",
    name: "Vasant Vihar",
    coords: [17.6880, 83.2195],
    calamity: "Urban Storm Inundation",
    severities: ["serious", "serious", "moderate", "moderate"],
    aidOptions: [
      ["High-Capacity Dewatering Pump", "Emergency First-Aid Kit", "Dry Rations"],
      ["Drinking Water Tanker", "Rescue Dinghy", "Electrical Line Repair Unit"],
      ["Emergency Medical Kit", "Clean Water Cans", "Temporary Sandbags"]
    ],
    names: [
      "Venkatesh Rao",
      "Lakshmi Prasanna",
      "Chaitanya Varma",
      "K. Srinivas Reddy"
    ],
    phonePrefix: "+91-9866"
  }
];

module.exports = {
  REGIONAL_ZONES
};
