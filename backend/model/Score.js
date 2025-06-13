const pool = require('../utils/database');

class Score {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name,
          te.full_name as teacher_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        JOIN teachers te ON s.teacher_id = te.teacher_id
        ORDER BY s.created_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching scores: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          s.*,
          st.full_name as student_name,
          t.test_name,
          te.full_name as teacher_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        JOIN teachers te ON s.teacher_id = te.teacher_id
        WHERE s.score_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching score: ${error.message}`);
    }
  }

  static async create(scoreData) {
    const {
      student_id,
      test_id,
      listening_score,
      speaking_score,
      reading_score,
      writing_score,
      total_score,
      grade,
      notes,
      teacher_id
    } = scoreData;

    try {
      const result = await pool.query(`
        INSERT INTO scores (
          student_id, test_id, listening_score, speaking_score, 
          reading_score, writing_score, total_score, grade, notes, teacher_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        student_id, test_id, listening_score, speaking_score,
        reading_score, writing_score, total_score, grade, notes, teacher_id
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
    const {
      student_id,
      test_id,
      listening_score,
      speaking_score,
      reading_score,
      writing_score,
      total_score,
      grade,
      notes,
      teacher_id
    } = scoreData;

    try {
      const result = await pool.query(`
        UPDATE scores 
        SET student_id = $1, test_id = $2, listening_score = $3, speaking_score = $4,
            reading_score = $5, writing_score = $6, total_score = $7, grade = $8,
            notes = $9, teacher_id = $10, updated_date = CURRENT_TIMESTAMP
        WHERE score_id = $11
        RETURNING *
      `, [
        student_id, test_id, listening_score, speaking_score,
        reading_score, writing_score, total_score, grade, notes, teacher_id, id
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
          t.test_name,
          te.full_name as teacher_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        JOIN teachers te ON s.teacher_id = te.teacher_id
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
          t.test_name,
          te.full_name as teacher_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        JOIN teachers te ON s.teacher_id = te.teacher_id
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
          t.test_name,
          te.full_name as teacher_name
        FROM scores s
        JOIN students st ON s.student_id = st.student_id
        JOIN tests t ON s.test_id = t.test_id
        JOIN teachers te ON s.teacher_id = te.teacher_id
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