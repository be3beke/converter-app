const express = require('express');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the PDF Converter App!');
});

// Route to create PDF using pdf-lib
app.post('/create-pdf/pdf-lib', async (req, res) => {
  try {
    const { text } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    page.drawText(text, {
      x: 50,
      y: page.getHeight() - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=output-pdf-lib.pdf');
    res.send(pdfBytes);
  } catch (error) {
    console.error('Error creating PDF with pdf-lib:', error);
    res.status(500).send('Error creating PDF');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on https://converter-app-8kh1.onrender.com/:${PORT}`);
});
