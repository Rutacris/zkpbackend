const jwt = require('jsonwebtoken');
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

exports.verifyProof = async (req, res) => {
  try {
    const { username, proof, challenge } = req.body;

    // Validate input
    if (!username || !proof || !challenge) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.zkpEnabled) {
      return res.status(403).json({ error: 'ZKP not enabled for this user' });
    }

    // Validate challenge exists and hasn't expired
    if (!user.zkpChallenge || !user.challengeExpires) {
      return res.status(400).json({ error: 'No active challenge found' });
    }

    if (user.zkpChallenge !== challenge) {
      return res.status(400).json({ error: 'Challenge mismatch' });
    }

    if (Date.now() > user.challengeExpires.getTime()) {
      return res.status(400).json({ error: 'Expired challenge' });
    }

    // Verify proof
    if (!user.zkpCommitment) {
      return res.status(400).json({ error: 'No commitment found for user' });
    }

    // Normalize strings and ensure consistent formatting
    const expectedProof = crypto
      .createHash('sha256')
      .update(`${user.zkpCommitment.trim()}:${challenge.trim()}`) // Using colon as delimiter
      .digest('hex')
      .toLowerCase(); // Force lowercase for comparison
      

    const receivedProof = proof.trim().toLowerCase();

    // Add debug logging (remove in production)
    console.log('Expected proof:', expectedProof);
    console.log('Received proof:', receivedProof);
    console.log('Stored commitment:', user.zkpCommitment);
    console.log('Received challenge:', challenge);
    console.log('Full verification string:', `${user.zkpCommitment.trim()}:${challenge.trim()}`);

    if (receivedProof === expectedProof) {
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
    console.error('Proof verification error:', error);
    res.status(500).json({ error: error.message });
  }
};