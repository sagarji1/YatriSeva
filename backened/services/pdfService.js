const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function generateFIRPdf(firData) {
  const filename = `FIR-${Date.now()}.pdf`;
  const outDir = path.join(__dirname, '../../uploads/firs');
  const outPath = path.join(outDir, filename);
  fs.mkdirSync(outDir, { recursive: true });

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(outPath);
      doc.pipe(stream);

      doc.fontSize(18).text('E-FIR / Missing Person Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`FIR ID: ${firData.firId}`);
      doc.text(`Issued At: ${new Date().toLocaleString()}`);
      doc.moveDown();
      doc.text(`Tourist Name: ${firData.name}`);
      doc.text(`Blockchain ID: ${firData.blockchainId}`);
      doc.moveDown();
      doc.text(`Last Known Location: ${firData.lastKnownLocation && firData.lastKnownLocation.length ? firData.lastKnownLocation.join(', ') : 'Unknown'}`);
      doc.moveDown();
      doc.text('Reason:');
      doc.text(firData.reason || 'Missing / No response after panic alert');
      doc.moveDown();
      doc.text('Notes:');
      doc.text(firData.notes || 'N/A');
      doc.end();

      stream.on('finish', () => resolve(outPath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = { generateFIRPdf };
