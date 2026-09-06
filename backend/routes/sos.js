const express = require("express");
const router = express.Router();
const Sos = require("../models/Sos");

router.get("/", async (req, res) => {
  try {
    const requests = await Sos.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { victimName, phone, calamity, aidList, coords } = req.body;
    if (!victimName || !phone || !coords) {
      return res.status(400).json({ error: "victimName, phone, and coords are required" });
    }
    const sos = await Sos.create({ victimName, phone, calamity, aidList, coords });
    res.status(201).json(sos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending Dispatch", "En Route", "Resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }
    const updated = await Sos.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!updated) return res.status(404).json({ error: "SOS record not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Sos.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "SOS record not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

module.exports = router;