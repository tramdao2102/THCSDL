const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

router.get('/', classController.getAllClasses);
router.get('/search', classController.searchClasses);
router.get('/:id', classController.getClassById);
router.post('/', classController.createClass);
router.put('/:id', classController.updateClass);
router.put('/:id/update-student-count', classController.updateStudentCount);
router.delete('/:id', classController.deleteClass);

module.exports = router;