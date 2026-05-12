const express = require('express');
const router = express.Router();
const attemptController = require('../controllers/attemptController');
const { verifyLogin, onlyAdmin } = require('../middlewares/authMiddleware');

router.post('/attempts', verifyLogin, attemptController.create);
router.get('/attempts', verifyLogin, onlyAdmin, attemptController.getAllAttempts);
router.get('/attempts/:id', verifyLogin, onlyAdmin, attemptController.getAttemptById);
router.get('/attempts/level/:levelId', verifyLogin, attemptController.getAttemptsByLevel);
router.get('/attempts/pelajar/:pelajarId', verifyLogin, attemptController.getAttemptsByPelajar);

router.post('/attempts/submit', verifyLogin, attemptController.submitAttempt);

router.put('/attempts/:id', verifyLogin, onlyAdmin, attemptController.update);

router.delete('/attempts/:id', verifyLogin, onlyAdmin, attemptController.remove);

router.get('/leaderboard', verifyLogin, attemptController.getLeaderboard);
router.get('/leaderboard/:levelId', verifyLogin, attemptController.getLeaderboard);

module.exports = router;