const Attendance = require('../model/Attendance');

const attendanceController = {
  // GET /api/attendance
  async getAllAttendance(req, res) {
    try {
      const { session_id } = req.query;
      
      if (session_id) {
        const attendance = await Attendance.findBySession(session_id);
        return res.json(attendance);
      }
      
      const attendance = await Attendance.findAll();
      res.json(attendance);
    } catch (error) {
      console.error('Error in getAllAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/attendance/:id
  async getAttendanceById(req, res) {
    try {
      const { id } = req.params;
      const attendance = await Attendance.findById(id);
      
      if (!attendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      
      res.json(attendance);
    } catch (error) {
      console.error('Error in getAttendanceById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/attendance
  async createAttendance(req, res) {
    try {
      const attendanceData = req.body;
      
      // Validation
      const requiredFields = ['session_id', 'student_id', 'attendance_status'];
      for (const field of requiredFields) {
        if (!attendanceData[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }

      const newAttendance = await Attendance.create(attendanceData);
      
      // Update attendance summary
      await Attendance.updateAttendanceSummary(
        attendanceData.student_id,
        attendanceData.class_id || null
      );
      
      res.status(201).json(newAttendance);
    } catch (error) {
      console.error('Error in createAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/attendance/:id
  async updateAttendance(req, res) {
    try {
      const { id } = req.params;
      const attendanceData = req.body;
      
      // Check if attendance exists
      const existingAttendance = await Attendance.findById(id);
      if (!existingAttendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }

      const updatedAttendance = await Attendance.update(id, attendanceData);
      
      // Update attendance summary
      await Attendance.updateAttendanceSummary(
        updatedAttendance.student_id,
        updatedAttendance.class_id || null
      );
      
      res.json(updatedAttendance);
    } catch (error) {
      console.error('Error in updateAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/attendance/:id
  async deleteAttendance(req, res) {
    try {
      const { id } = req.params;
      
      const deletedAttendance = await Attendance.delete(id);
      if (!deletedAttendance) {
        return res.status(404).json({ error: 'Attendance record not found' });
      }
      
      res.json({ message: 'Attendance record deleted successfully', attendance: deletedAttendance });
    } catch (error) {
      console.error('Error in deleteAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/attendance/session/:sessionId
  async getAttendanceBySession(req, res) {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID is required' });
      }
      
      const attendance = await Attendance.findBySession(sessionId);
      res.json(attendance);
    } catch (error) {
      console.error('Error in getAttendanceBySession:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/attendance/bulk
  async bulkCreateOrUpdateAttendance(req, res) {
    try {
      const attendanceDataArray = req.body;
      
      if (!Array.isArray(attendanceDataArray)) {
        return res.status(400).json({ error: 'Expected an array of attendance records' });
      }
      
      if (attendanceDataArray.length === 0) {
        return res.status(400).json({ error: 'Attendance records array cannot be empty' });
      }
      
      // Validate each record
      for (const record of attendanceDataArray) {
        const requiredFields = ['session_id', 'student_id', 'attendance_status'];
        for (const field of requiredFields) {
          if (!record[field]) {
            return res.status(400).json({ 
              error: `${field} is required in all attendance records`
            });
          }
        }
      }
      
      const savedAttendance = await Attendance.bulkCreateOrUpdate(attendanceDataArray);
      
      // Update attendance summary for all affected students
      const uniqueStudentClassPairs = new Map();
      attendanceDataArray.forEach(record => {
        if (record.class_id) {
          uniqueStudentClassPairs.set(record.student_id, record.class_id);
        }
      });
      
      for (const [studentId, classId] of uniqueStudentClassPairs) {
        await Attendance.updateAttendanceSummary(studentId, classId);
      }
      
      res.json(savedAttendance);
    } catch (error) {
      console.error('Error in bulkCreateOrUpdateAttendance:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/attendance/summary
  async getAttendanceSummary(req, res) {
    try {
      const { student_id, class_id } = req.query;
      
      if (student_id && class_id) {
        const summary = await Attendance.getAttendanceSummaryByStudentAndClass(student_id, class_id);
        return res.json(summary);
      }
      
      const summary = await Attendance.getAttendanceSummary();
      res.json(summary);
    } catch (error) {
      console.error('Error in getAttendanceSummary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/attendance/summary/:studentId/:classId
  async updateAttendanceSummary(req, res) {
    try {
      const { studentId, classId } = req.params;
      
      if (!studentId || !classId) {
        return res.status(400).json({ error: 'Student ID and Class ID are required' });
      }
      
      const summary = await Attendance.updateAttendanceSummary(
        parseInt(studentId),
        parseInt(classId)
      );
      
      res.json(summary);
    } catch (error) {
      console.error('Error in updateAttendanceSummary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/attendance/student/:studentId
  async getAttendanceByStudent(req, res) {
    try {
      const { studentId } = req.params;
      
      if (!studentId) {
        return res.status(400).json({ error: 'Student ID is required' });
      }
      
      const attendance = await Attendance.findByStudent(studentId);
      res.json(attendance);
    } catch (error) {
      console.error('Error in getAttendanceByStudent:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = attendanceController;