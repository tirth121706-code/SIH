const express = require("express");
const router = express.Router();
const Sos = require("../models/Sos");
const { detectHotspots } = require("../services/hotspotService");
const { REGIONAL_ZONES } = require("../data/realisticSosData");
const { calculateDispatchRoute } = require("../services/dispatchRoutingService");

// 1. GET / - Fetch all SOS distress requests
router.get("/", async (req, res) => {
  try {
    const requests = await Sos.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET /hotspots - Dynamic SOS Cluster & Blindspot Detection
router.get("/hotspots", async (req, res) => {
  try {
    const windowMinutes = req.query.window ? parseInt(req.query.window) : undefined;
    const hotspotData = await detectHotspots(windowMinutes);
    res.json(hotspotData);
  } catch (err) {
    res.status(500).json({ error: "Failed to detect hotspots", details: err.message });
  }
});

// 3. POST /simulate-burst - Hackathon Demo: Multi-Zone Realistic Distress Injection
router.post("/simulate-burst", async (req, res) => {
  try {
    const { zoneKey, cleanPrevious = true } = req.body;

    // Clean up previous simulated bursts to avoid cluttering demo data
    if (cleanPrevious) {
      await Sos.deleteMany({ isSimulated: true });
    }

    const selectedZones = [];
    if (zoneKey) {
      const found = REGIONAL_ZONES.find((z) => z.key === zoneKey.toLowerCase());
      if (found) selectedZones.push(found);
    }

    // Default to realistic multi-zone distribution across high-risk & anomaly sectors
    if (selectedZones.length === 0) {
      selectedZones.push(...REGIONAL_ZONES);
    }

    const createdCalls = [];

    for (const zone of selectedZones) {
      // Weighted call counts: Critical zones get 4-5 calls, moderate/low get 3
      const count = zone.key === "wayanad" ? 5 : zone.key === "kathmandu" ? 4 : zone.key === "varanasi" ? 4 : 3;

      for (let i = 0; i < count; i++) {
        const victimName = zone.names[i % zone.names.length];
        const severity = zone.severities[i % zone.severities.length] || "serious";
        const aidList = zone.aidOptions[i % zone.aidOptions.length];
        const phone = `${zone.phonePrefix}${Math.floor(100000 + Math.random() * 900000)}`;

        // Micro-geodesic variance around zone centroid (~300m - 700m)
        const latOffset = (Math.random() - 0.5) * 0.007;
        const lngOffset = (Math.random() - 0.5) * 0.007;
        const coords = [+(zone.coords[0] + latOffset).toFixed(4), +(zone.coords[1] + lngOffset).toFixed(4)];

        const sosRecord = await Sos.create({
          victimName,
          phone,
          calamity: zone.calamity,
          aidList,
          coords,
          severity,
          status: "Pending Dispatch",
          isSimulated: true
        });

        createdCalls.push(sosRecord);
      }
    }

    // Run hotspot clustering over the distributed calls
    const updatedHotspots = await detectHotspots();

    res.status(201).json({
      message: `Successfully simulated ${createdCalls.length} realistic distress calls across ${selectedZones.length} geographic zones`,
      zonesCovered: selectedZones.map((z) => z.name),
      totalSimulatedCalls: createdCalls.length,
      simulatedCalls: createdCalls,
      liveHotspotsResult: updatedHotspots
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to simulate realistic multi-zone SOS calls", details: err.message });
  }
});

// 4. POST / - Submit a single SOS distress call
router.post("/", async (req, res) => {
  try {
    const { victimName, phone, calamity, aidList, coords, severity } = req.body;
    if (!victimName || !phone || !coords) {
      return res.status(400).json({ error: "victimName, phone, and coords are required" });
    }
    const sos = await Sos.create({
      victimName,
      phone,
      calamity: calamity || "Flood",
      aidList: aidList || [],
      coords,
      severity: severity || "serious"
    });
    res.status(201).json(sos);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 5. POST /:id/dispatch-route - Aid-Aware Intelligent Dispatch Routing
router.post("/:id/dispatch-route", async (req, res) => {
  try {
    const sos = await Sos.findById(req.params.id);
    if (!sos) return res.status(404).json({ error: "SOS record not found" });

    const overrideCategory = req.body.overrideCategory || null;
    const dispatchPlan = await calculateDispatchRoute(sos, overrideCategory);

    // Automatically update dispatch status to "En Route"
    sos.status = "En Route";
    await sos.save();

    res.json({
      success: true,
      sosId: sos._id,
      victim: {
        id: sos._id,
        name: sos.victimName,
        phone: sos.phone,
        coords: sos.coords,
        calamity: sos.calamity,
        severity: sos.severity,
        aidList: sos.aidList,
        status: sos.status
      },
      dispatchPlan
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to calculate dispatch route", details: err.message });
  }
});

// 6. PATCH /:id/status - Update dispatch status
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

// 6. DELETE /:id - Remove SOS record
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