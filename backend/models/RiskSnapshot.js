// backend/models/RiskSnapshot.js
const mongoose = require("mongoose");

const RiskSnapshotSchema = new mongoose.Schema(
  {
    habitationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habitation",
      required: true,
      index: true
    },
    habitationName: { type: String, required: true },
    vulnerabilityScore: { type: Number, required: true, min: 0, max: 100 },
    riskLevel: { type: String, required: true },
    hazardType: { type: String, default: "Flood" },
    factorBreakdown: {
      hazardExposure: Number,
      populationPressure: Number,
      infrastructureGap: Number,
      carryingCapacityGap: Number
    },
    triggerEvent: { type: String, default: "Routine Weekly Audit" },
    recordedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

// Compound index for fast chronological sorting per zone
RiskSnapshotSchema.index({ habitationId: 1, recordedAt: -1 });

module.exports = mongoose.model("RiskSnapshot", RiskSnapshotSchema);
