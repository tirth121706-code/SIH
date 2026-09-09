// backend/services/dashboardService.js
const Habitation = require('../models/Habitation');
const { detectHotspots } = require('./hotspotService');
const { estimateResourceNeeds } = require('./resourceEstimationService');
const { detectAllAnomalies } = require('./trendAnalysisService');
const { enrichHabitationWithWeather } = require('./weatherService');

/**
 * Orchestrates and aggregates data from all 4 analytical engines:
 * 1. Risk Scoring & Prioritization
 * 2. Real-Time SOS Hotspots (DBSCAN-lite)
 * 3. Relief Logistics & Resource Needs (NDMA)
 * 4. Time-Series Trends & Sudden Anomaly Detection
 */
async function getPredictionDashboardSummary(topN = 5, hotspotWindowMinutes = 60) {
  // Execute all asynchronous queries in parallel for sub-50ms performance
  const [rawHabitations, hotspotResult, anomalyResult] = await Promise.all([
    Habitation.find().sort({ vulnerabilityScore: -1 }),
    detectHotspots(hotspotWindowMinutes),
    detectAllAnomalies(Habitation)
  ]);

  const allHabitations = await Promise.all(rawHabitations.map(h => enrichHabitationWithWeather(h)));
  allHabitations.sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore);

  // 1. Status Aggregation
  const criticalCount = allHabitations.filter(h => h.riskLevel === 'Critical').length;
  const highCount = allHabitations.filter(h => h.riskLevel === 'High').length;
  const populationAtRisk = allHabitations
    .filter(h => h.riskLevel === 'Critical' || h.riskLevel === 'High')
    .reduce((sum, h) => sum + (h.population || 0), 0);

  const overallThreatLevel =
    criticalCount > 0 || hotspotResult.activeHotspotsCount > 0
      ? 'CRITICAL'
      : highCount > 0
      ? 'HIGH'
      : 'MODERATE';

  // 2. Resource Logistics Aggregation (Across all Critical and High zones)
  const resourceSummary = {
    totalEstimatedEvacuees: 0,
    totalSheltersRequired: 0,
    totalDailyFoodRations: 0,
    totalDailyWaterLitres: 0,
    totalMedicalKitsRequired: 0,
    totalMedicalPersonnelRequired: 0
  };

  allHabitations.forEach(hab => {
    if (hab.riskLevel === 'Critical' || hab.riskLevel === 'High') {
      const res = hab.resourceEstimates?.estimatedEvacuees
        ? hab.resourceEstimates
        : estimateResourceNeeds(hab);

      resourceSummary.totalEstimatedEvacuees += res.estimatedEvacuees || 0;
      resourceSummary.totalSheltersRequired += res.sheltersNeeded || 0;
      resourceSummary.totalDailyFoodRations += res.dailyFoodRations || 0;
      resourceSummary.totalDailyWaterLitres += res.dailyWaterLitres || 0;
      resourceSummary.totalMedicalKitsRequired += res.medicalKitsNeeded || 0;
      resourceSummary.totalMedicalPersonnelRequired += res.medicalPersonnelNeeded || 0;
    }
  });

  // 3. Top-N Ranked Critical Zones
  const topCriticalZones = allHabitations.slice(0, topN).map((hab, idx) => {
    const res = hab.resourceEstimates?.estimatedEvacuees
      ? hab.resourceEstimates
      : estimateResourceNeeds(hab);

    return {
      rank: idx + 1,
      id: hab._id,
      name: hab.name,
      district: hab.district,
      state: hab.state,
      coords: hab.coords,
      hazardType: hab.hazardType,
      vulnerabilityScore: hab.vulnerabilityScore,
      riskLevel: hab.riskLevel,
      population: hab.population,
      carryingCapacityStatus: hab.carryingCapacityStatus,
      topDrivers: (hab.topDrivers || []).map(d => ({
        factor: d.name,
        score: d.raw
      })),
      reliefNeeds: {
        estimatedEvacuees: res.estimatedEvacuees,
        sheltersNeeded: res.sheltersNeeded,
        dailyWaterLitres: res.dailyWaterLitres
      },
      liveWeather: hab.liveWeather || null,
      urgency:
        hab.riskLevel === 'Critical'
          ? 'Immediate Relocation Priority'
          : hab.riskLevel === 'High'
          ? 'Pre-emptive Defense & Buffer'
          : 'Routine Monitoring'
    };
  });

  return {
    timestamp: new Date().toISOString(),
    systemStatus: {
      overallThreatLevel,
      totalHabitationsMonitored: allHabitations.length,
      criticalZonesCount: criticalCount,
      highZonesCount: highCount,
      populationAtRisk,
      activeHotspotsCount: hotspotResult.activeHotspotsCount,
      anomaliesCount: anomalyResult.totalAnomalies
    },
    resourceLogistics: resourceSummary,
    criticalZones: topCriticalZones,
    activeHotspots: hotspotResult.hotspots,
    trendAnomalies: anomalyResult.anomalies
  };
}

module.exports = {
  getPredictionDashboardSummary
};
