const pool = require('../utils/database');

class Course {
  static async findAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM courses ORDER BY course_id DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching courses: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM courses WHERE course_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching course: ${error.message}`);
    }
  }

  static async create(courseData) {
    const {
      course_name,
      description,
      level,
      duration_weeks,
      fee,
      max_students,
      status
    } = courseData;

    try {
      const result = await pool.query(
        `INSERT INTO courses (course_name, description, level, duration_weeks, fee, max_students, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [course_name, description, level, duration_weeks, fee, max_students, status]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating course: ${error.message}`);
    }
  }

  static async update(id, courseData) {
    const {
      course_name,
      description,
      level,
      duration_weeks,
      fee,
      max_students,
      status
    } = courseData;

    try {
      const result = await pool.query(
        `UPDATE courses 
         SET course_name = $1, description = $2, level = $3, duration_weeks = $4,
             fee = $5, max_students = $6, status = $7
         WHERE course_id = $8
         RETURNING *`,
        [course_name, description, level, duration_weeks, fee, max_students, status, id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating course: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Check if course is being used in classes
      const classCheck = await pool.query(
        'SELECT COUNT(*) FROM classes WHERE course_id = $1',
        [id]
      );
      
      if (parseInt(classCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete course: It is being used in active classes');
      }

      const result = await pool.query(
        'DELETE FROM courses WHERE course_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting course: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT * FROM courses 
         WHERE course_name ILIKE $1 OR description ILIKE $1
         ORDER BY course_name ASC`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching courses: ${error.message}`);
    }
  }
}

module.exports = Course;