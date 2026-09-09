const express = require("express");
const router = express.Router();
const RescueUnit = require("../models/RescueUnit");

// GET /api/rescue-units - List all rescue units (with optional filters)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.isSeeded !== undefined) {
      filter.isSeeded = req.query.isSeeded === "true";
    }
    if (req.query.habitation) {
      filter.assignedHabitation = new RegExp(req.query.habitation, "i");
    }
    if (req.query.agency) {
      filter.agency = req.query.agency;
    }
    if (req.query.status) {
      filter.operationalStatus = req.query.status;
    }

    const units = await RescueUnit.find(filter).sort({ assignedHabitation: 1, name: 1 });
    res.json({
      count: units.length,
      isSeededFilter: req.query.isSeeded !== undefined ? req.query.isSeeded === "true" : null,
      data: units
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/rescue-units/:id - Get specific rescue unit
router.get("/:id", async (req, res) => {
  try {
    const unit = await RescueUnit.findById(req.params.id);
    if (!unit) return res.status(404).json({ error: "Rescue unit not found" });
    res.json(unit);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// POST /api/rescue-units - Create new rescue unit (real or seeded)
router.post("/", async (req, res) => {
  try {
    const unit = await RescueUnit.create(req.body);
    res.status(201).json(unit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
