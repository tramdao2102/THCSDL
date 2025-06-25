const pool = require('../utils/database');

class Attendance {
  static async findBySession(sessionId) {
    try {
      const result = await pool.query(`
        SELECT 
          a.attendance_id,
          a.session_id,
          a.student_id,
          s.full_name as student_name,
          a.attendance_status,
          a.notes,
          a.created_date,
          a.updated_date
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.session_id = $1
        ORDER BY s.full_name
      `, [sessionId]);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching attendance records: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const result = await pool.query(`
        SELECT 
          a.attendance_id,
          a.session_id,
          a.student_id,
          s.full_name as student_name,
          a.attendance_status,
          a.notes,
          a.created_date,
          a.updated_date
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        WHERE a.attendance_id = $1
      `, [id]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching attendance record: ${error.message}`);
    }
  }

  static async createOrUpdate(attendanceData) {
    const {
      session_id,
      student_id,
      attendance_status,
      notes
    } = attendanceData;

    try {
      // Check if record exists
      const existingRecord = await pool.query(
        'SELECT attendance_id FROM attendance WHERE session_id = $1 AND student_id = $2',
        [session_id, student_id]
      );

      if (existingRecord.rows.length > 0) {
        // Update existing record
        const result = await pool.query(`
          UPDATE attendance 
          SET attendance_status = $1, notes = $2, updated_date = CURRENT_TIMESTAMP
          WHERE session_id = $3 AND student_id = $4
          RETURNING *
        `, [attendance_status, notes, session_id, student_id]);
        return result.rows[0];
      } else {
        // Create new record
        const result = await pool.query(`
          INSERT INTO attendance (session_id, student_id, attendance_status, notes)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `, [session_id, student_id, attendance_status, notes]);
        return result.rows[0];
      }
    } catch (error) {
      throw new Error(`Error saving attendance record: ${error.message}`);
    }
  }

  static async bulkCreateOrUpdate(attendanceDataArray) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      for (const attendanceData of attendanceDataArray) {
        const {
          session_id,
          student_id,
          attendance_status,
          notes
        } = attendanceData;

        // Check if record exists
        const existingRecord = await client.query(
          'SELECT attendance_id FROM attendance WHERE session_id = $1 AND student_id = $2',
          [session_id, student_id]
        );

        let result;
        if (existingRecord.rows.length > 0) {
          // Update existing record
          result = await client.query(`
            UPDATE attendance 
            SET attendance_status = $1, notes = $2, updated_date = CURRENT_TIMESTAMP
            WHERE session_id = $3 AND student_id = $4
            RETURNING *
          `, [attendance_status, notes, session_id, student_id]);
        } else {
          // Create new record
          result = await client.query(`
            INSERT INTO attendance (session_id, student_id, attendance_status, notes)
            VALUES ($1, $2, $3, $4)
            RETURNING *
          `, [session_id, student_id, attendance_status, notes]);
        }
        results.push(result.rows[0]);
      }
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Error bulk saving attendance records: ${error.message}`);
    } finally {
      client.release();
    }
  }

  static async delete(id) {
    try {
      const result = await pool.query(
        'DELETE FROM attendance WHERE attendance_id = $1 RETURNING *',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error deleting attendance record: ${error.message}`);
    }
  }

  static async getAttendanceSummary() {
    try {
      const result = await pool.query(`
        SELECT 
          student_id,
          student_name,
          class_id,
          class_name,
          total_sessions,
          present_count,
          absent_count,
          late_count,
          excused_count,
          attendance_rate
        FROM attendance_summary
        ORDER BY attendance_rate DESC, student_name
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching attendance summary: ${error.message}`);
    }
  }

  static async getAttendanceSummaryByStudentAndClass(studentId, classId) {
    try {
      const result = await pool.query(`
        SELECT 
          student_id,
          student_name,
          class_id,
          class_name,
          total_sessions,
          present_count,
          absent_count,
          late_count,
          excused_count,
          attendance_rate
        FROM attendance_summary
        WHERE student_id = $1 AND class_id = $2
      `, [studentId, classId]);
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error fetching attendance summary: ${error.message}`);
    }
  }

  static async updateAttendanceSummary(studentId, classId) {
    try {
      // Calculate attendance statistics
      const statsResult = await pool.query(`
        SELECT 
          COUNT(*) as total_sessions,
          COUNT(CASE WHEN a.attendance_status = 'PRESENT' THEN 1 END) as present_count,
          COUNT(CASE WHEN a.attendance_status = 'ABSENT' THEN 1 END) as absent_count,
          COUNT(CASE WHEN a.attendance_status = 'LATE' THEN 1 END) as late_count,
          COUNT(CASE WHEN a.attendance_status = 'EXCUSED' THEN 1 END) as excused_count
        FROM attendance a
        JOIN sessions ses ON a.session_id = ses.session_id
        WHERE a.student_id = $1 AND ses.class_id = $2
      `, [studentId, classId]);

      const stats = statsResult.rows[0];
      const attendanceRate = stats.total_sessions > 0 
        ? ((parseInt(stats.present_count) + parseInt(stats.late_count)) / parseInt(stats.total_sessions) * 100).toFixed(2)
        : 0;

      // Update or insert summary
      const result = await pool.query(`
        INSERT INTO attendance_summary (student_id, class_id, total_sessions, present_count, absent_count, late_count, excused_count, attendance_rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (student_id, class_id) 
        DO UPDATE SET 
          total_sessions = EXCLUDED.total_sessions,
          present_count = EXCLUDED.present_count,
          absent_count = EXCLUDED.absent_count,
          late_count = EXCLUDED.late_count,
          excused_count = EXCLUDED.excused_count,
          attendance_rate = EXCLUDED.attendance_rate,
          last_updated = CURRENT_TIMESTAMP
        RETURNING *
      `, [studentId, classId, stats.total_sessions, stats.present_count, stats.absent_count, stats.late_count, stats.excused_count, attendanceRate]);

      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating attendance summary: ${error.message}`);
    }
  }

  static async findAll() {
    try {
      const result = await pool.query(`
        SELECT 
          a.attendance_id,
          a.session_id,
          a.student_id,
          s.full_name as student_name,
          a.attendance_status,
          a.notes,
          a.created_date,
          a.updated_date
        FROM attendance a
        JOIN students s ON a.student_id = s.student_id
        ORDER BY a.created_date DESC
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching all attendance records: ${error.message}`);
    }
  }
}

module.exports = Attendance;