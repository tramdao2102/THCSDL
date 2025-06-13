const pool = require('../utils/database');

class Payment {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT p.*, 
               s.full_name as student_name,
               e.enrollment_id,
               c.class_name as enrollment_class,
               t.full_name as created_by_name
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.student_id
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN teachers t ON p.created_by = t.teacher_id
        ORDER BY p.payment_date DESC, p.created_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching payments: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT p.*, 
               s.full_name as student_name,
               e.enrollment_id,
               c.class_name as enrollment_class,
               t.full_name as created_by_name
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.student_id
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN teachers t ON p.created_by = t.teacher_id
        WHERE p.payment_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching payment: ${error.message}`);
    }
  }

  static async create(paymentData) {
    const {
      student_id,
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      transaction_id,
      description,
      status,
      created_by
    } = paymentData;

    try {
      const result = await pool.query(
        `INSERT INTO payments (student_id, enrollment_id, amount, payment_date, payment_method, transaction_id, description, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [student_id, enrollment_id, amount, payment_date, payment_method, transaction_id, description, status, created_by]
      );
      
      // Get the complete payment data with joined tables
      const completePayment = await this.findById(result.rows[0].payment_id);
      return completePayment;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid student ID or enrollment ID');
      }
      throw new Error(`Error creating payment: ${error.message}`);
    }
  }

  static async update(id, paymentData) {
    const {
      student_id,
      enrollment_id,
      amount,
      payment_date,
      payment_method,
      transaction_id,
      description,
      status
    } = paymentData;

    try {
      const result = await pool.query(
        `UPDATE payments 
         SET student_id = $1, enrollment_id = $2, amount = $3, payment_date = $4, 
             payment_method = $5, transaction_id = $6, description = $7, status = $8
         WHERE payment_id = $9
         RETURNING *`,
        [student_id, enrollment_id, amount, payment_date, payment_method, transaction_id, description, status, id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      // Get the complete payment data with joined tables
      const completePayment = await this.findById(id);
      return completePayment;
    } catch (error) {
      if (error.code === '23503') {
        throw new Error('Invalid student ID or enrollment ID');
      }
      throw new Error(`Error updating payment: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM payments WHERE payment_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting payment: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(`
        SELECT p.*, 
               s.full_name as student_name,
               e.enrollment_id,
               c.class_name as enrollment_class,
               t.full_name as created_by_name
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.student_id
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN teachers t ON p.created_by = t.teacher_id
        WHERE s.full_name ILIKE $1 OR c.class_name ILIKE $1 OR p.payment_method ILIKE $1
        ORDER BY p.payment_date DESC, p.created_date DESC
      `, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching payments: ${error.message}`);
    }
  }

  static async findByStudentId(studentId) {
    try {
      const result = await pool.query(`
        SELECT p.*, 
               s.full_name as student_name,
               e.enrollment_id,
               c.class_name as enrollment_class,
               t.full_name as created_by_name
        FROM payments p
        LEFT JOIN students s ON p.student_id = s.student_id
        LEFT JOIN enrollments e ON p.enrollment_id = e.enrollment_id
        LEFT JOIN classes c ON e.class_id = c.class_id
        LEFT JOIN teachers t ON p.created_by = t.teacher_id
        WHERE p.student_id = $1
        ORDER BY p.payment_date DESC, p.created_date DESC
      `, [studentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching student payments: ${error.message}`);
    }
  }

  static async getPaymentSummary() {
    try {
      const result = await pool.query(`
        SELECT 
          s.student_id,
          s.full_name as student_name,
          COUNT(p.payment_id) as total_payments,
          COALESCE(SUM(p.amount), 0) as total_amount,
          MAX(p.payment_date) as last_payment_date,
          CASE 
            WHEN COUNT(p.payment_id) > 0 THEN 'ACTIVE'
            ELSE 'INACTIVE'
          END as payment_status
        FROM students s
        LEFT JOIN payments p ON s.student_id = p.student_id AND p.status = 'COMPLETED'
        WHERE s.status = 'ACTIVE'
        GROUP BY s.student_id, s.full_name
        ORDER BY total_amount DESC, s.full_name
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching payment summary: ${error.message}`);
    }
  }

  // Get students for dropdown
  static async getStudents() {
    try {
      const result = await pool.query(`
        SELECT student_id, full_name 
        FROM students 
        WHERE status = 'ACTIVE'
        ORDER BY full_name
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching students: ${error.message}`);
    }
  }

  // Get enrollments for dropdown
  static async getEnrollments() {
    try {
      const result = await pool.query(`
        SELECT e.enrollment_id, e.student_id, c.class_name
        FROM enrollments e
        JOIN classes c ON e.class_id = c.class_id
        WHERE e.status = 'ACTIVE'
        ORDER BY c.class_name
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching enrollments: ${error.message}`);
    }
  }
}

module.exports = Payment;