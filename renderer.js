const { spawn } = require('child_process');
const path = require('path');

window.download = function () {
  const url = document.getElementById('url').value.trim();
  const format = document.getElementById('format').value;
  const quality = document.getElementById('quality').value.trim();
  const status = document.getElementById('status');
  const progressFill = document.getElementById('progressFill');

  status.textContent = 'Starting download...\n';
  progressFill.style.width = '0%';

  const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
  let args;

  if (format === 'mp3') {
    args = ['-x', '--audio-format', 'mp3', '--audio-quality', quality, url];
  } else {
    args = ['-f', `bestvideo[height<=${quality}]+bestaudio/best[height<=${quality}]`, url];
  }

  args.push('--newline');

  const process = spawn(ytDlpPath, args);

  process.stdout.on('data', (data) => {
    const text = data.toString();
    status.textContent += text;

    const match = text.match(/\b(\d{1,3}\.\d)%/);
    if (match) {
      const percent = parseFloat(match[1]);
      progressFill.style.width = percent + '%';
    }
  });

  process.stderr.on('data', (data) => {
    status.textContent += 'ERROR:\n' + data.toString();
  });

  process.on('close', (code) => {
    if (code === 0) {
      status.textContent += '\n✅ Download complete!';
    } else {
      status.textContent += `\n❌ Process exited with code ${code}`;
    }
  });
};

// Theme toggle code

const toggleBtn = document.getElementById('toggleTheme');
const body = document.body;

// Load saved theme or default to dark
const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

toggleBtn.addEventListener('click', () => {
  const newTheme = body.classList.contains('dark') ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
});

function applyTheme(theme) {
  if (theme === 'light') {
    body.classList.remove('dark');
    body.classList.add('light');
    toggleBtn.textContent = 'Switch to Dark Mode';
  } else {
    body.classList.remove('light');
    body.classList.add('dark');
    toggleBtn.textContent = 'Switch to Light Mode';
  }
}
