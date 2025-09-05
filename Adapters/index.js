const AlpacaAdapter = require('./Alpaca/AlpacaAdapter');

class AdapterFactory {
  static getAdapter(brokerName) {
    switch (brokerName.toLowerCase()) {
      case 'alpaca':
        return new AlpacaAdapter();

      
      default:
        throw new Error(`Unsupported broker: ${brokerName}`);
    }
  }

  static getSupportedBrokers() {
    return ['alpaca'];
  }
}

module.exports = AdapterFactory;