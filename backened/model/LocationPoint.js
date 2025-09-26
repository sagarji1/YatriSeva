const mongoose = require('mongoose');

const LocSchema = new mongoose.Schema({
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tourist' },
  blockchainId: String,
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] }, // [lng,lat]
  createdAt: { type: Date, default: Date.now }
});
LocSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('LocationPoint', LocSchema);
