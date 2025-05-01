const crypto = require('crypto');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// Store user's ZKP commitment
exports.registerCommitment = async (req, res) => {
  try {
    const { username, commitment } = req.body;
    
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.zkpCommitment = commitment;
    user.zkpEnabled = true;
    await user.save();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Generate unique challenge for ZKP
exports.generateChallenge = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    const user = await User.findOne({ username });
    if (!user || !user.zkpEnabled) {
      return res.status(404).json({ error: 'ZKP not enabled for this user' });
    }

    const challenge = uuidv4(); // Generate random challenge
    user.zkpChallenge = challenge;
    user.challengeExpires = Date.now() + 300000; // 5 minute expiry
    await user.save();

    res.json({ challenge });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Verify ZKP proof
exports.verifyProof = async (req, res) => {
  try {
    const { username, proof, challenge } = req.body;
    
    const user = await User.findOne({ username });
    if (!user || !user.zkpEnabled) {
      return res.status(404).json({ error: 'ZKP not enabled for this user' });
    }

    // Validate challenge
    if (user.zkpChallenge !== challenge || Date.now() > user.challengeExpires) {
      return res.status(400).json({ error: 'Invalid or expired challenge' });
    }

    // Verify proof (simplified example)
    const expectedProof = crypto
      .createHash('sha256')
      .update(user.zkpCommitment + challenge)
      .digest('hex');

    if (proof === expectedProof) {
      // Generate JWT token
      const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Clear used challenge
      user.zkpChallenge = undefined;
      user.challengeExpires = undefined;
      await user.save();

      return res.json({ success: true, token });
    }

    res.status(401).json({ success: false, error: 'Invalid proof' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};