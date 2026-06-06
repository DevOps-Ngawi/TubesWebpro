const express = require('express');
const router = express.Router();
const { getGlobalLeaderboard, getLevelLeaderboard } = require('../controllers/leaderboardController');
const { verifyLogin } = require('../middlewares/authMiddleware');

router.get('/global/leaderboard', verifyLogin, (req, res) => {
  if (req.query.level_id) {
    return getLevelLeaderboard(req, res);
  }
  return getGlobalLeaderboard(req, res);
});

module.exports = router;
