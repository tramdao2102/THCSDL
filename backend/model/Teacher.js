const pool = require('../utils/database');

class Teacher {
  static async findAll() {
    try {
      const result = await pool.query(
        'SELECT * FROM teachers ORDER BY teacher_id DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching teachers: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM teachers WHERE teacher_id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching teacher: ${error.message}`);
    }
  }

  static async create(teacherData) {
    const {
      full_name,
      email,
      phone,
      qualification,
      experience_years,
      salary,
      hire_date,
      status
    } = teacherData;

    try {
      const result = await pool.query(
        `INSERT INTO teachers (full_name, email, phone, qualification, experience_years, salary, hire_date, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [full_name, email, phone, qualification, experience_years, salary, hire_date, status]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw new Error(`Error creating teacher: ${error.message}`);
    }
  }

  static async update(id, teacherData) {
    const {
      full_name,
      email,
      phone,
      qualification,
      experience_years,
      salary,
      status
    } = teacherData;

    try {
      const result = await pool.query(
        `UPDATE teachers 
         SET full_name = $1, email = $2, phone = $3, qualification = $4,
             experience_years = $5, salary = $6, status = $7
         WHERE teacher_id = $8
         RETURNING *`,
        [full_name, email, phone, qualification, experience_years, salary, status, id]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw new Error(`Error updating teacher: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM teachers WHERE teacher_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting teacher: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT * FROM teachers 
         WHERE full_name ILIKE $1 OR email ILIKE $1
         ORDER BY hire_date DESC`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching teachers: ${error.message}`);
    }
  }
}

module.exports = Teacher;