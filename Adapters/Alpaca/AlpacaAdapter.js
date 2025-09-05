const BrokerAdapter = require('../base/BrokerAdapter');
const { BrokerApiError, AuthenticationError } = require('../../utils/errors');
const logger = require('../../utils/logger');
const { ALPACA_BASE_URL } = require('../../utils/constants');

class AlpacaAdapter extends BrokerAdapter {
  constructor() {
    super('alpaca');
    this.baseURL = ALPACA_BASE_URL;
  }

  async authenticate(credentials) {
    const { apiKey, secretKey } = credentials;
    
    if (!apiKey || !secretKey) {
      throw new AuthenticationError('API Key and Secret Key are required');
    }

    try {
      const response = await fetch(`${this.baseURL}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid Alpaca credentials');
        }
        throw new BrokerApiError('alpaca', `Authentication failed: ${response.status}`);
      }

      const accountData = await response.json();
      logger.info(`Successfully authenticated with Alpaca. Account: ${accountData.id}`);
      
      return { 
        apiKey, 
        secretKey, 
        accountId: accountData.id,
        expiresAt: null // Alpaca API keys don't expire
      };
    } catch (error) {
      logger.error(`Alpaca authentication failed: ${error.message}`);
      throw error;
    }
  }

  async fetchTrades(credentials, options = {}) {
    const { apiKey, secretKey } = credentials;
    
    try {
      const params = new URLSearchParams({
        status: 'filled',
        limit: options.limit || '100',
        direction: 'desc'
      });

      if (options.after) params.append('after', options.after);
      if (options.until) params.append('until', options.until);

      const url = `${this.baseURL}/v2/orders?${params}`;
      
      const response = await fetch(url, {
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new AuthenticationError('Invalid or expired Alpaca credentials');
        }
        if (response.status === 429) {
          throw new BrokerApiError('alpaca', 'Rate limit exceeded');
        }
        throw new BrokerApiError('alpaca', `Failed to fetch trades: ${response.status}`);
      }

      const rawData = await response.json();
      logger.info(`Fetched ${rawData.length} trades from Alpaca`);
      
      return this.normalize(rawData);
    } catch (error) {
      logger.error(`Error fetching Alpaca trades: ${error.message}`);
      throw error;
    }
  }

  normalize(alpacaOrders) {
    if (!Array.isArray(alpacaOrders)) {
      logger.warn('Expected array of orders from Alpaca');
      return [];
    }

    return alpacaOrders
      .filter(order => order.status === 'filled')
      .map(order => ({
        tradeId: order.id,
        symbol: order.symbol,
        quantity: parseInt(order.qty || '0'),
        price: parseFloat(order.filled_avg_price || '0'),
        side: order.side.toLowerCase(),
        timestamp: order.filled_at || order.created_at,
        orderType: order.order_type,
        exchange: 'ALPACA',
        brokerTradeId: order.id,
        broker: this.brokerName
      }))
      .filter(trade => trade.quantity > 0 && trade.price > 0);
  }
}

module.exports = AlpacaAdapter;