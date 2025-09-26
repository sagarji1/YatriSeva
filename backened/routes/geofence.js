const express = require('express');
const router = express.Router();
const GeoZone = require('../model/GeoZone');

router.post('/geofence/add', async (req, res) => {
  try {
    const { name, riskLevel, polygon } = req.body;
    if (!name || !polygon) return res.status(400).json({ message: 'name and polygon required' });
    const zone = new GeoZone({ name, riskLevel, polygon });
    await zone.save();
    return res.status(201).json(zone);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/geofence', async (req, res) => {
  try {
    const zones = await GeoZone.find();
    res.json(zones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/geofence/check", async (req, res) => {
  const { lat, lng, touristId } = req.body;  // get coordinates from body
  try {
    // find if the point intersects any geofence polygon
    const inside = await GeoZone.findOne({
      polygon: {
        $geoIntersects: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
        },
      },
    });

    if (inside) {
      res.json({
        warning: true,
        riskLevel: inside.riskLevel,
        message: `⚠️ Tourist is inside ${inside.name} (${inside.riskLevel})`,
      });
    } else {
      res.json({ warning: false, message: "Tourist is in safe zone" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


module.exports = router;
