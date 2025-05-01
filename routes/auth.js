const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Traditional authentication fallback
router.post('/login', authController.traditionalLogin);
router.post('/register', authController.register);



module.exports = router;