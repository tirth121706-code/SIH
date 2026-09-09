// backend/services/riskScoringService.js
const { WEIGHTS, HAZARD_SEVERITY, NORMALIZATION, THRESHOLDS } = require('../config/riskWeights');

/**
 * Transparent Multi-Criteria Risk Scoring Engine (SIH26191)
 * Computes an explainable 0-100 score + factor breakdown from observable physical indicators,
 * with optional folding of live meteorological/weather forecast data.
 *
 * @param {Object} input - Habitation observable characteristics + optional liveWeather
 * @returns {Object} Computed risk evaluation and explainability narrative
 */
function computeRiskScore(input) {
  const {
    hazardType = 'Flood',
    hazardDistanceKm = 0.5,
    population = 2000,
    households = 400,
    areaSqKm = 1.0,
    slopeAngleDeg = 10,
    nearestHospitalKm = 2.0,
    nearestShelterKm = 1.0,
    safeCarryingCapacity = 1500,
    liveWeather = null
  } = input;

  // --- Factor 1: Hazard Exposure & Proximity (35%) ---
  const dist = Math.max(0, Number(hazardDistanceKm) || 0);
  let rawExposure = 10 * Math.exp(-0.45 * dist);
  const multiplier = HAZARD_SEVERITY[hazardType] || 1.0;
  rawExposure = Math.min(10, Math.max(1, +(rawExposure * multiplier).toFixed(1)));

  // --- Factor 2: Population Pressure & Density (25%) ---
  const pop = Math.max(0, Number(population) || 0);
  const density = pop / Math.max(0.2, Number(areaSqKm) || 1.0);
  let rawPop = (pop / NORMALIZATION.POPULATION_MAX_BENCHMARK) * 8.0 + (density / 4000) * 2.0;
  rawPop = Math.min(10, Math.max(1, +rawPop.toFixed(1)));

  // --- Factor 3: Infrastructure Fragility & Access Gap (20%) ---
  const hospDist = Math.max(0, Number(nearestHospitalKm) || 2.0);
  const shelterDist = Math.max(0, Number(nearestShelterKm) || 1.0);
  let rawInfra = (hospDist / NORMALIZATION.HOSPITAL_DISTANCE_MAX_KM) * 6.0 +
                 (shelterDist / NORMALIZATION.SHELTER_DISTANCE_MAX_KM) * 4.0;
  rawInfra = Math.min(10, Math.max(1, +rawInfra.toFixed(1)));

  // --- Factor 4: Terrain & Carrying Capacity Gap (20%) ---
  const safeCap = Math.max(100, Number(safeCarryingCapacity) || 1500);
  const excessPop = Math.max(0, pop - safeCap);
  const capacityRatio = pop / safeCap;

  let capacityScore = 2.0;
  let carryingCapacityStatus = 'Within limit';
  if (capacityRatio > 1.25 || excessPop > 500) {
    carryingCapacityStatus = 'Exceeded';
    capacityScore = 7.0 + Math.min(3.0, (excessPop / 1500) * 3.0);
  } else if (capacityRatio >= 0.95) {
    carryingCapacityStatus = 'Near limit';
    capacityScore = 5.5 + Math.min(2.0, (capacityRatio - 0.95) * 10.0);
  }

  const slope = Math.max(0, Number(slopeAngleDeg) || 0);
  const slopeBonus = Math.min(2.0, (slope / NORMALIZATION.TERRAIN_SLOPE_MAX_DEG) * 2.0);
  const rawCapacity = Math.min(10, Math.max(1, +(capacityScore + (hazardType === 'Landslide' ? slopeBonus : 0)).toFixed(1)));

  // --- Weighted Sum Calculation (0 - 100) ---
  const weightedExposure = +(rawExposure * WEIGHTS.hazardExposure).toFixed(2);
  const weightedPop = +(rawPop * WEIGHTS.populationPressure).toFixed(2);
  const weightedInfra = +(rawInfra * WEIGHTS.infrastructureGap).toFixed(2);
  const weightedCapacity = +(rawCapacity * WEIGHTS.carryingCapacityGap).toFixed(2);

  const rawSum = weightedExposure + weightedPop + weightedInfra + weightedCapacity;
  const baseVulnerabilityScore = Math.min(100, Math.max(10, Math.round(rawSum * 10)));

  // --- Fold Live Weather Elevation (Constraint 2) ---
  let weatherBonus = 0;
  let weatherPhrase = '';
  if (liveWeather && liveWeather.isElevating) {
    weatherBonus = Number(liveWeather.elevationScoreBonus) || 0;
    if (liveWeather.rainfall24hMm > 0) {
      weatherPhrase = `${liveWeather.rainfall24hMm}mm rainfall forecasted in the next 24h`;
    } else if (liveWeather.weatherSummaryText) {
      weatherPhrase = liveWeather.weatherSummaryText;
    }
  }

  const vulnerabilityScore = Math.min(100, Math.max(10, baseVulnerabilityScore + weatherBonus));

  let riskLevel = 'Low';
  if (vulnerabilityScore >= THRESHOLDS.CRITICAL) riskLevel = 'Critical';
  else if (vulnerabilityScore >= THRESHOLDS.HIGH) riskLevel = 'High';
  else if (vulnerabilityScore >= THRESHOLDS.MEDIUM) riskLevel = 'Medium';

  const factors = [
    { name: 'Hazard Proximity & Exposure', key: 'hazardExposure', weighted: weightedExposure, raw: rawExposure },
    { name: 'Population Density', key: 'populationPressure', weighted: weightedPop, raw: rawPop },
    { name: 'Infrastructure Access Gap', key: 'infrastructureGap', weighted: weightedInfra, raw: rawInfra },
    { name: 'Carrying Capacity Deficit', key: 'carryingCapacityGap', weighted: weightedCapacity, raw: rawCapacity }
  ].sort((a, b) => b.weighted - a.weighted);

  const topDrivers = [factors[0], factors[1]];

  const settlementName = input.name || 'This zone';
  let explanationText = '';
  if (weatherPhrase) {
    explanationText = `${settlementName} is classified as ${riskLevel} (${vulnerabilityScore}/100) primarily due to ${topDrivers[0].name.toLowerCase()} (${topDrivers[0].raw}/10), compounded by ${weatherPhrase}, alongside ${topDrivers[1].name.toLowerCase()} (${topDrivers[1].raw}/10).`;
  } else {
    explanationText = `${settlementName} is classified as ${riskLevel} (${vulnerabilityScore}/100) primarily due to ${topDrivers[0].name.toLowerCase()} (${topDrivers[0].raw}/10), compounded by ${topDrivers[1].name.toLowerCase()} (${topDrivers[1].raw}/10).`;
  }

  if (excessPop > 0) {
    explanationText += ' Safe ecological carrying capacity is exceeded by ~' + excessPop.toLocaleString() + ' residents, requiring prioritized decongestion.';
  }

  return {
    vulnerabilityScore,
    baseVulnerabilityScore,
    riskLevel,
    carryingCapacityStatus,
    scoreBreakdown: {
      hazardExposure: {
        raw: rawExposure,
        weight: WEIGHTS.hazardExposure,
        weightedScore: weightedExposure
      },
      populationPressure: {
        raw: rawPop,
        weight: WEIGHTS.populationPressure,
        weightedScore: weightedPop
      },
      infrastructureGap: {
        raw: rawInfra,
        weight: WEIGHTS.infrastructureGap,
        weightedScore: weightedInfra
      },
      carryingCapacityGap: {
        raw: rawCapacity,
        weight: WEIGHTS.carryingCapacityGap,
        weightedScore: weightedCapacity,
        safeCapacity: safeCap,
        excessPopulation: excessPop
      }
    },
    topDrivers,
    explanationText,
    liveWeather: liveWeather || null
  };
}

module.exports = {
  computeRiskScore
};
