const express = require('express');
const SyncService = require('../../services/SyncService');
const logger = require('../../utils/logger');

const router = express.Router();
const syncService = new SyncService();

// POST /api/sync/setup-credentials
router.post('/setup-credentials', async (req, res) => {
  try {
    const { userId, brokerName, credentials } = req.body;

    if (!userId || !brokerName || !credentials) {
      return res.status(400).json({
        success: false,
        error: 'userId, brokerName, and credentials are required'
      });
    }

    await syncService.setupUserCredentials(userId, brokerName, credentials);

    res.json({
      success: true,
      message: `Credentials setup successfully for ${brokerName}`
    });
  } catch (error) {
    logger.error(`Setup credentials failed: ${error.message}`);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/sync/trades
router.post('/trades', async (req, res) => {
  try {
    const { userId, brokerName, options = {} } = req.body;

    if (!userId || !brokerName) {
      return res.status(400).json({
        success: false,
        error: 'userId and brokerName are required'
      });
    }

    const result = await syncService.syncTrades(userId, brokerName, options);
    
    res.json(result);
  } catch (error) {
    logger.error(`Sync trades failed: ${error.message}`);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/sync/brokers
router.get('/brokers', (req, res) => {
  res.json({
    success: true,
    brokers: syncService.getSupportedBrokers()
  });
});

module.exports = router;