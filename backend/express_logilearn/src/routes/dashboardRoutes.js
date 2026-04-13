const express = require('express')
const router = express.Router()
const dashboardController = require('../controllers/dashboardController')
const authMid = require('../middlewares/authMiddleware')

router.get('/dashboard-stats', authMid.verifyLogin, dashboardController.getStats)

module.exports = router
