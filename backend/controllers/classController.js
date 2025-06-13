const Class = require('../model/Class');

const classController = {
  // GET /api/classes
  async getAllClasses(req, res) {
    try {
      const classes = await Class.findAll();
      res.json(classes);
    } catch (error) {
      console.error('Error in getAllClasses:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/classes/:id
  async getClassById(req, res) {
    try {
      const { id } = req.params;
      const classData = await Class.findById(id);
      
      if (!classData) {
        return res.status(404).json({ error: 'Class not found' });
      }
      
      res.json(classData);
    } catch (error) {
      console.error('Error in getClassById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/classes
  async createClass(req, res) {
    try {
      const classData = req.body;
      
      // Validation
      if (!classData.class_name || !classData.course_id || !classData.teacher_id) {
        return res.status(400).json({ 
          error: 'Class name, course ID, and teacher ID are required' 
        });
      }

      // Set default values
      classData.current_students = classData.current_students || 0;
      classData.status = classData.status || 'ACTIVE';

      const newClass = await Class.create(classData);
      res.status(201).json(newClass);
    } catch (error) {
      console.error('Error in createClass:', error);
      if (error.message.includes('Invalid course or teacher ID')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/classes/:id
  async updateClass(req, res) {
    try {
      const { id } = req.params;
      const classData = req.body;
      
      // Check if class exists
      const existingClass = await Class.findById(id);
      if (!existingClass) {
        return res.status(404).json({ error: 'Class not found' });
      }

      const updatedClass = await Class.update(id, classData);
      res.json(updatedClass);
    } catch (error) {
      console.error('Error in updateClass:', error);
      if (error.message.includes('Invalid course or teacher ID')) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/classes/:id
  async deleteClass(req, res) {
    try {
      const { id } = req.params;
      
      const deletedClass = await Class.delete(id);
      if (!deletedClass) {
        return res.status(404).json({ error: 'Class not found' });
      }
      
      res.json({ message: 'Class deleted successfully', class: deletedClass });
    } catch (error) {
      console.error('Error in deleteClass:', error);
      if (error.message.includes('Cannot delete class')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // GET /api/classes/search?q=searchTerm
  async searchClasses(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const classes = await Class.search(q);
      res.json(classes);
    } catch (error) {
      console.error('Error in searchClasses:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/classes/:id/update-student-count
  async updateStudentCount(req, res) {
    try {
      const { id } = req.params;
      
      await Class.updateStudentCount(id);
      const updatedClass = await Class.findById(id);
      
      res.json(updatedClass);
    } catch (error) {
      console.error('Error in updateStudentCount:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = classController;