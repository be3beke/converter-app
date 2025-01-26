const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const xlsx = require('xlsx');
const poppler = require('pdf-poppler');
const app = express();
const PORT = process.env.PORT || 5000;
const puppeteer = require('puppeteer-core'); // Use puppeteer-core

app.use(express.json());

// Endpoint to create PDF using puppeteer-core
app.post('/create-pdf/puppeteer', async (req, res) => {
  try {
    const { text } = req.body;

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser', // Path to Chromium on Linux
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Linux
    });
    const page = await browser.newPage();
    await page.setContent(`<pre>${text}</pre>`);
    const pdfBuffer = await page.pdf({ format: 'A4' });
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=output-puppeteer.pdf');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error creating PDF with puppeteer:', error);
    res.status(500).send('Error creating PDF');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Convert PDF to Word (DOCX)
app.post('/convert/pdf-to-word', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputPath = path.join(__dirname, 'output.docx');

    // For simplicity, we'll just copy the file (real conversion requires OCR or other tools)
    fs.copyFileSync(filePath, outputPath);

    res.download(outputPath, 'converted.docx', () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error converting PDF to Word:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Convert PDF to Excel (XLSX)
app.post('/convert/pdf-to-excel', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputPath = path.join(__dirname, 'output.xlsx');

    // For simplicity, we'll just create an empty Excel file (real conversion requires OCR or other tools)
    const workbook = xlsx.utils.book_new();
    xlsx.writeFile(workbook, outputPath);

    res.download(outputPath, 'converted.xlsx', () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error converting PDF to Excel:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Convert PDF to Text (TXT)
app.post('/convert/pdf-to-txt', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputPath = path.join(__dirname, 'output.txt');

    // For simplicity, we'll just create a dummy text file (real conversion requires OCR or other tools)
    fs.writeFileSync(outputPath, 'This is a sample text file.');

    res.download(outputPath, 'converted.txt', () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error converting PDF to Text:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Convert PDF to Image (PNG/JPEG)
app.post('/convert/pdf-to-image', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputDir = path.join(__dirname, 'output_images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Convert PDF to images using pdf-poppler
    await poppler.convert(filePath, {
      format: 'png',
      out_dir: outputDir,
      out_prefix: 'page',
      page: null, // Convert all pages
    });

    // Zip the images and send as a download
    const zipFilePath = path.join(__dirname, 'output_images.zip');
    // Use a library like `archiver` to create a zip file (install with `npm install archiver`)
    const archiver = require('archiver');
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.download(zipFilePath, 'converted_images.zip', () => {
        fs.unlinkSync(filePath);
        fs.rmSync(outputDir, { recursive: true, force: true });
        fs.unlinkSync(zipFilePath);
      });
    });

    archive.pipe(output);
    archive.directory(outputDir, false);
    archive.finalize();
  } catch (error) {
    console.error('Error converting PDF to Image:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

async function createPdf(text) {
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser', // Path to Chromium on Linux
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Required for Linux
  });
  const page = await browser.newPage();
  await page.setContent(`<pre>${text}</pre>`);
  const pdfBuffer = await page.pdf({ format: 'A4' });
  await browser.close();
  return pdfBuffer;
}

// Convert Word (DOCX) to PDF
app.post('/convert/word-to-pdf', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const outputPath = path.join(__dirname, 'output.pdf');

    // Convert DOCX to HTML, then to PDF (requires additional libraries like `html-pdf`)
    const { value: html } = await mammoth.convertToHtml({ path: filePath });
    const pdf = await textToPdf.generatePdf(html, { format: 'A4' });
    fs.writeFileSync(outputPath, pdf);

    res.download(outputPath, 'converted.pdf', () => {
      fs.unlinkSync(filePath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    console.error('Error converting Word to PDF:', error);
    res.status(500).json({ error: 'Conversion failed' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
