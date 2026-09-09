// backend/config/riskWeights.js
/**
 * Configurable parameters for the ABHAYA Transparent Risk-Scoring Engine.
 * Problem Statement: SIH26191 (Disaster Management)
 *
 * All factor weights sum to 1.00 (100%).
 * Each factor is normalized to a [0, 10] scale before weighting.
 * Final Vulnerability Score = sum(Factor_i * Weight_i) * 10 (Range: 0 - 100)
 */

module.exports = {
  // 1. Core Multi-Criteria Factor Weights
  WEIGHTS: {
    hazardExposure: 0.35,      // 35% - Proximity to hazard source & hazard severity
    populationPressure: 0.25,  // 25% - Total resident count & cluster density
    infrastructureGap: 0.20,   // 20% - Distance to hospitals & shelters
    carryingCapacityGap: 0.20  // 20% - Population excess over safe ecological limit & terrain
  },

  // 2. Base Hazard Severity Multipliers (Reflects acute life-threat potential)
  HAZARD_SEVERITY: {
    'Landslide': 1.15,      // High acute mortality & sudden debris flow
    'Flood': 1.05,          // Inundation & prolonged displacement
    'River Erosion': 1.00,  // Foundation collapse
    'Cyclone': 1.10,        // Windstorm surge
    'Earthquake': 1.20,     // Structural collapse
    'Tsunami': 1.25,        // Extreme surge energy
    'Wildfire': 1.10,
    'Extreme heat': 0.90
  },

  // 3. Normalization Baseline Ranges
  NORMALIZATION: {
    HAZARD_DISTANCE_MAX_KM: 5.0,
    POPULATION_MAX_BENCHMARK: 5000,
    POPULATION_MIN_BENCHMARK: 500,
    HOSPITAL_DISTANCE_MAX_KM: 10.0,
    SHELTER_DISTANCE_MAX_KM: 5.0,
    TERRAIN_SLOPE_MAX_DEG: 45.0
  },

  // 4. Categorization Thresholds (0 - 100 Scale)
  THRESHOLDS: {
    CRITICAL: 80,  // Relocation priority 1: Active evacuation & decongestion required
    HIGH: 65,      // Priority buffer: Pre-emptive structural defense & relief staging
    MEDIUM: 45,    // Monitored zone: Early warning & drainage maintenance
    LOW: 0         // Stable baseline: Safe destination zone for evacuees
  }
};
