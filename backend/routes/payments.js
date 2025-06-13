const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Payment CRUD routes
router.get('/', paymentController.getAllPayments);
router.get('/summary', paymentController.getPaymentSummary);
router.get('/search', paymentController.searchPayments);
router.get('/data/students', paymentController.getStudents);
router.get('/data/enrollments', paymentController.getEnrollments);
router.get('/student/:studentId', paymentController.getPaymentsByStudent);
router.get('/:id', paymentController.getPaymentById);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;