const express = require('express');
const router = express.Router();
const zkpController = require('../controllers/zkpController');

// ZKP authentication endpoints
router.get('/challenge', zkpController.generateChallenge);
router.post('/verify', zkpController.verifyProof);
router.post('/register', zkpController.registerCommitment);

module.exports = router;