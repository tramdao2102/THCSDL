const Course = require('../model/Course');

const courseController = {
  // GET /api/courses
  async getAllCourses(req, res) {
    try {
      const courses = await Course.findAll();
      res.json(courses);
    } catch (error) {
      console.error('Error in getAllCourses:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/courses/:id
  async getCourseById(req, res) {
    try {
      const { id } = req.params;
      const course = await Course.findById(id);
      
      if (!course) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      res.json(course);
    } catch (error) {
      console.error('Error in getCourseById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/courses
  async createCourse(req, res) {
    try {
      const courseData = req.body;
      
      // Validation
      if (!courseData.course_name) {
        return res.status(400).json({ error: 'Course name is required' });
      }

      // Set default values
      courseData.level = courseData.level || 'BEGINNER';
      courseData.duration_weeks = courseData.duration_weeks || 8;
      courseData.fee = courseData.fee || 0;
      courseData.max_students = courseData.max_students || 20;
      courseData.status = courseData.status || 'ACTIVE';

      const newCourse = await Course.create(courseData);
      res.status(201).json(newCourse);
    } catch (error) {
      console.error('Error in createCourse:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/courses/:id
  async updateCourse(req, res) {
    try {
      const { id } = req.params;
      const courseData = req.body;
      
      // Check if course exists
      const existingCourse = await Course.findById(id);
      if (!existingCourse) {
        return res.status(404).json({ error: 'Course not found' });
      }

      const updatedCourse = await Course.update(id, courseData);
      res.json(updatedCourse);
    } catch (error) {
      console.error('Error in updateCourse:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/courses/:id
  async deleteCourse(req, res) {
    try {
      const { id } = req.params;
      
      const deletedCourse = await Course.delete(id);
      if (!deletedCourse) {
        return res.status(404).json({ error: 'Course not found' });
      }
      
      res.json({ message: 'Course deleted successfully', course: deletedCourse });
    } catch (error) {
      console.error('Error in deleteCourse:', error);
      if (error.message.includes('Cannot delete course')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // GET /api/courses/search?q=searchTerm
  async searchCourses(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const courses = await Course.search(q);
      res.json(courses);
    } catch (error) {
      console.error('Error in searchCourses:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = courseController;