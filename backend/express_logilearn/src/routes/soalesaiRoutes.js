const express = require('express');
const router = express.Router();
const esaiController = require('../controllers/esaiController');
const { verifyLogin, onlyAdmin } = require('../middlewares/authMiddleware');

router.post('/soal-esai', verifyLogin, onlyAdmin, esaiController.createEsai);

router.put('/soal-esai/:id', verifyLogin, onlyAdmin, esaiController.updateEsai);

router.delete('/soal-esai/:id', verifyLogin, onlyAdmin, esaiController.deleteEsai);

router.get('/soal-esai', verifyLogin, esaiController.getAllEsai);
router.get('/soal-esai/:id', verifyLogin, esaiController.getEsaiById);
router.get('/soal-esai/level/:id_level', verifyLogin, esaiController.getEsaiByLevel);
router.get('/fetch-soal-esai', verifyLogin, onlyAdmin, esaiController.fetchEsai);

module.exports = router;