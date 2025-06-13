const express = require('express');
const router = express.Router();
const scoreController = require('../controllers/scoreController');

router.get('/', scoreController.getAllScores);
router.get('/search', scoreController.searchScores);
router.get('/statistics', scoreController.getScoreStatistics);
router.get('/student/:studentId', scoreController.getScoresByStudent);
router.get('/test/:testId', scoreController.getScoresByTest);
router.get('/:id', scoreController.getScoreById);
router.post('/', scoreController.createScore);
router.put('/:id', scoreController.updateScore);
router.delete('/:id', scoreController.deleteScore);

module.exports = router;