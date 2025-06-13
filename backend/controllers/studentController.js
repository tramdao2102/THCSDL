const Student = require('../model/Student');

const studentController = {
  // GET /api/students
  async getAllStudents(req, res) {
    try {
      const students = await Student.findAll();
      res.json(students);
    } catch (error) {
      console.error('Error in getAllStudents:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/students/:id
  async getStudentById(req, res) {
    try {
      const { id } = req.params;
      const student = await Student.findById(id);
      
      if (!student) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json(student);
    } catch (error) {
      console.error('Error in getStudentById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/students
  async createStudent(req, res) {
    try {
      const studentData = req.body;
      
      // Validation
      if (!studentData.full_name || !studentData.email) {
        return res.status(400).json({ error: 'Full name and email are required' });
      }

      const newStudent = await Student.create(studentData);
      res.status(201).json(newStudent);
    } catch (error) {
      console.error('Error in createStudent:', error);
      if (error.message.includes('Email already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/students/:id
  async updateStudent(req, res) {
    try {
      const { id } = req.params;
      const studentData = req.body;
      
      // Check if student exists
      const existingStudent = await Student.findById(id);
      if (!existingStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }

      const updatedStudent = await Student.update(id, studentData);
      res.json(updatedStudent);
    } catch (error) {
      console.error('Error in updateStudent:', error);
      if (error.message.includes('Email already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/students/:id
  async deleteStudent(req, res) {
    try {
      const { id } = req.params;
      
      const deletedStudent = await Student.delete(id);
      if (!deletedStudent) {
        return res.status(404).json({ error: 'Student not found' });
      }
      
      res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
      console.error('Error in deleteStudent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/students/search?q=searchTerm
  async searchStudents(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const students = await Student.search(q);
      res.json(students);
    } catch (error) {
      console.error('Error in searchStudents:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = studentController;