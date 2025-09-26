const mongoose = require('mongoose');

const FirSchema = new mongoose.Schema({
  firId: { type: String, required: true, unique: true },
  touristId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tourist' },
  blockchainId: String,
  issuedAt: { type: Date, default: Date.now },
  reason: String,
  lastKnownLocation: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
  pdfPath: String,
  status: { type: String, enum: ['draft','sent','acknowledged'], default:'draft' },
  createdBy: String
});

module.exports = mongoose.model('FIR', FirSchema);
