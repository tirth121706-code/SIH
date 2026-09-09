const express = require("express");
const router = express.Router();
const Habitation = require("../models/Habitation");
const { computeRiskScore } = require("../services/riskScoringService");
const { estimateResourceNeeds } = require("../services/resourceEstimationService");
const {
  evaluateTrend,
  getZoneTrendHistory,
  detectAllAnomalies
} = require("../services/trendAnalysisService");
const { enrichHabitationWithWeather } = require("../services/weatherService");

// 1. GET / - Fetch all habitations (enriched with live weather for weather-driven hazard zones)
router.get("/", async (req, res) => {
  try {
    const habitations = await Habitation.find().sort({ vulnerabilityScore: -1 });
    const enriched = await Promise.all(habitations.map(h => enrichHabitationWithWeather(h)));
    enriched.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /priorities - Ranked list of zones by risk (Relocation Priority List)
router.get("/priorities", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const habitations = await Habitation.find().sort({ vulnerabilityScore: -1 });
    const enriched = await Promise.all(habitations.map(h => enrichHabitationWithWeather(h)));
    enriched.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);
    const topHabitations = enriched.slice(0, limit);

    const rankedPriorities = topHabitations.map((hab, index) => {
      const excess = hab.scoreBreakdown?.carryingCapacityGap?.excessPopulation || 0;
      return {
        rank: index + 1,
        _id: hab._id,
        name: hab.name,
        district: hab.district,
        state: hab.state,
        coords: hab.coords,
        hazardType: hab.hazardType,
        vulnerabilityScore: hab.vulnerabilityScore,
        riskLevel: hab.riskLevel,
        population: hab.population,
        carryingCapacityStatus: hab.carryingCapacityStatus,
        excessPopulation: excess,
        topDrivers: hab.topDrivers || [],
        explanationText: hab.explanationText || "",
        liveWeather: hab.liveWeather || null,
        urgency:
          hab.riskLevel === "Critical"
            ? "Immediate Relocation Priority"
            : hab.riskLevel === "High"
            ? "Pre-emptive Defense & Buffer"
            : "Routine Monitoring"
      };
    });

    res.json(rankedPriorities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. GET /stats - Dashboard summary data: top-N critical zones, risk distribution
router.get("/stats", async (req, res) => {
  try {
    const totalHabitations = await Habitation.countDocuments();
    const criticalZones = await Habitation.countDocuments({ riskLevel: "Critical" });
    const highZones = await Habitation.countDocuments({ riskLevel: "High" });
    const mediumZones = await Habitation.countDocuments({ riskLevel: "Medium" });
    const lowZones = await Habitation.countDocuments({ riskLevel: "Low" });

    const allHabitations = await Habitation.find();
    const populationAtRisk = allHabitations
      .filter((h) => h.riskLevel === "Critical" || h.riskLevel === "High")
      .reduce((sum, hab) => sum + (hab.population || 0), 0);

    const totalExcessPopulation = allHabitations.reduce((sum, hab) => {
      const excess = hab.scoreBreakdown?.carryingCapacityGap?.excessPopulation || 0;
      return sum + excess;
    }, 0);

    const topCriticalZones = allHabitations
      .filter((h) => h.riskLevel === "Critical")
      .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
      .slice(0, 3)
      .map((h) => ({
        name: h.name,
        score: h.vulnerabilityScore,
        hazardType: h.hazardType,
        excessPopulation: h.scoreBreakdown?.carryingCapacityGap?.excessPopulation || 0
      }));

    res.json({
      totalHabitations,
      criticalZones,
      highZones,
      mediumZones,
      lowZones,
      riskDistribution: {
        Critical: criticalZones,
        High: highZones,
        Medium: mediumZones,
        Low: lowZones
      },
      populationAtRisk,
      totalExcessPopulation,
      relocationsFlagged: criticalZones + highZones,
      topCriticalZones
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3b. GET /resources/aggregate - Total estimated relief resource needs across all Critical & High risk zones
router.get("/resources/aggregate", async (req, res) => {
  try {
    const habitations = await Habitation.find({
      riskLevel: { $in: ["Critical", "High"] }
    }).sort({ vulnerabilityScore: -1 });

    const summary = {
      totalZonesConsidered: habitations.length,
      criticalZonesCount: habitations.filter((h) => h.riskLevel === "Critical").length,
      highZonesCount: habitations.filter((h) => h.riskLevel === "High").length,
      totalPopulationAtRisk: habitations.reduce((sum, h) => sum + (h.population || 0), 0),
      totalEstimatedEvacuees: 0,
      totalSheltersRequired: 0,
      totalDailyFoodRations: 0,
      totalDailyWaterLitres: 0,
      totalMedicalKitsRequired: 0,
      totalMedicalPersonnelRequired: 0
    };

    const zoneBreakdown = habitations.map((hab) => {
      // Use existing or compute on the fly
      const estimates = hab.resourceEstimates?.estimatedEvacuees
        ? hab.resourceEstimates
        : estimateResourceNeeds(hab);

      summary.totalEstimatedEvacuees += estimates.estimatedEvacuees || 0;
      summary.totalSheltersRequired += estimates.sheltersNeeded || 0;
      summary.totalDailyFoodRations += estimates.dailyFoodRations || 0;
      summary.totalDailyWaterLitres += estimates.dailyWaterLitres || 0;
      summary.totalMedicalKitsRequired += estimates.medicalKitsNeeded || 0;
      summary.totalMedicalPersonnelRequired += estimates.medicalPersonnelNeeded || 0;

      return {
        _id: hab._id,
        name: hab.name,
        district: hab.district,
        riskLevel: hab.riskLevel,
        vulnerabilityScore: hab.vulnerabilityScore,
        population: hab.population,
        resourceEstimates: estimates
      };
    });

    res.json({
      summary,
      zoneBreakdown
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to aggregate resource needs", details: err.message });
  }
});

// 3c. GET /trends/anomalies - Get all habitation zones with anomalous risk score spikes
router.get("/trends/anomalies", async (req, res) => {
  try {
    const anomalyReport = await detectAllAnomalies(Habitation);
    res.json(anomalyReport);
  } catch (err) {
    res.status(500).json({ error: "Failed to detect risk anomalies", details: err.message });
  }
});

// 4. POST /simulate-score - Test a hypothetical scenario without saving to DB (Sandbox)
router.post("/simulate-score", (req, res) => {
  try {
    const evaluation = computeRiskScore(req.body);
    res.json({
      success: true,
      simulation: evaluation
    });
  } catch (err) {
    res.status(400).json({ error: "Simulation failed", details: err.message });
  }
});

// 5. POST /:id/recompute - Recompute or compute a zone's score using observable inputs
router.post("/:id/recompute", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });

    // Merge any overriding inputs from request body
    const inputData = {
      name: req.body.name || habitation.name,
      hazardType: req.body.hazardType || habitation.hazardType,
      hazardDistanceKm: req.body.hazardDistanceKm ?? habitation.hazardDistanceKm,
      population: req.body.population ?? habitation.population,
      households: req.body.households ?? habitation.households,
      areaSqKm: req.body.areaSqKm ?? habitation.areaSqKm,
      slopeAngleDeg: req.body.slopeAngleDeg ?? habitation.slopeAngleDeg,
      nearestHospitalKm: req.body.nearestHospitalKm ?? habitation.nearestHospitalKm,
      nearestShelterKm: req.body.nearestShelterKm ?? habitation.nearestShelterKm,
      safeCarryingCapacity: req.body.safeCarryingCapacity ?? habitation.safeCarryingCapacity
    };

    const computed = computeRiskScore(inputData);

    habitation.vulnerabilityScore = computed.vulnerabilityScore;
    habitation.riskLevel = computed.riskLevel;
    habitation.carryingCapacityStatus = computed.carryingCapacityStatus;
    habitation.scoreBreakdown = computed.scoreBreakdown;
    habitation.topDrivers = computed.topDrivers;
    habitation.explanationText = computed.explanationText;
    habitation.resourceEstimates = estimateResourceNeeds(habitation);

    if (req.body.hazardDistanceKm !== undefined) {
      habitation.hazardDistanceKm = req.body.hazardDistanceKm;
      habitation.hazardDistance = `${req.body.hazardDistanceKm} km`;
    }

    await habitation.save();
    res.json({
      message: "Score recomputed and updated successfully",
      habitation
    });
  } catch (err) {
    res.status(400).json({ error: "Recomputation failed", details: err.message });
  }
});

// 6. GET /:id/score - Fetch a zone's score + factor breakdown + plain-language explanation
router.get("/:id/score", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });

    const enriched = await enrichHabitationWithWeather(habitation);

    res.json({
      name: enriched.name,
      district: enriched.district,
      hazardType: enriched.hazardType,
      coords: enriched.coords,
      vulnerabilityScore: enriched.vulnerabilityScore,
      riskLevel: enriched.riskLevel,
      carryingCapacityStatus: enriched.carryingCapacityStatus,
      scoreBreakdown: enriched.scoreBreakdown,
      topDrivers: enriched.topDrivers,
      explanationText: enriched.explanationText,
      resourceEstimates: enriched.resourceEstimates,
      liveWeather: enriched.liveWeather || null
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// 6b. GET /:id/resources - Fetch a single zone's relief resource need estimates
router.get("/:id/resources", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });

    const resourceEstimates = habitation.resourceEstimates?.estimatedEvacuees
      ? habitation.resourceEstimates
      : estimateResourceNeeds(habitation);

    res.json({
      zoneId: habitation._id,
      name: habitation.name,
      district: habitation.district,
      riskLevel: habitation.riskLevel,
      vulnerabilityScore: habitation.vulnerabilityScore,
      population: habitation.population,
      resourceEstimates
    });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID", details: err.message });
  }
});

// 6c. GET /:id/trends - Fetch time-series historical trend & anomaly status for a single zone
router.get("/:id/trends", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });

    const limit = parseInt(req.query.periods) || 8;
    const snapshots = await getZoneTrendHistory(habitation._id, limit);
    const trendAnalysis = evaluateTrend(snapshots, habitation.vulnerabilityScore);

    res.json({
      habitationId: habitation._id,
      name: habitation.name,
      district: habitation.district,
      currentScore: habitation.vulnerabilityScore,
      currentRiskLevel: habitation.riskLevel,
      trendAnalysis,
      snapshots
    });
  } catch (err) {
    res.status(400).json({ error: "Failed to fetch trend history", details: err.message });
  }
});

// 7. GET /:id - Fetch single habitation
router.get("/:id", async (req, res) => {
  try {
    const habitation = await Habitation.findById(req.params.id);
    if (!habitation) return res.status(404).json({ error: "Habitation not found" });
    res.json(habitation);
  } catch (err) {
    res.status(400).json({ error: "Invalid ID" });
  }
});

// 8. POST / - Create new habitation (automatically computes score)
router.post("/", async (req, res) => {
  try {
    const computed = computeRiskScore(req.body);
    const habitationData = {
      ...req.body,
      vulnerabilityScore: computed.vulnerabilityScore,
      riskLevel: computed.riskLevel,
      carryingCapacityStatus: computed.carryingCapacityStatus,
      scoreBreakdown: computed.scoreBreakdown,
      topDrivers: computed.topDrivers,
      explanationText: computed.explanationText
    };
    habitationData.resourceEstimates = estimateResourceNeeds(habitationData);

    const habitation = await Habitation.create(habitationData);
    res.status(201).json(habitation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 9. PUT /:id - Update habitation
router.put("/:id", async (req, res) => {
  try {
    const updated = await Habitation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!updated) return res.status(404).json({ error: "Habitation not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 10. DELETE /:id - Delete habitation
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