const Session = require('../model/Session');

const sessionController = {
  // GET /api/sessions
  async getAllSessions(req, res) {
    try {
      const sessions = await Session.findAll();
      res.json(sessions);
    } catch (error) {
      console.error('Error in getAllSessions:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/sessions/:id
  async getSessionById(req, res) {
    try {
      const { id } = req.params;
      const session = await Session.findById(id);
      
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json(session);
    } catch (error) {
      console.error('Error in getSessionById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/sessions
  async createSession(req, res) {
    try {
      const sessionData = req.body;
      
      // Validation
      const requiredFields = ['class_id', 'session_date', 'session_time', 'topic'];
      for (const field of requiredFields) {
        if (!sessionData[field]) {
          return res.status(400).json({ error: `${field} is required` });
        }
      }

      const newSession = await Session.create(sessionData);
      res.status(201).json(newSession);
    } catch (error) {
      console.error('Error in createSession:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/sessions/:id
  async updateSession(req, res) {
    try {
      const { id } = req.params;
      const sessionData = req.body;
      
      // Check if session exists
      const existingSession = await Session.findById(id);
      if (!existingSession) {
        return res.status(404).json({ error: 'Session not found' });
      }

      const updatedSession = await Session.update(id, sessionData);
      res.json(updatedSession);
    } catch (error) {
      console.error('Error in updateSession:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/sessions/:id
  async deleteSession(req, res) {
    try {
      const { id } = req.params;
      
      const deletedSession = await Session.delete(id);
      if (!deletedSession) {
        return res.status(404).json({ error: 'Session not found' });
      }
      
      res.json({ message: 'Session deleted successfully', session: deletedSession });
    } catch (error) {
      console.error('Error in deleteSession:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/sessions/class/:classId
  async getSessionsByClass(req, res) {
    try {
      const { classId } = req.params;
      
      if (!classId) {
        return res.status(400).json({ error: 'Class ID is required' });
      }
      
      const sessions = await Session.findByClass(classId);
      res.json(sessions);
    } catch (error) {
      console.error('Error in getSessionsByClass:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/sessions/search?q=searchTerm
  async searchSessions(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const sessions = await Session.search(q);
      res.json(sessions);
    } catch (error) {
      console.error('Error in searchSessions:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = sessionController;