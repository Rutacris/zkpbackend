const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Fixed Traditional login fallback
exports.logger = async (req, res) => {
    try {
        const { username, success, duration, error, timestamp } = req.body;
        logAuthAttempt(username, success, duration, error);
        res.status(200).send('Logged');

    } catch (error) {
        console.error("Log eroor error:", error);
        res.status(500).json({ error: error.message });
    }
};
