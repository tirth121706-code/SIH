const mongoose = require("mongoose");

const HabitationSchema = new mongoose.Schema({
  name: String,
  district: String,
  hazardType: String,
  population: Number,
  households: Number,
  hazardDistance: String,
  carryingCapacityStatus: String,
  vulnerabilityScore: Number,
  riskLevel: String,
});

module.exports = mongoose.model("Habitation", HabitationSchema);