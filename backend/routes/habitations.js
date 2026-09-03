const express = require('express');
const router = express.Router();
const Habitation = require('../models/Habitation');

router.get('/', async (req, res) => {
  try {
    const habitations = await Habitation.find();
    res.json(habitations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/priorities', async (req, res) => {
  try {
    const priorities = await Habitation.find().sort({ vulnerabilityScore: -1 }).limit(6);
    res.json(priorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalHabitations = await Habitation.countDocuments();
    const criticalZones = await Habitation.countDocuments({ riskLevel: 'Critical' });
    const allHabitations = await Habitation.find();
    const populationAtRisk = allHabitations.reduce((sum, hab) => sum + hab.population, 0);

    res.json({
      totalHabitations,
      criticalZones,
      populationAtRisk,
      relocationsFlagged: criticalZones
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
