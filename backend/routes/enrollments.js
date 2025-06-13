const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

router.get('/', enrollmentController.getAllEnrollments);
router.get('/:id', enrollmentController.getEnrollmentById);
router.get('/student/:studentId', enrollmentController.getEnrollmentsByStudent);
router.get('/class/:classId', enrollmentController.getEnrollmentsByClass);
router.get('/search', enrollmentController.searchEnrollments);
router.post('/', enrollmentController.createEnrollment);
router.put('/:id', enrollmentController.updateEnrollment);
router.delete('/:id', enrollmentController.deleteEnrollment);

module.exports = router;