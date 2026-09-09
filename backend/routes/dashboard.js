// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const { getPredictionDashboardSummary } = require('../services/dashboardService');

// GET /api/dashboard/prediction-summary - Unified prediction and command center feed
router.get('/prediction-summary', async (req, res) => {
  try {
    const topN = req.query.topN ? parseInt(req.query.topN) : 5;
    const windowMinutes = req.query.window ? parseInt(req.query.window) : 60;

    const summary = await getPredictionDashboardSummary(topN, windowMinutes);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate prediction dashboard summary', details: err.message });
  }
});

module.exports = router;
