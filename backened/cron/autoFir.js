const cron = require('node-cron');
const Tourist = require('../models/Tourist');
const GeoZone = require('../models/GeoZone');
const FIR = require('../models/FIR');
const { generateFIRPdf } = require('../services/pdfService');
const { sendFIREmail } = require('../services/emailService');

function startAutoFirJob(app) {
  // Run every hour at minute 5
  cron.schedule('5 * * * *', async () => {
    try {
      console.log('[autoFir] running auto-FIR check');
      const cutoff = new Date(Date.now() - 1000 * 60 * 60 * 6); // 6 hours
      const candidates = await Tourist.find({ updatedAt: { $lt: cutoff } });

      for (const t of candidates) {
        if (!t.currentLocation || !t.currentLocation.lng) continue;
        const zones = await GeoZone.find({
          polygon: {
            $geoIntersects: { $geometry: { type: 'Point', coordinates: [t.currentLocation.lng, t.currentLocation.lat] } }
          },
          riskLevel: 'high'
        });
        if (zones && zones.length) {
          // create FIR
          const existing = await FIR.findOne({ touristId: t._id });
          if (existing) continue; // skip if FIR exists
          const firId = `FIR-${Date.now()}`;
          const fir = new FIR({
            firId,
            touristId: t._id,
            blockchainId: t.blockchainId,
            reason: 'Auto-generated: no update for >6h in high-risk zone',
            lastKnownLocation: { type: 'Point', coordinates: [t.currentLocation.lng, t.currentLocation.lat] },
            createdBy: 'system-auto'
          });
          await fir.save();

          const pdfPath = await generateFIRPdf({
            firId,
            name: t.name,
            blockchainId: t.blockchainId,
            lastKnownLocation: [t.currentLocation.lat, t.currentLocation.lng],
            reason: fir.reason
          });
          fir.pdfPath = pdfPath;
          fir.status = 'sent';
          await fir.save();

          // notify configured police email from env if present
          if (process.env.DEFAULT_POLICE_EMAIL) {
            try {
              await sendFIREmail(process.env.DEFAULT_POLICE_EMAIL, `Auto E-FIR ${firId}`, 'Auto generated FIR attached.', pdfPath);
            } catch (e) {
              console.warn('Auto FIR mail failed', e);
            }
          }

          // emit socket event if io available
          const io = app.get('io');
          if (io) io.emit('firGenerated', { fir, tourist: t });
        }
      }
    } catch (err) {
      console.error('[autoFir] error', err);
    }
  });
}

module.exports = { startAutoFirJob };
