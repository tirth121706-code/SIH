const mongoose = require("mongoose");

const ReliefDepotSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    depotCode: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ["District Civil Supply Warehouse", "Emergency Water & Ration Hub", "Red Cross Supply Depot", "Mobile Logistics Node"],
      default: "Emergency Water & Ration Hub"
    },
    coords: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "coords must be [lat, lng]"
      }
    },
    assignedHabitation: { type: String, required: true },
    accessCorridor: { type: String, default: "" },
    supplies: {
      potableWaterLitres: { type: Number, default: 20000 },
      waterPurificationKits: { type: Number, default: 500 },
      foodRationPacks: { type: Number, default: 3500 },
      tarpaulinsAndTents: { type: Number, default: 800 },
      blanketsAndBedding: { type: Number, default: 1200 }
    },
    dailyDistributionCapacity: { type: String, default: "5,000 persons/day" },
    operationalStatus: { 
      type: String, 
      enum: ["Stocked & Ready", "Distributing", "Restocking"], 
      default: "Stocked & Ready" 
    },
    contact: { type: String, required: true },
    isSeeded: { type: Boolean, default: true },
    notes: { type: String, default: "Placeholder seeded supply location for simulation" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReliefDepot", ReliefDepotSchema);
