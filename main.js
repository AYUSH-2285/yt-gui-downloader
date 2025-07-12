const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow () {
  console.log("Creating window...");
  const win = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

const { ipcMain } = require('electron');
const { spawn } = require('child_process');

ipcMain.on('start-download', (event, videoUrl, outputPath, cookiePath = '') => {
  const args = [
    videoUrl,
    '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
    '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    '-o', outputPath || 'downloads/%(title)s.%(ext)s'
  ];

  if (cookiePath) {
    args.push('--cookies', cookiePath);
  }

  const ytDlp = spawn('yt-dlp', args);

  ytDlp.stdout.on('data', (data) => {
    event.sender.send('download-log', data.toString());
  });

  ytDlp.stderr.on('data', (data) => {
    event.sender.send('download-error', data.toString());
  });

  ytDlp.on('close', (code) => {
    event.sender.send('download-complete', code);
  });
});
