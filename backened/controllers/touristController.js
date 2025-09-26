const Tourist = require('../models/Tourist');
const blockchain = require('../services/blockchain');
const GeoZone = require('../models/GeoZone');
const Alert = require('../models/Alert');
const LocationPoint = require('../models/LocationPoint');

exports.register = async (req, res) => {
  try {
    const { name, passportOrAadhaar, tripItinerary, emergencyContact, durationDays } = req.body;
    if (!name || !passportOrAadhaar) return res.status(400).json({ message: "name and passportOrAadhaar required" });

    const { idHash, txHash } = await blockchain.issueTouristID({ passportOrAadhaar, tripItinerary, emergencyContact, durationDays });

    const tourist = new Tourist({ name, passportOrAadhaar, tripItinerary, emergencyContact, blockchainId: idHash, durationDays });
    await tourist.save();

    return res.status(201).json({ message: "Tourist Registered", blockchainId: idHash, txHash });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.panic = async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    if (!blockchainId) return res.status(400).json({ message: "blockchainId required" });

    const tourist = await Tourist.findOneAndUpdate({ blockchainId }, { currentLocation: location, lastPanicAt: new Date() }, { new: true });
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });

    // create alert record
    const locPoint = { type: 'Point', coordinates: [location.lng, location.lat] };
    const alert = await Alert.create({
      touristId: tourist._id,
      blockchainId: tourist.blockchainId,
      type: 'panic',
      severity: 'high',
      location: locPoint,
      message: 'Panic button pressed'
    });

    // save location history
    await LocationPoint.create({ touristId: tourist._id, blockchainId: tourist.blockchainId, location: locPoint });

    // emit via socket
    const io = req.app.get('io');
    if (io) io.emit('panicAlert', { alert, tourist });

    return res.json({ message: "Panic alert recorded", alert });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

async function checkGeofencesAndEmit(req, tourist, locationPoint) {
  try {
    const zones = await GeoZone.find({
      polygon: {
        $geoIntersects: { $geometry: locationPoint }
      }
    });

    if (zones && zones.length) {
      for (const z of zones) {
        const severity = z.riskLevel === 'high' ? 'high' : (z.riskLevel === 'medium' ? 'medium' : 'low');
        const alert = await Alert.create({
          touristId: tourist._id,
          blockchainId: tourist.blockchainId,
          type: 'geofence',
          severity,
          location: locationPoint,
          message: `Entered zone: ${z.name}`
        });

        const io = req.app.get('io');
        if (io) io.emit('geofenceAlert', { alert, zone: z, tourist });
        // TODO: call SMS/push/email if severity === 'high'
      }
    }
  } catch (err) {
    console.error('checkGeofences error', err);
  }
}

exports.updateLocation = async (req, res) => {
  try {
    const { blockchainId, location } = req.body;
    if (!blockchainId) return res.status(400).json({ message: "blockchainId required" });
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({ message: "location must include lat and lng as numbers" });
    }

    const tourist = await Tourist.findOneAndUpdate({ blockchainId }, { currentLocation: location }, { new: true });
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' });

    const locationPoint = { type: 'Point', coordinates: [location.lng, location.lat] };

    // Save history point for heatmap
    await LocationPoint.create({ touristId: tourist._id, blockchainId: tourist.blockchainId, location: locationPoint });

    // Check geo zones and emit alerts
    await checkGeofencesAndEmit(req, tourist, locationPoint);

    // Emit location update to dashboard
    const io = req.app.get('io');
    if (io) io.emit('locationUpdate', { blockchainId: tourist.blockchainId, location });

    return res.json({ message: "Location updated" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find().lean();
    return res.json(tourists);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
