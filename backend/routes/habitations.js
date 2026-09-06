const express = require("express");
const router = express.Router();
const Habitation = require("../models/Habitation");

router.get("/", async (req, res) => {
  try {
    const habitations = await Habitation.find();
    res.json(habitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/priorities", async (req, res) => {
  try {
    const priorities = await Habitation.find().sort({ vulnerabilityScore: -1 }).limit(6);
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalHabitations = await Habitation.countDocuments();
    const criticalZones = await Habitation.countDocuments({ riskLevel: "Critical" });
    const highZones = await Habitation.countDocuments({ riskLevel: "High" });
    const allHabitations = await Habitation.find();
    const populationAtRisk = allHabitations
      .filter((h) => h.riskLevel === "Critical" || h.riskLevel === "High")
      .reduce((sum, hab) => sum + (hab.population || 0), 0);

    res.json({
      totalHabitations,
      criticalZones,
      populationAtRisk,
      relocationsFlagged: criticalZones + highZones,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });
    res.json(habitation);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

router.post("/", async (req, res) => {
  try {
    const habitation = await Habitation.create(req.body);
    res.status(201).json(habitation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated = await Habitation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: "Habitation not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Habitation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Habitation not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;