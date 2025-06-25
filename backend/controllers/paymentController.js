const Payment = require('../model/Payment');

const paymentController = {
  // GET /api/payments
  async getAllPayments(req, res) {
    try {
      const payments = await Payment.findAll();
      res.json(payments);
    } catch (error) {
      console.error('Error in getAllPayments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/:id
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);
      
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json(payment);
    } catch (error) {
      console.error('Error in getPaymentById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/payments
  async createPayment(req, res) {
    try {
      const paymentData = req.body;
      
      // Validation
      if (!paymentData.student_id || !paymentData.amount || !paymentData.payment_date) {
        return res.status(400).json({ 
          error: 'Student ID, amount, and payment date are required' 
        });
      }

      // Set default values
      paymentData.payment_method = paymentData.payment_method || 'BANK_TRANSFER';
      paymentData.status = paymentData.status || 'COMPLETED';

      const newPayment = await Payment.create(paymentData);
      res.status(201).json(newPayment);
    } catch (error) {
      console.error('Error in createPayment:', error);
      if (error.message.includes('Invalid student ID')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/payments/:id
  async updatePayment(req, res) {
    try {
      const { id } = req.params;
      const paymentData = req.body;
      
      // Check if payment exists
      const existingPayment = await Payment.findById(id);
      if (!existingPayment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      const updatedPayment = await Payment.update(id, paymentData);
      res.json(updatedPayment);
    } catch (error) {
      console.error('Error in updatePayment:', error);
      if (error.message.includes('Invalid student ID')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/payments/:id
  async deletePayment(req, res) {
    try {
      const { id } = req.params;
      
      const deletedPayment = await Payment.delete(id);
      if (!deletedPayment) {
        return res.status(404).json({ error: 'Payment not found' });
      }
      
      res.json({ message: 'Payment deleted successfully', payment: deletedPayment });
    } catch (error) {
      console.error('Error in deletePayment:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/search?q=searchTerm
  async searchPayments(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const payments = await Payment.search(q);
      res.json(payments);
    } catch (error) {
      console.error('Error in searchPayments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/student/:studentId
  async getPaymentsByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const payments = await Payment.findByStudentId(studentId);
      res.json(payments);
    } catch (error) {
      console.error('Error in getPaymentsByStudent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/summary
  async getPaymentSummary(req, res) {
    try {
      const summary = await Payment.getPaymentSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error in getPaymentSummary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/data/students
  async getStudents(req, res) {
    try {
      const students = await Payment.getStudents();
      res.json(students);
    } catch (error) {
      console.error('Error in getStudents:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/payments/data/enrollments
  async getEnrollments(req, res) {
    try {
      const enrollments = await Payment.getEnrollments();
      res.json(enrollments);
    } catch (error) {
      console.error('Error in getEnrollments:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = paymentController;