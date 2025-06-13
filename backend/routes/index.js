const express = require('express');
const router = express.Router();

const studentRoutes = require('./students');
const teacherRoutes = require('./teachers');
const courseRoutes = require('./courses');
const classRoutes = require('./classes');
const enrollmentRoutes = require('./enrollments'); 
const scoreRoutes = require('./scores');
const testRoutes = require('./tests');
const sessionRoutes = require('./sessions');
const attendanceRoutes = require('./attendances');
const paymentRoutes = require('./payments');

router.use('/students', studentRoutes);
router.use('/teachers', teacherRoutes);
router.use('/courses', courseRoutes);
router.use('/classes', classRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/scores', scoreRoutes);
router.use('/tests', testRoutes);
router.use('/sessions', sessionRoutes);
router.use('/attendances', attendanceRoutes);
router.use('/payments', paymentRoutes);

router.get('/', (req, res) => {
  res.json({
    message: 'English Center API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      teachers: '/api/teachers',
      courses: '/api/courses',
      classes: '/api/classes',
      enrollments: '/api/enrollments',
      scores: '/api/scores',
      tests: '/api/tests',
      sessions: '/api/sessions',
      attendances: '/api/attendances',
      payments: '/api/payments'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;