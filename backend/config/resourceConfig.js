// backend/config/resourceConfig.js
module.exports = {
  // Evacuation percentage assumption by risk tier (NDMA-aligned)
  EVACUATION_RATES: {
    Critical: 0.60,  // 60% of population
    High: 0.35,      // 35% of population
    Medium: 0.15,    // 15% of population
    Moderate: 0.15,  // Alias for Medium
    Low: 0.05        // 5% of population
  },

  // Standard emergency logistics planning units
  SHELTER_UNIT_CAPACITY: 500,         // Evacuees per standard relief camp unit
  DAILY_MEALS_PER_PERSON: 2,          // Ready-to-eat ration packets per evacuee / day
  DAILY_WATER_LITRES_PER_PERSON: 4.0, // Litres of potable drinking water / evacuee / day (SPHERE Standard)
  PEOPLE_PER_MEDICAL_KIT: 50,         // 1 trauma/first-aid kit per 50 evacuees
  PEOPLE_PER_MEDICAL_STAFF: 150       // 1 healthcare provider per 150 evacuees
};
