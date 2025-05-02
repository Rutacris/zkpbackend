const express = require('express');
const router = express.Router();
import { logAuthAttempt } from '../utils/logger.js';

// Root endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Zero-Knowledge Proof Authentication API',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      zkp: {
        challenge: 'GET /api/zkp/challenge',
        verify: 'POST /api/zkp/verify',
        register: 'POST /api/zkp/register'
      }
    },
    timestamp: new Date().toISOString()
  });
});

router.post('/api/log-auth', (req, res) => {
  const { username, success, duration, error, timestamp } = req.body;
  logAuthAttempt(username, success, duration, error);
  res.status(200).send('Logged');
});

module.exports = router;