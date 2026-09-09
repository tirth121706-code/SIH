// backend/services/resourceEstimationService.js
const {
  EVACUATION_RATES,
  SHELTER_UNIT_CAPACITY,
  DAILY_MEALS_PER_PERSON,
  DAILY_WATER_LITRES_PER_PERSON,
  PEOPLE_PER_MEDICAL_KIT,
  PEOPLE_PER_MEDICAL_STAFF
} = require('../config/resourceConfig');

/**
 * Computes explainable relief resource requirements for a habitation zone
 * based on its population, risk level, and carrying capacity deficit.
 */
function estimateResourceNeeds(habitation) {
  const population = Math.max(0, Number(habitation.population) || 0);
  const riskLevel = habitation.riskLevel || 'Medium';
  const excessPop = habitation.scoreBreakdown?.carryingCapacityGap?.excessPopulation || 0;

  // 1. Determine base evacuation rate from risk tier
  const baseRate = EVACUATION_RATES[riskLevel] !== undefined ? EVACUATION_RATES[riskLevel] : 0.20;
  const baseEvacuees = Math.round(population * baseRate);

  // 2. Total evacuees includes base tier rate + excess population exceeding ecological capacity
  // (capped at total population)
  const totalEvacuees = Math.min(population, baseEvacuees + excessPop);

  // 3. Compute logistics units
  const sheltersNeeded = totalEvacuees > 0 ? Math.ceil(totalEvacuees / SHELTER_UNIT_CAPACITY) : 0;
  const dailyFoodRations = totalEvacuees * DAILY_MEALS_PER_PERSON;
  const dailyWaterLitres = Math.round(totalEvacuees * DAILY_WATER_LITRES_PER_PERSON);
  const medicalKitsNeeded = totalEvacuees > 0 ? Math.ceil(totalEvacuees / PEOPLE_PER_MEDICAL_KIT) : 0;
  const medicalPersonnelNeeded = totalEvacuees > 0 ? Math.ceil(totalEvacuees / PEOPLE_PER_MEDICAL_STAFF) : 0;

  // 4. Human-readable explainability text for non-technical judges
  const justificationText = `${habitation.name || 'This zone'} is in ${riskLevel} risk tier, indicating a ${Math.round(baseRate * 100)}% evacuation requirement (${baseEvacuees.toLocaleString()} people)` +
    (excessPop > 0 ? ` plus ${excessPop.toLocaleString()} residents exceeding safe carrying capacity` : '') +
    `. Total estimated evacuees: ${totalEvacuees.toLocaleString()}. Requires ${sheltersNeeded} shelter unit(s) (${SHELTER_UNIT_CAPACITY} capacity each), ${dailyWaterLitres.toLocaleString()}L drinking water daily, and ${medicalPersonnelNeeded} on-site medical staff.`;

  return {
    riskLevel,
    population,
    evacuationPercentage: Math.round((totalEvacuees / (population || 1)) * 100),
    baseEvacuationRate: baseRate,
    excessPopulation: excessPop,
    estimatedEvacuees: totalEvacuees,
    sheltersNeeded,
    shelterCapacityTarget: SHELTER_UNIT_CAPACITY,
    dailyFoodRations,
    dailyWaterLitres,
    medicalKitsNeeded,
    medicalPersonnelNeeded,
    justificationText,
    lastCalculatedAt: new Date()
  };
}

module.exports = {
  estimateResourceNeeds
};
