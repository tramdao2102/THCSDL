const pool = require('../utils/database');

class Class {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               co.course_name,
               t.full_name as teacher_name
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.course_id
        LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
        ORDER BY c.class_id DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching classes: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               co.course_name,
               t.full_name as teacher_name
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.course_id
        LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
        WHERE c.class_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching class: ${error.message}`);
    }
  }

  static async create(classData) {
    const {
      class_name,
      course_id,
      teacher_id,
      start_date,
      end_date,
      schedule,
      room,
      current_students,
      status
    } = classData;

    try {
      const result = await pool.query(
        `INSERT INTO classes (class_name, course_id, teacher_id, start_date, end_date, schedule, room, current_students, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [class_name, course_id, teacher_id, start_date, end_date, schedule, room, current_students, status]
      );
      
      // Get the complete class data with joined tables
      const completeClass = await this.findById(result.rows[0].class_id);
      return completeClass;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid course or teacher ID');
      }
      throw new Error(`Error creating class: ${error.message}`);
    }
  }

  static async update(id, classData) {
    const {
      class_name,
      course_id,
      teacher_id,
      start_date,
      end_date,
      schedule,
      room,
      current_students,
      status
    } = classData;

    try {
      const result = await pool.query(
        `UPDATE classes 
         SET class_name = $1, course_id = $2, teacher_id = $3, start_date = $4,
             end_date = $5, schedule = $6, room = $7, current_students = $8, status = $9
         WHERE class_id = $10
         RETURNING *`,
        [class_name, course_id, teacher_id, start_date, end_date, schedule, room, current_students, status, id]
      );
      
      // Get the complete class data with joined tables
      const completeClass = await this.findById(id);
      return completeClass;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid course or teacher ID');
      }
      throw new Error(`Error updating class: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Check if class has enrollments
      const enrollmentCheck = await pool.query(
        'SELECT COUNT(*) FROM enrollments WHERE class_id = $1',
        [id]
      );
      
      if (parseInt(enrollmentCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete class: Students are enrolled in this class');
      }

      const result = await pool.query(
        'DELETE FROM classes WHERE class_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting class: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(`
        SELECT c.*, 
               co.course_name,
               t.full_name as teacher_name
        FROM classes c
        LEFT JOIN courses co ON c.course_id = co.course_id
        LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
        WHERE c.class_name ILIKE $1 OR co.course_name ILIKE $1 OR t.full_name ILIKE $1
        ORDER BY c.class_name ASC
      `, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching classes: ${error.message}`);
    }
  }

  static async updateStudentCount(classId) {
    try {
      await pool.query(`
        UPDATE classes 
        SET current_students = (
          SELECT COUNT(*) 
          FROM enrollments 
          WHERE class_id = $1 AND status = 'ACTIVE'
        )
        WHERE class_id = $1
      `, [classId]);
    } catch (error) {
      throw new Error(`Error updating student count: ${error.message}`);
    }
  }
}

module.exports = Class;