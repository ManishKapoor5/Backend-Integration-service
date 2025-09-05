module.exports = {
  ALPACA_BASE_URL: 'https://paper-api.alpaca.markets',
  
  SUPPORTED_BROKERS: ['alpaca'],
  
  DEFAULT_SYNC_OPTIONS: {
    limit: '100',
    direction: 'desc'
  },
  
  ORDER_SIDES: ['buy', 'sell'],
  ORDER_TYPES: ['market', 'limit', 'stop', 'stop_limit'],
  
  TOKEN_EXPIRY_BUFFER: 5 * 60 * 1000 // 5 minutes in milliseconds
};