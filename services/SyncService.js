const AdapterFactory = require('../Adapters/index.js');
const TokenService = require('./Tokenservice');
const logger = require('../utils/logger');
const { BrokerApiError } = require('../utils/errors');

class SyncService {
  constructor() {
    this.tokenService = new TokenService();
  }

  /**
   * Main sync function - orchestrates the entire trade sync process
   * @param {string} userId - User identifier
   * @param {string} brokerName - Broker name (e.g., 'alpaca')
   * @param {Object} options - Sync options (date filters, limits, etc.)
   * @returns {Promise<Array>} - Array of normalized trades
   */
  async syncTrades(userId, brokerName, options = {}) {
    logger.info(`Starting trade sync for user ${userId}, broker ${brokerName}`);
    
    try {
      // Step 1: Get the appropriate adapter
      const adapter = AdapterFactory.getAdapter(brokerName);
      
      // Step 2: Get or refresh user's token
      const credentials = await this.tokenService.getToken(userId, brokerName);
      const validCredentials = await this.tokenService.refreshToken(userId, brokerName, adapter);
      
      // Step 3: Fetch trades using the adapter
      const trades = await adapter.fetchTrades(validCredentials, {
        after: options.fromDate,
        until: options.toDate,
        limit: options.limit || '100'
      });

      logger.info(`Successfully synced ${trades.length} trades for user ${userId}`);
      
      // Step 4: Return normalized trades
      return {
        success: true,
        trades: trades,
        count: trades.length,
        broker: brokerName,
        syncedAt: new Date().toISOString()
      };

    } catch (error) {
      logger.error(`Trade sync failed for user ${userId}: ${error.message}`);
      
      return {
        success: false,
        error: error.message,
        trades: [],
        count: 0,
        broker: brokerName,
        syncedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Setup user credentials for a broker
   * @param {string} userId - User identifier  
   * @param {string} brokerName - Broker name
   * @param {Object} credentials - Broker credentials
   * @returns {Promise<boolean>} - Success status
   */
  async setupUserCredentials(userId, brokerName, credentials) {
    try {
      const adapter = AdapterFactory.getAdapter(brokerName);
      
      // Authenticate with broker to validate credentials
      const validatedCredentials = await adapter.authenticate(credentials);
      
      // Store credentials for future use
      await this.tokenService.storeToken(userId, brokerName, validatedCredentials);
      
      logger.info(`Successfully setup credentials for user ${userId}, broker ${brokerName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to setup credentials: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get supported brokers
   * @returns {Array} - List of supported broker names
   */
  getSupportedBrokers() {
    return AdapterFactory.getSupportedBrokers();
  }
}

module.exports = SyncService;