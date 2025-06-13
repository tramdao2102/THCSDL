const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/sessionController');

router.get('/', SessionController.getAllSessions);
router.get('/:id', SessionController.getSessionById);
router.get('/search', SessionController.searchSessions);
router.post('/', SessionController.createSession);
router.put('/:id', SessionController.updateSession);
router.delete('/:id', SessionController.deleteSession);
router.get('/class/:classId', SessionController.getSessionsByClass);

module.exports = router;