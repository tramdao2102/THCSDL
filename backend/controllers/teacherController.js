const Teacher = require('../model/Teacher');

const teacherController = {
  // GET /api/teachers
  async getAllTeachers(req, res) {
    try {
      const teachers = await Teacher.findAll();
      res.json(teachers);
    } catch (error) {
      console.error('Error in getAllTeachers:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/teachers/:id
  async getTeacherById(req, res) {
    try {
      const { id } = req.params;
      const teacher = await Teacher.findById(id);
      
      if (!teacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      res.json(teacher);
    } catch (error) {
      console.error('Error in getTeacherById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/teachers
  async createTeacher(req, res) {
    try {
      const teacherData = req.body;
      
      // Validation
      if (!teacherData.full_name || !teacherData.email) {
        return res.status(400).json({ error: 'Full name and email are required' });
      }

      const newTeacher = await Teacher.create(teacherData);
      res.status(201).json(newTeacher);
    } catch (error) {
      console.error('Error in createTeacher:', error);
      if (error.message.includes('Email already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/teachers/:id
  async updateTeacher(req, res) {
    try {
      const { id } = req.params;
      const teacherData = req.body;
      
      // Check if teacher exists
      const existingTeacher = await Teacher.findById(id);
      if (!existingTeacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }

      const updatedTeacher = await Teacher.update(id, teacherData);
      res.json(updatedTeacher);
    } catch (error) {
      console.error('Error in updateTeacher:', error);
      if (error.message.includes('Email already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/teachers/:id
  async deleteTeacher(req, res) {
    try {
      const { id } = req.params;
      
      const deletedTeacher = await Teacher.delete(id);
      if (!deletedTeacher) {
        return res.status(404).json({ error: 'Teacher not found' });
      }
      
      res.json({ message: 'Teacher deleted successfully', teacher: deletedTeacher });
    } catch (error) {
      console.error('Error in deleteTeacher:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/teachers/search?q=searchTerm
  async searchTeachers(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const teachers = await Teacher.search(q);
      res.json(teachers);
    } catch (error) {
      console.error('Error in searchTeachers:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = teacherController;