const express = require('express')
const router = express.Router()
const levelController = require('../controllers/levelController')
const authMid = require('../middlewares/authMiddleware')

//create
router.post('/levels', levelController.create)

//read
router.get('/:slugSection/levels/:id/soal/:idSoal', authMid.verifyLogin, levelController.getSoalByLevelAndId);
router.get('/:slugSection/levels/:id/soal', authMid.verifyLogin, levelController.getSoalsByLevel);
router.get('/:slugSection/levels/:id', authMid.verifyLogin, levelController.getBySectionId);
router.get('/:slugSection/levels', authMid.verifyLogin, levelController.getAllBySection);
router.get('/levels', authMid.verifyLogin, authMid.onlyAdmin, levelController.getAll);
router.get('/levels/:id', authMid.verifyLogin, authMid.onlyAdmin, levelController.getById);
router.get('/:slugSection/fetch-levels', authMid.verifyLogin, authMid.onlyAdmin, levelController.fetchLevels);

//update
router.put('/levels/:id', levelController.update)

//delete
router.delete('/levels/:id', levelController.remove)

module.exports = router