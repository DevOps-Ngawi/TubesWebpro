const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, getStats, getBadges } = require('../controllers/pelajarController');
const { verifyLogin } = require('../middlewares/authMiddleware');

router.get('/profile', verifyLogin, getProfile);
router.put('/profile/change-password', verifyLogin, changePassword);
router.get('/pelajar/:id/stats', verifyLogin, getStats);
router.get('/pelajar/:id/badges', verifyLogin, getBadges);

module.exports = router;