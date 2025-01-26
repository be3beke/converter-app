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
    const response = await fetch(`http://localhost:5000/convert/${conversionType}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(errorData.error || 'Conversion failed');
      return;
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
