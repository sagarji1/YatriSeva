const express = require('express');
const router = express.Router();
const Tourist = require('../model/touristSchema');
const FIR = require('../model/FIR');
const { generateFIRPdf } = require('../services/pdfService');
const { sendFIREmail } = require('../services/emailService');

router.post('/fir/generate', async (req, res) => {
  try {
    const { touristId, reason, createdBy, notes, policeEmail } = req.body;
    const t = await Tourist.findById(touristId);
    if (!t) return res.status(404).json({ message: 'Tourist not found' });

    const firId = `FIR-${Date.now()}`;
    const fir = new FIR({
      firId,
      touristId: t._id,
      blockchainId: t.blockchainId,
      reason,
      lastKnownLocation: t.currentLocation?.lng ? { type: 'Point', coordinates: [t.currentLocation.lng, t.currentLocation.lat] } : null,
      createdBy
    });
    await fir.save();

    const pdfPath = await generateFIRPdf({
      firId,
      name: t.name,
      blockchainId: t.blockchainId,
      lastKnownLocation: t.currentLocation ? [t.currentLocation.lat, t.currentLocation.lng] : [],
      reason,
      notes
    });

    fir.pdfPath = pdfPath;
    fir.status = 'sent';
    await fir.save();

    if (policeEmail) {
      try {
        await sendFIREmail(policeEmail, `E-FIR ${firId}`, 'Please find the attached FIR.', pdfPath);
      } catch (mailErr) {
        console.warn('Email send failed', mailErr);
      }
    }

    return res.json({ message: 'FIR created', fir });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
