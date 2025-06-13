const Enrollment = require('../model/Enrollment');

const enrollmentController = {
  // GET /api/enrollments
  async getAllEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.findAll();
      res.json(enrollments);
    } catch (error) {
      console.error('Error in getAllEnrollments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/enrollments/:id
  async getEnrollmentById(req, res) {
    try {
      const { id } = req.params;
      const enrollment = await Enrollment.findById(id);
      
      if (!enrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      
      res.json(enrollment);
    } catch (error) {
      console.error('Error in getEnrollmentById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/enrollments
  async createEnrollment(req, res) {
    try {
      const enrollmentData = req.body;
      
      // Validation
      if (!enrollmentData.student_id || !enrollmentData.class_id) {
        return res.status(400).json({ 
          error: 'Student ID and Class ID are required' 
        });
      }

      // Set default values
      enrollmentData.enrollment_date = enrollmentData.enrollment_date || new Date().toISOString().split('T')[0];
      enrollmentData.fee_paid = enrollmentData.fee_paid || 0;
      enrollmentData.payment_status = enrollmentData.payment_status || 'PENDING';
      enrollmentData.status = enrollmentData.status || 'ACTIVE';

      const newEnrollment = await Enrollment.create(enrollmentData);
      res.status(201).json(newEnrollment);
    } catch (error) {
      console.error('Error in createEnrollment:', error);
      if (error.message.includes('Invalid student or class ID')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('already enrolled')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/enrollments/:id
  async updateEnrollment(req, res) {
    try {
      const { id } = req.params;
      const enrollmentData = req.body;
      
      // Check if enrollment exists
      const existingEnrollment = await Enrollment.findById(id);
      if (!existingEnrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }

      const updatedEnrollment = await Enrollment.update(id, enrollmentData);
      res.json(updatedEnrollment);
    } catch (error) {
      console.error('Error in updateEnrollment:', error);
      if (error.message.includes('Invalid student or class ID')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('already enrolled')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/enrollments/:id
  async deleteEnrollment(req, res) {
    try {
      const { id } = req.params;
      
      const deletedEnrollment = await Enrollment.delete(id);
      if (!deletedEnrollment) {
        return res.status(404).json({ error: 'Enrollment not found' });
      }
      
      res.json({ message: 'Enrollment deleted successfully', enrollment: deletedEnrollment });
    } catch (error) {
      console.error('Error in deleteEnrollment:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/enrollments/search?q=searchTerm
  async searchEnrollments(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const enrollments = await Enrollment.search(q);
      res.json(enrollments);
    } catch (error) {
      console.error('Error in searchEnrollments:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/enrollments/student/:studentId
  async getEnrollmentsByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const enrollments = await Enrollment.findByStudentId(studentId);
      res.json(enrollments);
    } catch (error) {
      console.error('Error in getEnrollmentsByStudent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/enrollments/class/:classId
  async getEnrollmentsByClass(req, res) {
    try {
      const { classId } = req.params;
      const enrollments = await Enrollment.findByClassId(classId);
      res.json(enrollments);
    } catch (error) {
      console.error('Error in getEnrollmentsByClass:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = enrollmentController;