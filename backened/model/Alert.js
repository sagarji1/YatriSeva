const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tourist' },
  blockchainId: String,
  type: { type: String, enum: ['geofence','panic','anomaly','fir'], required: true },
  severity: { type: String, enum: ['low','medium','high'], default: 'medium' },
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }, // [lng,lat]
  message: String,
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
});
AlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Alert', AlertSchema);
