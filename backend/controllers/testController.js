const Test = require('../model/Test');

const testController = {
  // GET /api/tests
  async getAllTests(req, res) {
    try {
      const tests = await Test.findAll();
      res.json(tests);
    } catch (error) {
      console.error('Error in getAllTests:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/tests/:id
  async getTestById(req, res) {
    try {
      const { id } = req.params;
      const test = await Test.findById(id);
      
      if (!test) {
        return res.status(404).json({ error: 'Test not found' });
      }
      
      res.json(test);
    } catch (error) {
      console.error('Error in getTestById:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/tests
  async createTest(req, res) {
    try {
      const testData = req.body;
      
      // Validation
      if (!testData.test_name || !testData.test_date) {
        return res.status(400).json({ 
          error: 'Test name and test date are required' 
        });
      }

      const newTest = await Test.create(testData);
      res.status(201).json(newTest);
    } catch (error) {
      console.error('Error in createTest:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/tests/:id
  async updateTest(req, res) {
    try {
      const { id } = req.params;
      const testData = req.body;
      
      // Check if test exists
      const existingTest = await Test.findById(id);
      if (!existingTest) {
        return res.status(404).json({ error: 'Test not found' });
      }

      const updatedTest = await Test.update(id, testData);
      res.json(updatedTest);
    } catch (error) {
      console.error('Error in updateTest:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/tests/:id
  async deleteTest(req, res) {
    try {
      const { id } = req.params;
      
      const deletedTest = await Test.delete(id);
      if (!deletedTest) {
        return res.status(404).json({ error: 'Test not found' });
      }
      
      res.json({ message: 'Test deleted successfully', test: deletedTest });
    } catch (error) {
      console.error('Error in deleteTest:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/tests/search?q=searchTerm
  async searchTests(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: 'Search term is required' });
      }
      
      const tests = await Test.search(q);
      res.json(tests);
    } catch (error) {
      console.error('Error in searchTests:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = testController;