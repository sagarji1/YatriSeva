const express = require('express');
const router = express.Router();
const LocationPoint = require('../model/LocationPoint');

router.get('/', async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24;
    const since = new Date(Date.now() - hours * 3600 * 1000);

    const pipeline = [
      { $match: { createdAt: { $gte: since } } },
      {
        $project: {
          lat: { $round: [{ $arrayElemAt: ["$location.coordinates", 1] }, 3] },
          lng: { $round: [{ $arrayElemAt: ["$location.coordinates", 0] }, 3] }
        }
      },
      {
        $group: {
          _id: { lat: "$lat", lng: "$lng" },
          count: { $sum: 1 }
        }
      },
      {
        $project: { _id: 0, lat: '$_id.lat', lng: '$_id.lng', count: 1 }
      }
    ];
    const data = await LocationPoint.aggregate(pipeline);
    const heat = data.map(d => [d.lat, d.lng, d.count]);
    res.json(heat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
