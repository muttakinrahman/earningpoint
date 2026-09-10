const User = require('../models/User');
const { sendVerificationEmail } = require('../utils/emailService');
const smsService = require('../utils/smsService');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.getVerificationStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'phoneOrEmail verifiedEmail isEmailVerified verifiedPhone isPhoneVerified isAccountVerified'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const defaultEmail = user.verifiedEmail || (user.phoneOrEmail && user.phoneOrEmail.includes('@') ? user.phoneOrEmail : '');
    const defaultPhone = user.verifiedPhone || (user.phoneOrEmail && !user.phoneOrEmail.includes('@') ? user.phoneOrEmail : '');

    // Account is strictly verified when BOTH Email and Phone are verified
    const isAccountVerified = Boolean(user.isEmailVerified && user.isPhoneVerified);
    if (user.isAccountVerified !== isAccountVerified) {
      user.isAccountVerified = isAccountVerified;
      await user.save();
    }

    res.json({
      success: true,
      isAccountVerified,
      isPhoneVerified: Boolean(user.isPhoneVerified),
      verifiedPhone: user.verifiedPhone || defaultPhone,
      isEmailVerified: Boolean(user.isEmailVerified),
      verifiedEmail: user.verifiedEmail || defaultEmail,
    });
  } catch (error) {
    console.error('getVerificationStatus error:', error);
    res.status(500).json({ message: 'Failed to retrieve verification status' });
  }
};

exports.savePhone = async (req, res) => {
  try {
    const { countryCode = '+880', phoneNumber } = req.body;

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    const cleanNumber = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (cleanNumber.length < 6 || cleanNumber.length > 15) {
      return res.status(400).json({ message: 'Please enter a valid mobile phone number.' });
    }

    const formattedCode = countryCode.trim().startsWith('+') ? countryCode.trim() : `+${countryCode.trim()}`;
    const phoneVariants = [fullPhone, cleanNumber];
    if (cleanNumber.startsWith('0')) {
      phoneVariants.push(`${formattedCode}${cleanNumber.substring(1)}`);
    }

    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        { verifiedPhone: { $in: phoneVariants }, isPhoneVerified: true },
        { phoneOrEmail: { $in: phoneVariants } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'This phone number is already in use by another account.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.verifiedPhone = fullPhone;
    user.isPhoneVerified = true;
    user.isAccountVerified = Boolean(user.isEmailVerified && user.isPhoneVerified);
    await user.save();

    res.json({
      success: true,
      message: 'Phone number successfully saved!',
      isPhoneVerified: true,
      verifiedPhone: fullPhone,
      isAccountVerified: user.isAccountVerified,
    });
  } catch (error) {
    console.error('savePhone error:', error);
    res.status(500).json({ message: 'Failed to save phone number. Please try again.' });
  }
};

exports.sendPhoneOTP = async (req, res) => {
  try {
    const { countryCode = '+880', phoneNumber } = req.body;

    if (!phoneNumber || !phoneNumber.trim()) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    const cleanNumber = phoneNumber.trim().replace(/[^0-9]/g, '');
    if (cleanNumber.length < 6 || cleanNumber.length > 15) {
      return res.status(400).json({ message: 'Please enter a valid mobile phone number.' });
    }

    const formattedCode = countryCode.trim().startsWith('+') ? countryCode.trim() : `+${countryCode.trim()}`;
    const fullPhone = `${formattedCode}${cleanNumber}`;

    const phoneVariants = [fullPhone, cleanNumber];
    if (cleanNumber.startsWith('0')) {
      phoneVariants.push(`${formattedCode}${cleanNumber.substring(1)}`);
    }

    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [
        { verifiedPhone: { $in: phoneVariants }, isPhoneVerified: true },
        { phoneOrEmail: { $in: phoneVariants } }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'This phone number is already in use by another account.' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    // Send real SMS OTP via BulkSMSDhaka gateway
    try {
      await smsService.sendPhoneOTP(fullPhone, otp);
    } catch (smsErr) {
      if (smsErr.message === 'IP_NOT_WHITELISTED') {
        return res.status(503).json({
          message: 'SMS Gateway IP Whitelist pending. Please whitelist server IP (187.53.134.78) in BulkSMSDhaka portal.'
        });
      }
      return res.status(500).json({
        message: smsErr.message || 'Failed to send SMS OTP. Please check your phone number or try again later.'
      });
    }

    await User.findByIdAndUpdate(req.user._id, {
      phoneVerificationCode: otp,
      phoneVerificationExpiry: expiry,
      verifiedPhone: fullPhone,
    });

    console.log(`[SMS OTP] Verification code successfully sent to ${fullPhone}`);

    res.json({
      success: true,
      message: `Verification code sent via SMS to ${fullPhone}`,
      fullPhone,
    });
  } catch (error) {
    console.error('sendPhoneOTP error:', error);
    res.status(500).json({ message: error.message || 'Failed to send phone verification code. Please try again.' });
  }
};

exports.verifyPhoneOTP = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: '6-digit verification code is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.phoneVerificationCode) {
      return res.status(400).json({ message: 'No active phone verification code found. Please request a new code.' });
    }

    if (user.phoneVerificationExpiry && new Date() > user.phoneVerificationExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.phoneVerificationCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationCode = null;
    user.phoneVerificationExpiry = null;
    user.isAccountVerified = Boolean(user.isEmailVerified && user.isPhoneVerified);
    await user.save();

    res.json({
      success: true,
      message: 'Phone number successfully verified!',
      isPhoneVerified: true,
      isAccountVerified: user.isAccountVerified,
      verifiedPhone: user.verifiedPhone,
    });
  } catch (error) {
    console.error('verifyPhoneOTP error:', error);
    res.status(500).json({ message: 'Failed to verify phone code. Please try again.' });
  }
};

