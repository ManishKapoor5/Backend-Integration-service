const TokenStorage = require('../storage/TokenStorage');
const logger = require('../utils/logger');
const { AuthenticationError } = require('../utils/errors');

class TokenService {
  constructor() {
    this.storage = new TokenStorage();
  }

  async storeToken(userId, brokerName, credentials) {
    try {
      const tokenData = {
        ...credentials,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString()
      };

      this.storage.set(`${userId}:${brokerName}`, tokenData);
      logger.info(`Stored token for user ${userId}, broker ${brokerName}`);
      return true;
    } catch (error) {
      logger.error(`Failed to store token: ${error.message}`);
      throw error;
    }
  }

  async getToken(userId, brokerName) {
    try {
      const key = `${userId}:${brokerName}`;
      const tokenData = this.storage.get(key);
      
      if (!tokenData) {
        throw new AuthenticationError(`No credentials found for user ${userId} and broker ${brokerName}`);
      }

      // Update last used timestamp
      tokenData.lastUsed = new Date().toISOString();
      this.storage.set(key, tokenData);

      return tokenData;
    } catch (error) {
      logger.error(`Failed to get token: ${error.message}`);
      throw error;
    }
  }

  async refreshToken(userId, brokerName, adapter) {
    try {
      const currentToken = await this.getToken(userId, brokerName);
      
      // Check if token needs refresh (broker-specific logic)
      if (this.isTokenValid(currentToken)) {
        return currentToken;
      }

      logger.info(`Refreshing token for user ${userId}, broker ${brokerName}`);
      const refreshedToken = await adapter.refreshToken(currentToken);
      
      await this.storeToken(userId, brokerName, refreshedToken);
      return refreshedToken;
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`);
      throw error;
    }
  }

  isTokenValid(tokenData) {
    if (!tokenData.expiresAt) {
      return true; // Non-expiring tokens (like Alpaca API keys)
    }

    const expiryTime = new Date(tokenData.expiresAt);
    const now = new Date();
    const bufferTime = 5 * 60 * 1000; // 5 minutes buffer

    return expiryTime.getTime() - now.getTime() > bufferTime;
  }

  async removeToken(userId, brokerName) {
    const key = `${userId}:${brokerName}`;
    this.storage.delete(key);
    logger.info(`Removed token for user ${userId}, broker ${brokerName}`);
  }
}

module.exports = TokenService;