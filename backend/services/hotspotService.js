// backend/services/hotspotService.js
const Sos = require('../models/Sos');
const Habitation = require('../models/Habitation');
const {
  TIME_WINDOW_MINUTES,
  CLUSTER_RADIUS_KM,
  MIN_CALLS_THRESHOLD,
  STATIC_RISK_ANOMALY_THRESHOLD,
  SEVERITY_WEIGHTS
} = require('../config/hotspotConfig');

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function detectHotspots(customWindowMinutes = TIME_WINDOW_MINUTES) {
  const windowMinutes = Number(customWindowMinutes) || TIME_WINDOW_MINUTES;
  const timeThreshold = new Date(Date.now() - windowMinutes * 60 * 1000);

  const activeCalls = await Sos.find({
    status: { $ne: 'Resolved' },
    createdAt: { $gte: timeThreshold }
  }).sort({ createdAt: -1 });

  if (activeCalls.length < MIN_CALLS_THRESHOLD) {
    return {
      timestamp: new Date().toISOString(),
      timeWindowMinutes: windowMinutes,
      activeCallsConsidered: activeCalls.length,
      activeHotspotsCount: 0,
      hotspots: []
    };
  }

  const habitations = await Habitation.find();

  const visited = new Set();
  const clusters = [];

  for (let i = 0; i < activeCalls.length; i++) {
    const callA = activeCalls[i];
    const callIdA = String(callA._id);
    if (visited.has(callIdA)) continue;

    visited.add(callIdA);
    const neighbors = [callA];

    for (let j = 0; j < activeCalls.length; j++) {
      if (i === j) continue;
      const callB = activeCalls[j];
      const dist = haversineKm(callA.coords[0], callA.coords[1], callB.coords[0], callB.coords[1]);
      if (dist <= CLUSTER_RADIUS_KM) {
        neighbors.push(callB);
      }
    }

    if (neighbors.length >= MIN_CALLS_THRESHOLD) {
      const clusterMembers = [...neighbors];
      const clusterMemberIds = new Set(clusterMembers.map(c => String(c._id)));

      for (let k = 0; k < clusterMembers.length; k++) {
        const currentMember = clusterMembers[k];
        for (let m = 0; m < activeCalls.length; m++) {
          const candidate = activeCalls[m];
          const candId = String(candidate._id);
          if (!clusterMemberIds.has(candId)) {
            const dist = haversineKm(
              currentMember.coords[0],
              currentMember.coords[1],
              candidate.coords[0],
              candidate.coords[1]
            );
            if (dist <= CLUSTER_RADIUS_KM) {
              clusterMembers.push(candidate);
              clusterMemberIds.add(candId);
              visited.add(candId);
            }
          }
        }
      }

      clusters.push(clusterMembers);
    }
  }

  const processedHotspots = [];
  const processedCallIds = new Set();

  for (let c = 0; c < clusters.length; c++) {
    const members = clusters[c];
    const uniqueMembers = members.filter(m => !processedCallIds.has(String(m._id)));
    if (uniqueMembers.length < MIN_CALLS_THRESHOLD) continue;

    uniqueMembers.forEach(m => processedCallIds.add(String(m._id)));

    const avgLat = uniqueMembers.reduce((sum, m) => sum + m.coords[0], 0) / uniqueMembers.length;
    const avgLng = uniqueMembers.reduce((sum, m) => sum + m.coords[1], 0) / uniqueMembers.length;

    let maxDistKm = 0.5;
    uniqueMembers.forEach(m => {
      const d = haversineKm(avgLat, avgLng, m.coords[0], m.coords[1]);
      if (d > maxDistKm) maxDistKm = d;
    });
    const radiusMeters = Math.min(5000, Math.max(600, Math.round(maxDistKm * 1000)));

    const calamityCounts = {};
    let totalSeverityScore = 0;
    const severityBreakdown = { critical: 0, serious: 0, moderate: 0, stable: 0 };

    uniqueMembers.forEach(m => {
      calamityCounts[m.calamity] = (calamityCounts[m.calamity] || 0) + 1;
      const sev = (m.severity || 'serious').toLowerCase();
      severityBreakdown[sev] = (severityBreakdown[sev] || 0) + 1;
      totalSeverityScore += SEVERITY_WEIGHTS[sev] || 2.0;
    });

    const dominantCalamity = Object.entries(calamityCounts).sort((a, b) => b[1] - a[1])[0][0];

    let nearestHab = null;
    let minHabDist = Infinity;

    habitations.forEach(hab => {
      if (hab.coords && hab.coords.length === 2) {
        const d = haversineKm(avgLat, avgLng, hab.coords[0], hab.coords[1]);
        if (d < minHabDist) {
          minHabDist = d;
          nearestHab = hab;
        }
      }
    });

    const isStaticLowRisk = !nearestHab || nearestHab.vulnerabilityScore < STATIC_RISK_ANOMALY_THRESHOLD || minHabDist > 6.0;

    let hotspotType, alertLevel, headline, advisory;

    if (isStaticLowRisk) {
      hotspotType = 'EMERGING_UNEXPECTED';
      alertLevel = 'RED';
      headline = '🚨 Emerging Crisis Hotspot in Low-Risk Sector';
      advisory = 'Surge of ' + uniqueMembers.length + ' distress calls detected within ' + (radiusMeters / 1000).toFixed(1) + ' km. ' +
        (nearestHab
          ? 'Nearest zone is ' + nearestHab.name + ' with static risk score only ' + nearestHab.vulnerabilityScore + '/100 (' + nearestHab.riskLevel + '). Indicates unmapped localized structural failure or sudden inundation.'
          : 'Located outside standard monitored habitation buffers. Immediate rapid drone/responder recon required.');
    } else {
      hotspotType = 'CONFIRMED_HAZARD_ZONE';
      alertLevel = 'ORANGE';
      headline = '⚠️ Active Incident Hotspot in Known ' + (nearestHab ? nearestHab.riskLevel : 'High') + ' Zone';
      advisory = uniqueMembers.length + ' active calls clustered within ' + (radiusMeters / 1000).toFixed(1) + ' km around ' + (nearestHab ? nearestHab.name : 'disaster sector') + '. Evacuation corridors active.';
    }

    processedHotspots.push({
      clusterId: 'hotspot-' + Date.now() + '-' + (c + 1),
      type: hotspotType,
      alertLevel,
      headline,
      advisory,
      centroid: [+avgLat.toFixed(4), +avgLng.toFixed(4)],
      radiusMeters,
      callCount: uniqueMembers.length,
      dominantCalamity,
      severityIndex: +totalSeverityScore.toFixed(1),
      severityBreakdown,
      nearestHabitation: nearestHab
        ? {
            id: nearestHab._id,
            name: nearestHab.name,
            staticRiskScore: nearestHab.vulnerabilityScore,
            staticRiskLevel: nearestHab.riskLevel,
            distanceKm: +minHabDist.toFixed(2)
          }
        : null,
      calls: uniqueMembers.map(m => ({
        id: m._id,
        victimName: m.victimName,
        phone: m.phone,
        calamity: m.calamity,
        severity: m.severity || 'serious',
        aidList: m.aidList,
        coords: m.coords,
        createdAt: m.createdAt
      }))
    });
  }

  return {
    timestamp: new Date().toISOString(),
    timeWindowMinutes: windowMinutes,
    activeCallsConsidered: activeCalls.length,
    activeHotspotsCount: processedHotspots.length,
    hotspots: processedHotspots
  };
}

module.exports = {
  detectHotspots,
  haversineKm
};
