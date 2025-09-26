const mongoose = require('mongoose');

const GeoZoneSchema = new mongoose.Schema({
  name: { type: String, required: true },
  riskLevel: { type: String, enum: ['low','medium','high'], default: 'medium' },
  polygon: {
    type: { type: String, enum: ['Polygon'], required: true, default: 'Polygon' },
    coordinates: { type: [[[Number]]], required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

GeoZoneSchema.index({ polygon: '2dsphere' });

module.exports = mongoose.model('GeoZone', GeoZoneSchema);
