const UserActivity = require('../models/UserActivity');
const User = require('../models/User');

// Helper to get today's date in Asia/Dhaka YYYY-MM-DD
const getDhakaDateString = (d = new Date()) => {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' });
};

// @desc    Heartbeat ping from client to accumulate active screen time
// @route   POST /api/activity/heartbeat
// @access  Private
exports.recordHeartbeat = async (req, res) => {
  try {
    const { seconds, platform } = req.body;
    // Cap seconds between 1 and 120 to prevent tampering
    const validSeconds = Math.min(Math.max(1, parseInt(seconds, 10) || 1), 120);
    const validPlatform = ['android', 'ios', 'web'].includes(platform) ? platform : 'web';
    const today = getDhakaDateString();

    const activity = await UserActivity.findOneAndUpdate(
      { userId: req.user._id, date: today },
      { 
        $inc: { activeSeconds: validSeconds },
        $set: { 
          lastPingAt: new Date(),
          platform: validPlatform
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Also update lifetime total on user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalScreenTimeSeconds: validSeconds },
      $set: { 
        lastActiveAt: new Date(),
        lastPlatform: validPlatform
      }
    });

    res.json({
      success: true,
      todayDate: today,
      todaySeconds: activity.activeSeconds
    });
  } catch (err) {
    console.error('recordHeartbeat error:', err);
    res.status(500).json({ message: 'Failed to record activity heartbeat' });
  }
};
