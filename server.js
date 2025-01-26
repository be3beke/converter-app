const express = require('express');
const puppeteer = require('puppeteer-core'); // Use puppeteer-core
const app = express();
const PORT = process.env.PORT || 5000;

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
