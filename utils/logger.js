const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/auth.log');

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function logAuthAttempt(username, success, durationMs, error = null) {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILED';
  const errorMsg = error ? ` | Error: ${error}` : '';
  
  const logEntry = `[${timestamp}] ${status} | User: ${username} | Duration: ${durationMs}ms${errorMsg}\n`;
  
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

module.exports = { logAuthAttempt };