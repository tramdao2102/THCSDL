const pool = require('../utils/database');

class Student {
  static async findAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM students ORDER BY student_id DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching students: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM students WHERE student_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching student: ${error.message}`);
    }
  }

  static async create(studentData) {
    const {
      full_name,
      email,
      phone,
      address,
      date_of_birth,
      gender,
      registration_date,
      status
    } = studentData;

    try {
      const result = await pool.query(
        `INSERT INTO students (full_name, email, phone, address, date_of_birth, gender, registration_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [full_name, email, phone, address, date_of_birth, gender, registration_date, status]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email already exists');
      }
      throw new Error(`Error creating student: ${error.message}`);
    }
  }

  static async update(id, studentData) {
    const {
      full_name,
      email,
      phone,
      address,
      date_of_birth,
      gender,
      status
    } = studentData;

    try {
      const result = await pool.query(
        `UPDATE students 
         SET full_name = $1, email = $2, phone = $3, address = $4, 
             date_of_birth = $5, gender = $6, status = $7
         WHERE student_id = $8
         RETURNING *`,
        [full_name, email, phone, address, date_of_birth, gender, status, id]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw new Error(`Error updating student: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM students WHERE student_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting student: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT * FROM students 
         WHERE full_name ILIKE $1 OR email ILIKE $1
         ORDER BY registration_date DESC`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching students: ${error.message}`);
    }
  }
}

module.exports = Student;