const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const activityController = require('../controllers/activityController');

router.post('/heartbeat', protect, activityController.recordHeartbeat);

module.exports = router;
