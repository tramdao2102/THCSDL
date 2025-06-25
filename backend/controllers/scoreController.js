const Score = require('../model/Score');

const scoreController = {
  // GET /api/scores
  async getAllScores(req, res) {
    try {
      const scores = await Score.findAll();
      res.json(scores);
    } catch (error) {
      console.error('Error in getAllScores:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/scores/:id
  async getScoreById(req, res) {
    try {
      const { id } = req.params;
      const score = await Score.findById(id);
      
      if (!score) {
        return res.status(404).json({ error: 'Score not found' });
      }
      
      res.json(score);
    } catch (error) {
      console.error('Error in getScoreById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/scores
  async createScore(req, res) {
    try {
      const scoreData = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (
        typeof scoreData.student_id !== 'number' ||
        typeof scoreData.test_id !== 'number'
      ) {
        return res.status(400).json({ error: 'IDs must be numbers' });
      }

      // Validation
      if (!scoreData.student_id || !scoreData.test_id) {
        return res.status(400).json({ 
          error: 'Student ID and Test ID are required' 
        });
      }

      // Validate score ranges
      const scores = [
        scoreData.listening_score,
        scoreData.speaking_score,
        scoreData.reading_score,
        scoreData.writing_score
      ];

      for (let score of scores) {
        if (score < 0 || score > 10) {
          return res.status(400).json({ 
            error: 'All scores must be between 0 and 10' 
          });
        }
      }

      const newScore = await Score.create(scoreData);
      res.status(201).json(newScore);
    } catch (error) {
      console.error('Error in createScore:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // PUT /api/scores/:id
  async updateScore(req, res) {
    try {
      const { id } = req.params;
      const scoreData = req.body;
      
      // Check if score exists
      const existingScore = await Score.findById(id);
      if (!existingScore) {
        return res.status(404).json({ error: 'Score not found' });
      }

      // Validate score ranges
      const scores = [
        scoreData.listening_score,
        scoreData.speaking_score,
        scoreData.reading_score,
        scoreData.writing_score
      ];

      for (let score of scores) {
        if (score < 0 || score > 10) {
          return res.status(400).json({ 
            error: 'All scores must be between 0 and 10' 
          });
        }
      }

      const updatedScore = await Score.update(id, scoreData);
      res.json(updatedScore);
    } catch (error) {
      console.error('Error in updateScore:', error);
      if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: error.message });
      }
    }
  },

  // DELETE /api/scores/:id
  async deleteScore(req, res) {
    try {
      const { id } = req.params;
      
      const deletedScore = await Score.delete(id);
      if (!deletedScore) {
        return res.status(404).json({ error: 'Score not found' });
      }
      
      res.json({ message: 'Score deleted successfully', score: deletedScore });
    } catch (error) {
      console.error('Error in deleteScore:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/scores/student/:studentId
  async getScoresByStudent(req, res) {
    try {
      const { studentId } = req.params;
      const scores = await Score.findByStudent(studentId);
      res.json(scores);
    } catch (error) {
      console.error('Error in getScoresByStudent:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/scores/test/:testId
  async getScoresByTest(req, res) {
    try {
      const { testId } = req.params;
      const scores = await Score.findByTest(testId);
      res.json(scores);
    } catch (error) {
      console.error('Error in getScoresByTest:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/scores/search?q=searchTerm
  async searchScores(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const scores = await Score.search(q);
      res.json(scores);
    } catch (error) {
      console.error('Error in searchScores:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/scores/statistics
  async getScoreStatistics(req, res) {
    try {
      const pool = require('../utils/database');
      
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_scores,
          AVG(total_score) as average_score,
          MAX(total_score) as highest_score,
          MIN(total_score) as lowest_score,
          COUNT(CASE WHEN grade = 'Expert' THEN 1 END) as expert_count,
          COUNT(CASE WHEN grade = 'Very Good' THEN 1 END) as very_good_count,
          COUNT(CASE WHEN grade = 'Good' THEN 1 END) as good_count,
          COUNT(CASE WHEN grade = 'Competent' THEN 1 END) as competent_count,
          COUNT(CASE WHEN grade = 'Modest' THEN 1 END) as modest_count,
          COUNT(CASE WHEN grade = 'Limited' THEN 1 END) as limited_count,
          COUNT(CASE WHEN grade = 'Extremely Limited' THEN 1 END) as extremely_limited_count
        FROM scores
      `);
      
      res.json(stats.rows[0]);
    } catch (error) {
      console.error('Error in getScoreStatistics:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = scoreController;