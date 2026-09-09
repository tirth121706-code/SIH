const mongoose = require("mongoose");

const RescueUnitSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    unitCode: { type: String, required: true, unique: true },
    agency: { 
      type: String, 
      enum: ["NDRF", "SDRF", "ODRAF", "Civil Defense", "Coast Guard", "Indian Red Cross"], 
      default: "SDRF" 
    },
    type: { 
      type: String, 
      enum: ["Water Rescue & Boat Staging", "Flood Rapid Response", "Mountain Torrent Rescue", "Coastal Surf Rescue"],
      default: "Water Rescue & Boat Staging" 
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
    proximityToWaterBody: { type: String, default: "" },
    equipment: {
      motorizedBoats: { type: Number, default: 0 },
      inflatableRafts: { type: Number, default: 0 },
      lifeJackets: { type: Number, default: 0 },
      diversOnDuty: { type: Number, default: 0 },
      dronesAvailable: { type: Number, default: 0 }
    },
    personnelCount: { type: Number, default: 12 },
    operationalStatus: { 
      type: String, 
      enum: ["Active / Standby", "Deployed", "Maintenance"], 
      default: "Active / Standby" 
    },
    contact: { type: String, required: true },
    isSeeded: { type: Boolean, default: true },
    notes: { type: String, default: "Placeholder seeded staging location for simulation" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RescueUnit", RescueUnitSchema);
