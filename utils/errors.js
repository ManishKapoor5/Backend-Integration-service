class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class BrokerApiError extends Error {
  constructor(brokerName, message) {
    super(`${brokerName.toUpperCase()} API Error: ${message}`);
    this.name = 'BrokerApiError';
    this.brokerName = brokerName;
    this.statusCode = 500;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

module.exports = {
  AuthenticationError,
  BrokerApiError,
  ValidationError
};