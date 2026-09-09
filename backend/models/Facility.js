const mongoose = require("mongoose");

const FacilitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["Hospital", "Relocation Center", "Medic Post", "Rescue Unit", "Relief Depot"],
      required: true,
    },
    coords: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "coords must be [lat, lng]",
      },
    },
    capacity: { type: String, default: "" },
    medicalSupport: { type: String, default: "" },
    contact: { type: String, default: "" },
    doctorCount: { type: Number, default: 0 },
    bedsAvailable: { type: Number, default: 0 },
    assignedHabitation: { type: String, default: "" },
    equipment: { type: mongoose.Schema.Types.Mixed, default: {} },
    supplies: { type: mongoose.Schema.Types.Mixed, default: {} },
    isSeeded: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Facility", FacilitySchema);