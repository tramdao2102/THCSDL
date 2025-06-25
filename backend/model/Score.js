const pool = require('../utils/database');

class Score {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        ORDER BY s.created_date DESC
      `);
      return result.rows;
    } catch (error) {
      console.error(error.stack); 
      throw new Error(`Error fetching scores: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        WHERE s.score_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching score: ${error.message}`);
    }
  }

  static async create(scoreData) {
    let {
      student_id,
      test_id,
      listening_score,
      speaking_score,
      reading_score,
      writing_score,
      total_score,
      grade,
      notes
    } = scoreData;

    // Nếu frontend không truyền total_score/grade, tự động tính lại ở backend
    if (
      typeof listening_score === 'number' &&
      typeof speaking_score === 'number' &&
      typeof reading_score === 'number' &&
      typeof writing_score === 'number'
    ) {
      total_score = (
        (listening_score + speaking_score + reading_score + writing_score) / 4
      );
      // Làm tròn 2 chữ số thập phân
      total_score = Math.round(total_score * 100) / 100;

      // Tính grade giống frontend/database
      if (total_score >= 8.5) grade = 'Expert';
      else if (total_score >= 7.5) grade = 'Very Good';
      else if (total_score >= 6.5) grade = 'Good';
      else if (total_score >= 5.5) grade = 'Competent';
      else if (total_score >= 4.5) grade = 'Modest';
      else if (total_score >= 3.5) grade = 'Limited';
      else grade = 'Extremely Limited';
    }

    try {
      const result = await pool.query(`
        INSERT INTO scores (
          student_id, test_id, listening_score, speaking_score, 
          reading_score, writing_score, total_score, grade, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [
        student_id, test_id, listening_score, speaking_score,
        reading_score, writing_score, total_score, grade, notes
      ]);

      // Get the complete score with joined data
      return await this.findById(result.rows[0].score_id);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Score already exists for this student and test');
      }
      throw new Error(`Error creating score: ${error.message}`);
    }
  }

  static async update(id, scoreData) {
    let {
      student_id,
      test_id,
      listening_score,
      speaking_score,
      reading_score,
      writing_score,
      total_score,
      grade,
      notes
    } = scoreData;

    // Nếu frontend không truyền total_score/grade, tự động tính lại ở backend
    if (
      typeof listening_score === 'number' &&
      typeof speaking_score === 'number' &&
      typeof reading_score === 'number' &&
      typeof writing_score === 'number'
    ) {
      total_score = (
        (listening_score + speaking_score + reading_score + writing_score) / 4
      );
      total_score = Math.round(total_score * 100) / 100;

      if (total_score >= 8.5) grade = 'Expert';
      else if (total_score >= 7.5) grade = 'Very Good';
      else if (total_score >= 6.5) grade = 'Good';
      else if (total_score >= 5.5) grade = 'Competent';
      else if (total_score >= 4.5) grade = 'Modest';
      else if (total_score >= 3.5) grade = 'Limited';
      else grade = 'Extremely Limited';
    }

    try {
      const result = await pool.query(`
        UPDATE scores 
        SET student_id = $1, test_id = $2, listening_score = $3, speaking_score = $4,
            reading_score = $5, writing_score = $6, total_score = $7, grade = $8,
            notes = $9, updated_date = CURRENT_TIMESTAMP
        WHERE score_id = $10
        RETURNING *
      `, [
        student_id, test_id, listening_score, speaking_score,
        reading_score, writing_score, total_score, grade, notes, id
      ]);

      if (result.rows.length === 0) {
        throw new Error('Score not found');
      }

      // Get the complete score with joined data
      return await this.findById(id);
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Score already exists for this student and test');
      }
      throw new Error(`Error updating score: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM scores WHERE score_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting score: ${error.message}`);
    }
  }

  static async findByStudent(studentId) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        WHERE s.student_id = $1
        ORDER BY s.created_date DESC
      `, [studentId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching student scores: ${error.message}`);
    }
  }

  static async findByTest(testId) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        WHERE s.test_id = $1
        ORDER BY s.total_score DESC
      `, [testId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching test scores: ${error.message}`);
    }
  }

  static async search(searchTerm) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        WHERE st.full_name ILIKE $1 OR t.test_name ILIKE $1
        ORDER BY s.created_date DESC
      `, [`%${searchTerm}%`]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error searching scores: ${error.message}`);
    }
  }
}

module.exports = Score;