exports.sendEmailOTP = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let targetEmail = req.body.email || user.verifiedEmail;
    if (!targetEmail && user.phoneOrEmail && user.phoneOrEmail.includes('@')) {
      targetEmail = user.phoneOrEmail;
    }

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }

    const cleanEmail = targetEmail.trim().toLowerCase();

    const existingUser = await User.findOne({
      _id: { $ne: user._id },
      $or: [
        { verifiedEmail: cleanEmail, isEmailVerified: true },
        { phoneOrEmail: cleanEmail }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'This email address is already in use by another account.' });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    user.emailVerificationCode = otp;
    user.emailVerificationExpiry = expiry;
    user.verifiedEmail = cleanEmail;
    await user.save();

    try {
      await sendVerificationEmail(cleanEmail, otp);
    } catch (mailErr) {
      console.error('Failed to send verification email through SMTP:', mailErr.message);
    }

    res.json({
      success: true,
      message: `Verification code sent to ${cleanEmail}`,
      email: cleanEmail,
    });
  } catch (error) {
    console.error('sendEmailOTP error:', error);
    res.status(500).json({ message: 'Failed to send email verification code.' });
  }
};

exports.verifyEmailOTP = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ message: '6-digit verification code is required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.emailVerificationCode) {
      return res.status(400).json({ message: 'No active email verification code found. Please request a new code.' });
    }

    if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
      return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
    }

    if (user.emailVerificationCode !== code.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpiry = null;
    user.isAccountVerified = Boolean(user.isEmailVerified && user.isPhoneVerified);
    await user.save();

    res.json({
      success: true,
      message: 'Email address successfully verified!',
      isEmailVerified: true,
      isAccountVerified: user.isAccountVerified,
      verifiedEmail: user.verifiedEmail,
    });
  } catch (error) {
    console.error('verifyEmailOTP error:', error);
    res.status(500).json({ message: 'Failed to verify email code. Please try again.' });
  }
};
