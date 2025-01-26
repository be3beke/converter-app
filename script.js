document.getElementById('uploadBtn').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('convertBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('fileInput');
  const conversionType = document.getElementById('conversionType').value;

  if (fileInput.files.length === 0) {
    alert('Please upload a file first.');
    return;
  }

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`https://converter-app-8kh1.onrender.com/convert/${conversionType}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.error || 'Conversion failed');
      return;
    }
const puppeteer = require('puppeteer-core');

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
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const downloadLink = document.getElementById('downloadLink');
    downloadLink.href = downloadUrl;
    downloadLink.download = `converted_file.${conversionType.split('-')[2]}`;
    downloadLink.style.display = 'block';
    alert('Conversion complete! Click the download link.');
  } catch (error) {
    console.error('Error:', error);
    alert('Conversion failed. Please try again.');
  }
});
