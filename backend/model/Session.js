const pool = require('../utils/database');

class Session {
  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          s.session_id,
          s.class_id,
          c.class_name,
          s.session_date,
          s.session_time,
          s.duration_minutes,
          s.topic,
          s.description,
          s.teacher_id,
          t.full_name as teacher_name,
          s.status,
          s.created_date,
          s.updated_date
        FROM sessions s
        JOIN classes c ON s.class_id = c.class_id
        JOIN teachers t ON s.teacher_id = t.teacher_id
        ORDER BY s.session_date DESC, s.session_time DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sessions: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          s.session_id,
          s.class_id,
          c.class_name,
          s.session_date,
          s.session_time,
          s.duration_minutes,
          s.topic,
          s.description,
          s.teacher_id,
          t.full_name as teacher_name,
          s.status,
          s.created_date,
          s.updated_date
        FROM sessions s
        JOIN classes c ON s.class_id = c.class_id
        JOIN teachers t ON s.teacher_id = t.teacher_id
        WHERE s.session_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching session: ${error.message}`);
    }
  }

  static async create(sessionData) {
    const {
      class_id,
      session_date,
      session_time,
      duration_minutes,
      topic,
      description,
      teacher_id,
      status
    } = sessionData;

    try {
      const result = await pool.query(`
        INSERT INTO sessions (class_id, session_date, session_time, duration_minutes, topic, description, teacher_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [class_id, session_date, session_time, duration_minutes, topic, description, teacher_id, status || 'SCHEDULED']);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating session: ${error.message}`);
    }
  }

  static async update(id, sessionData) {
    const {
      class_id,
      session_date,
      session_time,
      duration_minutes,
      topic,
      description,
      teacher_id,
      status
    } = sessionData;

    try {
      const result = await pool.query(`
        UPDATE sessions 
        SET class_id = $1, session_date = $2, session_time = $3, duration_minutes = $4,
            topic = $5, description = $6, teacher_id = $7, status = $8, updated_date = CURRENT_TIMESTAMP
        WHERE session_id = $9
        RETURNING *
      `, [class_id, session_date, session_time, duration_minutes, topic, description, teacher_id, status, id]);
      
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating session: ${error.message}`);
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM sessions WHERE session_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting session: ${error.message}`);
    }
  }

  static async findByClass(classId) {
    try {
      const result = await pool.query(`
        SELECT 
          s.session_id,
          s.class_id,
          c.class_name,
          s.session_date,
          s.session_time,
          s.duration_minutes,
          s.topic,
          s.description,
          s.teacher_id,
          t.full_name as teacher_name,
          s.status
        FROM sessions s
        JOIN classes c ON s.class_id = c.class_id
        JOIN teachers t ON s.teacher_id = t.teacher_id
        WHERE s.class_id = $1
        ORDER BY s.session_date DESC, s.session_time DESC
      `, [classId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sessions by class: ${error.message}`);
    }
  }
}

module.exports = Session;