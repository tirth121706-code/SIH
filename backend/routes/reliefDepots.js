const express = require("express");
const router = express.Router();
const ReliefDepot = require("../models/ReliefDepot");

// GET /api/relief-depots - List all relief depots (with optional filters)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.isSeeded !== undefined) {
      filter.isSeeded = req.query.isSeeded === "true";
    }
    if (req.query.habitation) {
      filter.assignedHabitation = new RegExp(req.query.habitation, "i");
    }
    if (req.query.status) {
      filter.operationalStatus = req.query.status;
    }

    const depots = await ReliefDepot.find(filter).sort({ assignedHabitation: 1, name: 1 });
    res.json({
      count: depots.length,
      isSeededFilter: req.query.isSeeded !== undefined ? req.query.isSeeded === "true" : null,
      data: depots
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/relief-depots/:id - Get specific relief depot
router.get("/:id", async (req, res) => {
  try {
    const depot = await ReliefDepot.findById(req.params.id);
    if (!depot) return res.status(404).json({ error: "Relief depot not found" });
    res.json(depot);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// POST /api/relief-depots - Create new relief depot (real or seeded)
router.post("/", async (req, res) => {
  try {
    const depot = await ReliefDepot.create(req.body);
    res.status(201).json(depot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
