// backend/services/trendAnalysisService.js
const RiskSnapshot = require("../models/RiskSnapshot");
const {
  MOVING_AVERAGE_PERIODS,
  TREND_THRESHOLD_POINTS,
  ANOMALY_DELTA_THRESHOLD,
  ANOMALY_PERCENT_THRESHOLD,
  DEFAULT_HISTORY_LIMIT
} = require("../config/trendConfig");

/**
 * Analyzes trend and flags anomalies for a given set of chronological snapshots
 */
function evaluateTrend(snapshots, currentScore) {
  if (!snapshots || snapshots.length === 0) {
    return {
      direction: "STABLE",
      movingAverage: currentScore,
      netChange: 0,
      isAnomaly: false,
      anomalyType: null,
      anomalyReason: "Baseline initial observation",
      alertSeverity: "NORMAL"
    };
  }

  // Sort ascending by time
  const sorted = [...snapshots].sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
  const latestSnapshot = sorted[sorted.length - 1];
  const previousScore = latestSnapshot.vulnerabilityScore;

  // Calculate N-period Simple Moving Average
  const windowCount = Math.min(sorted.length, MOVING_AVERAGE_PERIODS);
  const recentWindow = sorted.slice(-windowCount);
  const sumScores = recentWindow.reduce((acc, s) => acc + s.vulnerabilityScore, 0);
  const movingAverage = +(sumScores / windowCount).toFixed(1);

  // Trend direction vs moving average
  const deltaVsAvg = +(currentScore - movingAverage).toFixed(1);
  let direction = "STABLE";
  if (deltaVsAvg >= TREND_THRESHOLD_POINTS) direction = "RISING";
  else if (deltaVsAvg <= -TREND_THRESHOLD_POINTS) direction = "FALLING";

  // Single-period jump vs latest stored snapshot
  const deltaLatest = +(currentScore - previousScore).toFixed(1);
  const pctChange = previousScore > 0 ? +((deltaLatest / previousScore) * 100).toFixed(1) : 0;

  // Anomaly check
  let isAnomaly = false;
  let anomalyType = null;
  let anomalyReason = null;
  let alertSeverity = "NORMAL";

  if (deltaLatest >= ANOMALY_DELTA_THRESHOLD || pctChange >= ANOMALY_PERCENT_THRESHOLD) {
    isAnomaly = true;
    alertSeverity = deltaLatest >= 20 ? "CRITICAL" : "HIGH";

    if (deltaLatest >= 20) {
      anomalyType = "RAPID_RISK_SURGE";
      anomalyReason = `Critical spike of +${deltaLatest} points (+${pctChange}%) detected in latest cycle. Indicates imminent structural failure, cloudburst inundation, or emergency buffer breach.`;
    } else {
      anomalyType = "UNUSUAL_VULNERABILITY_JUMP";
      anomalyReason = `Abrupt increase of +${deltaLatest} points (+${pctChange}%). Outlier compared to historical ${windowCount}-period moving average of ${movingAverage}.`;
    }
  }

  return {
    direction,
    movingAverage,
    netChange: deltaLatest,
    percentChange: pctChange,
    isAnomaly,
    anomalyType,
    anomalyReason,
    alertSeverity
  };
}

/**
 * Fetches time-series trend history for a zone
 */
async function getZoneTrendHistory(habitationId, limit = DEFAULT_HISTORY_LIMIT) {
  const snapshots = await RiskSnapshot.find({ habitationId })
    .sort({ recordedAt: -1 })
    .limit(limit);

  return snapshots.reverse(); // Return in chronological order
}

/**
 * Scans all habitations to find zones with active anomalies
 */
async function detectAllAnomalies(HabitationModel) {
  const habitations = await HabitationModel.find();
  const anomalyList = [];

  for (const hab of habitations) {
    const snapshots = await RiskSnapshot.find({ habitationId: hab._id })
      .sort({ recordedAt: -1 })
      .limit(MOVING_AVERAGE_PERIODS + 1);

    if (snapshots.length >= 2) {
      // previous snapshot vs current
      const sorted = snapshots.sort((a, b) => new Date(a.recordedAt) - new Date(b.recordedAt));
      const baseline = sorted.slice(0, -1);
      const latest = sorted[sorted.length - 1];

      const evaluation = evaluateTrend(baseline, latest.vulnerabilityScore);
      if (evaluation.isAnomaly) {
        anomalyList.push({
          habitationId: hab._id,
          name: hab.name,
          district: hab.district,
          state: hab.state,
          hazardType: hab.hazardType,
          currentScore: latest.vulnerabilityScore,
          previousScore: baseline[baseline.length - 1].vulnerabilityScore,
          delta: evaluation.netChange,
          percentChange: evaluation.percentChange,
          movingAverage: evaluation.movingAverage,
          direction: evaluation.direction,
          anomalyType: evaluation.anomalyType,
          alertSeverity: evaluation.alertSeverity,
          narrative: evaluation.anomalyReason,
          recommendedAction:
            evaluation.alertSeverity === "CRITICAL"
              ? "Urgent Field Recon: Dispatch SDRF/NDRF teams to verify localized embankment or slope conditions."
              : "Precautionary Review: Verify sensor feeds and initiate level-2 civil protection readiness."
        });
      }
    }
  }

  return {
    timestamp: new Date().toISOString(),
    totalAnomalies: anomalyList.length,
    anomalies: anomalyList
  };
}

module.exports = {
  evaluateTrend,
  getZoneTrendHistory,
  detectAllAnomalies
};
