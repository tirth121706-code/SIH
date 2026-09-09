// backend/config/trendConfig.js
module.exports = {
  // Periods to compute Moving Average
  MOVING_AVERAGE_PERIODS: 3,

  // Absolute point change threshold to classify trend
  TREND_THRESHOLD_POINTS: 3.0,

  // Single-period jump that flags an ANOMALY
  ANOMALY_DELTA_THRESHOLD: 12.0,

  // Percentage increase that flags an ANOMALY
  ANOMALY_PERCENT_THRESHOLD: 20.0,

  // Default snapshot history window size
  DEFAULT_HISTORY_LIMIT: 8
};
