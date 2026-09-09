const mongoose = require("mongoose");

const SosSchema = new mongoose.Schema(
  {
    victimName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    severity: {
      type: String,
      enum: ["critical", "serious", "moderate", "stable"],
      default: "serious"
    },
    calamity: {
      type: String,
      default: "Flood"
    },
    aidList: { type: [String], default: [] },
    coords: {
      type: [Number],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length === 2,
        message: "coords must be [lat, lng]"
      }
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        default: [0, 0] // [lng, lat]
      }
    },
    status: {
      type: String,
      enum: ["Pending Dispatch", "En Route", "Resolved"],
      default: "Pending Dispatch"
    },
    isSimulated: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Compound index for rolling-window queries
SosSchema.index({ status: 1, createdAt: -1 });
// 2dsphere spatial index for geo-queries
SosSchema.index({ location: "2dsphere" });

// Auto-sync GeoJSON location from coords before saving
SosSchema.pre("save", function (next) {
  if (this.coords && this.coords.length === 2) {
    this.location = {
      type: "Point",
      coordinates: [this.coords[1], this.coords[0]] // [lng, lat]
    };
  }
  next();
});

module.exports = mongoose.model("Sos", SosSchema);