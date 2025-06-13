const pool = require('../utils/database');

class Test {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          t.*,
          c.class_name,
          tt.type_name as test_type_name
        FROM tests t
        LEFT JOIN classes c ON t.class_id = c.class_id
        LEFT JOIN test_types tt ON t.test_type_id = tt.test_type_id
        ORDER BY t.test_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching tests: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          t.*,
          c.class_name,
          tt.type_name as test_type_name
        FROM tests t
        LEFT JOIN classes c ON t.class_id = c.class_id
        LEFT JOIN test_types tt ON t.test_type_id = tt.test_type_id
        WHERE t.test_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching test: ${error.message}`);
    }
  }

  static async create(testData) {
    const {
      test_name,
      class_id,
      test_type_id,
      test_date,
      max_score,
      duration_minutes,
      description,
      status
    } = testData;

    try {
      const result = await pool.query(`
        INSERT INTO tests (test_name, class_id, test_type_id, test_date, max_score, duration_minutes, description, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [test_name, class_id, test_type_id, test_date, max_score, duration_minutes, description, status]);
      
      return await this.findById(result.rows[0].test_id);
    } catch (error) {
      throw new Error(`Error creating test: ${error.message}`);
    }
  }

  static async update(id, testData) {
    const {
      test_name,
      class_id,
      test_type_id,
      test_date,
      max_score,
      duration_minutes,
      description,
      status
    } = testData;

    try {
      const result = await pool.query(`
        UPDATE tests 
        SET test_name = $1, class_id = $2, test_type_id = $3, test_date = $4,
            max_score = $5, duration_minutes = $6, description = $7, status = $8
        WHERE test_id = $9
        RETURNING *
      `, [test_name, class_id, test_type_id, test_date, max_score, duration_minutes, description, status, id]);
      
      if (result.rows.length === 0) {
        throw new Error('Test not found');
      }
      
      return await this.findById(id);
    } catch (error) {
      throw new Error(`Error updating test: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM tests WHERE test_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting test: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(`
        SELECT 
          t.*,
          c.class_name,
          tt.type_name as test_type_name
        FROM tests t
        LEFT JOIN classes c ON t.class_id = c.class_id
        LEFT JOIN test_types tt ON t.test_type_id = tt.test_type_id
        WHERE t.test_name ILIKE $1 OR c.class_name ILIKE $1
        ORDER BY t.test_date DESC
      `, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching tests: ${error.message}`);
    }
  }
}

module.exports = Test;