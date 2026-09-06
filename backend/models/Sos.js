const mongoose = require("mongoose");

const SosSchema = new mongoose.Schema(
  {
    victimName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    calamity: {
      type: String,
      enum: ["Flood", "Heavy Rain", "Heatwave (Loo)", "Earthquake", "Cyclone / Tsunami"],
      default: "Flood",
    },
    aidList: { type: [String], default: [] },
    coords: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "coords must be [lat, lng]",
      },
    },
    status: {
      type: String,
      enum: ["Pending Dispatch", "En Route", "Resolved"],
      default: "Pending Dispatch",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sos", SosSchema);