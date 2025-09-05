/**
 * Abstract base class for all broker adapters
 * Defines the contract that all broker implementations must follow
 */
class BrokerAdapter {
  constructor(brokerName) {
    this.brokerName = brokerName;
  }

  /**
   * Authenticate with the broker
   * @param {Object} credentials - Broker-specific credentials
   * @returns {Promise<Object>} - Authentication result
   */
  async authenticate(credentials) {
    throw new Error('authenticate() must be implemented by subclass');
  }

  /**
   * Fetch trades from the broker
   * @param {Object} credentials - Valid credentials
   * @param {Object} options - Query options (dates, limits, etc.)
   * @returns {Promise<Array>} - Array of normalized trades
   */
  async fetchTrades(credentials, options = {}) {
    throw new Error('fetchTrades() must be implemented by subclass');
  }

  /**
   * Normalize broker-specific data to standard format
   * @param {Array} rawData - Raw data from broker
   * @returns {Array} - Normalized trades
   */
  normalize(rawData) {
    throw new Error('normalize() must be implemented by subclass');
  }

  /**
   * Refresh authentication token if needed
   * @param {Object} credentials - Current credentials
   * @returns {Promise<Object>} - Refreshed credentials
   */
  async refreshToken(credentials) {
    // Default implementation - some brokers may not need token refresh
    return credentials;
  }
}

module.exports = BrokerAdapter;