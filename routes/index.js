const express = require('express');
const router = express.Router();

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

module.exports = router;