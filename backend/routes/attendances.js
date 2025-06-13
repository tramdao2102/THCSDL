const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.get('/', attendanceController.getAllAttendance);
router.get('/summary', attendanceController.getAttendanceSummary);
router.get('/session/:sessionId', attendanceController.getAttendanceBySession);
router.get('/student/:studentId', attendanceController.getAttendanceByStudent);
router.get('/:id', attendanceController.getAttendanceById);
router.post('/', attendanceController.createAttendance);
router.post('/bulk', attendanceController.bulkCreateOrUpdateAttendance);
router.put('/summary/:studentId/:classId', attendanceController.updateAttendanceSummary);
router.put('/:id', attendanceController.updateAttendance);
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;