const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');

// Generate 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST /api/email-verify/send — Send OTP to the given email
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'Valid email address required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    // Check if email already verified or registered by another account
    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        { verifiedEmail: cleanEmail, isEmailVerified: true },
        { phoneOrEmail: cleanEmail }
      ]
    });
    if (existingUser) {
      return res.status(400).json({ message: 'This email address is already in use by another account.' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP and target email to user record
    await User.findByIdAndUpdate(req.user._id, {
      emailVerificationCode: otp,
      emailVerificationExpiry: expiry,
      verifiedEmail: email.toLowerCase(),
    });

    // Send email
    await sendVerificationEmail(email, otp);

    res.json({ message: 'Verification code sent to your email.' });
  } catch (error) {
    console.error('sendOTP error:', error);
    res.status(500).json({ message: 'Failed to send verification email. Please try again.' });
  }
};

// POST /api/email-verify/verify — Verify the OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Verification code is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user.emailVerificationCode) {
      return res.status(400).json({ message: 'No verification code found. Please request a new one.' });
    }

    // Check expiry
    if (new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    // Check code
    if (user.emailVerificationCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Mark as verified
    await User.findByIdAndUpdate(req.user._id, {
      isEmailVerified: true,
      emailVerificationCode: null,
      emailVerificationExpiry: null,
    });

    res.json({ message: 'Email verified successfully!', isEmailVerified: true });
  } catch (error) {
    console.error('verifyOTP error:', error);
    res.status(500).json({ message: 'Verification failed. Please try again.' });
  }
};

// GET /api/email-verify/status — Get email verification status
exports.getEmailVerifyStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('isEmailVerified verifiedEmail');
    res.json({
      isEmailVerified: user.isEmailVerified,
      verifiedEmail: user.verifiedEmail || '',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
