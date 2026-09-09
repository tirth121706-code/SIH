const mongoose = require("mongoose");

const HabitationSchema = new mongoose.Schema(
  {
    // Identification & GIS Metadata
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    state: { type: String, default: "India" },
    coords: { type: [Number], default: [0, 0] },

    // 1. Observable Physical Input Factors
    hazardType: { type: String, required: true, trim: true },
    hazardDistanceKm: { type: Number, default: 0.5 },
    hazardDistance: { type: String, default: "0.5 km" },
    population: { type: Number, required: true, min: 0, default: 1000 },
    households: { type: Number, default: 200 },
    areaSqKm: { type: Number, default: 1.0 },
    slopeAngleDeg: { type: Number, default: 5 },
    nearestHospitalKm: { type: Number, default: 2.0 },
    nearestShelterKm: { type: Number, default: 1.0 },
    safeCarryingCapacity: { type: Number, default: 1500 },

    // 2. Computed Risk Indicators
    vulnerabilityScore: { type: Number, min: 0, max: 100, default: 0 },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "Moderate", "High", "Critical"],
      default: "Low"
    },
    carryingCapacityStatus: {
      type: String,
      enum: ["Within limit", "Near limit", "Exceeded"],
      default: "Within limit"
    },

    // 3. Transparent Factor Breakdown & Explainability
    scoreBreakdown: {
      hazardExposure: { raw: Number, weight: Number, weightedScore: Number },
      populationPressure: { raw: Number, weight: Number, weightedScore: Number },
      infrastructureGap: { raw: Number, weight: Number, weightedScore: Number },
      carryingCapacityGap: {
        raw: Number,
        weight: Number,
        weightedScore: Number,
        safeCapacity: Number,
        excessPopulation: Number
      }
    },
    topDrivers: [
      {
        name: String,
        key: String,
        weighted: Number,
        raw: Number
      }
    ],
    explanationText: { type: String, default: "" },

    // 4. Relief Resource Need Estimation (NDMA / SPHERE Aligned)
    resourceEstimates: {
      evacuationPercentage: { type: Number, default: 0 },
      baseEvacuationRate: { type: Number, default: 0 },
      excessPopulation: { type: Number, default: 0 },
      estimatedEvacuees: { type: Number, default: 0 },
      sheltersNeeded: { type: Number, default: 0 },
      shelterCapacityTarget: { type: Number, default: 500 },
      dailyFoodRations: { type: Number, default: 0 },
      dailyWaterLitres: { type: Number, default: 0 },
      medicalKitsNeeded: { type: Number, default: 0 },
      medicalPersonnelNeeded: { type: Number, default: 0 },
      justificationText: { type: String, default: "" },
      lastCalculatedAt: { type: Date, default: Date.now }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Habitation", HabitationSchema);