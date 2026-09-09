// backend/config/hotspotConfig.js
module.exports = {
  TIME_WINDOW_MINUTES: 60,
  CLUSTER_RADIUS_KM: 2.5,
  MIN_CALLS_THRESHOLD: 3,
  STATIC_RISK_ANOMALY_THRESHOLD: 65,
  SEVERITY_WEIGHTS: {
    critical: 4.0,
    serious: 2.5,
    moderate: 1.5,
    stable: 1.0
  }
};
