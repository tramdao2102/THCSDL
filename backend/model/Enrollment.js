const pool = require('../utils/database');

class Enrollment {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT e.*, 
               s.full_name as student_name,
               c.class_name,
               co.fee as course_fee
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN courses co ON c.course_id = co.course_id
        ORDER BY e.enrollment_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching enrollments: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT e.*, 
               s.full_name as student_name,
               c.class_name,
               co.fee as course_fee
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN courses co ON c.course_id = co.course_id
        WHERE e.enrollment_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching enrollment: ${error.message}`);
    }
  }

  static async create(enrollmentData) {
    const {
      student_id,
      class_id,
      enrollment_date,
      fee_paid,
      payment_status,
      status
    } = enrollmentData;

    try {
      const result = await pool.query(
        `INSERT INTO enrollments (student_id, class_id, enrollment_date, fee_paid, payment_status, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [student_id, class_id, enrollment_date, fee_paid, payment_status, status]
      );
      
      // Update class student count
      await pool.query(`
        UPDATE classes 
        SET current_students = (
          SELECT COUNT(*) 
          FROM enrollments 
          WHERE class_id = $1 AND status = 'ACTIVE'
        )
        WHERE class_id = $1
      `, [class_id]);
      
      // Get the complete enrollment data with joined tables
      const completeEnrollment = await this.findById(result.rows[0].enrollment_id);
      return completeEnrollment;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid student or class ID');
      }
      if (error.code === '23505') {
        throw new Error('Student is already enrolled in this class');
      }
      throw new Error(`Error creating enrollment: ${error.message}`);
    }
  }

  static async update(id, enrollmentData) {
    const {
      student_id,
      class_id,
      enrollment_date,
      fee_paid,
      payment_status,
      status
    } = enrollmentData;

    try {
      const result = await pool.query(
        `UPDATE enrollments 
         SET student_id = $1, class_id = $2, enrollment_date = $3, 
             fee_paid = $4, payment_status = $5, status = $6
         WHERE enrollment_id = $7
         RETURNING *`,
        [student_id, class_id, enrollment_date, fee_paid, payment_status, status, id]
      );
      
      // Update class student count for both old and new classes
      await pool.query(`
        UPDATE classes 
        SET current_students = (
          SELECT COUNT(*) 
          FROM enrollments 
          WHERE class_id = classes.class_id AND status = 'ACTIVE'
        )
        WHERE class_id = $1
      `, [class_id]);
      
      // Get the complete enrollment data with joined tables
      const completeEnrollment = await this.findById(id);
      return completeEnrollment;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid student or class ID');
      }
      if (error.code === '23505') {
        throw new Error('Student is already enrolled in this class');
      }
      throw new Error(`Error updating enrollment: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      // Get enrollment info before deletion
      const enrollment = await this.findById(id);
      if (!enrollment) {
        return null;
      }

      const result = await pool.query(
        'DELETE FROM enrollments WHERE enrollment_id = $1 RETURNING *',
        [id]
      );
      
      // Update class student count
      await pool.query(`
        UPDATE classes 
        SET current_students = (
          SELECT COUNT(*) 
          FROM enrollments 
          WHERE class_id = $1 AND status = 'ACTIVE'
        )
        WHERE class_id = $1
      `, [enrollment.class_id]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting enrollment: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(`
        SELECT e.*, 
               s.full_name as student_name,
               c.class_name,
               co.fee as course_fee
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN courses co ON c.course_id = co.course_id
        WHERE s.full_name ILIKE $1 OR c.class_name ILIKE $1
        ORDER BY e.enrollment_date DESC
      `, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching enrollments: ${error.message}`);
    }
  }

  static async findByStudentId(studentId) {
    try {
      const result = await pool.query(`
        SELECT e.*, 
               s.full_name as student_name,
               c.class_name,
               co.fee as course_fee
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN courses co ON c.course_id = co.course_id
        WHERE e.student_id = $1
        ORDER BY e.enrollment_date DESC
      `, [studentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching student enrollments: ${error.message}`);
    }
  }

  static async findByClassId(classId) {
    try {
      const result = await pool.query(`
        SELECT e.*, 
               s.full_name as student_name,
               c.class_name,
               co.fee as course_fee
        FROM enrollments e
        LEFT JOIN students s ON e.student_id = s.student_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN courses co ON c.course_id = co.course_id
        WHERE e.class_id = $1
        ORDER BY e.enrollment_date DESC
      `, [classId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching class enrollments: ${error.message}`);
    }
  }
}

module.exports = Enrollment;