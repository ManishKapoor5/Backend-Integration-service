/**
 * Standardized Trade object
 * This is the unified format all brokers normalize to
 */
class Trade {
  constructor({
    tradeId,
    symbol,
    quantity,
    price,
    side,
    timestamp,
    orderType = 'market',
    exchange = 'UNKNOWN',
    brokerTradeId,
    broker,
    fees = 0
  }) {
    this.tradeId = tradeId;
    this.symbol = symbol.toUpperCase();
    this.quantity = Math.abs(quantity);
    this.price = parseFloat(price);
    this.side = side.toLowerCase(); // 'buy' or 'sell'
    this.timestamp = timestamp;
    this.orderType = orderType;
    this.exchange = exchange;
    this.brokerTradeId = brokerTradeId;
    this.broker = broker;
    this.fees = fees;
    this.value = this.quantity * this.price;
  }

  static validate(tradeData) {
    const required = ['tradeId', 'symbol', 'quantity', 'price', 'side', 'timestamp'];
    
    for (const field of required) {
      if (!tradeData[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    if (!['buy', 'sell'].includes(tradeData.side.toLowerCase())) {
      throw new Error('Side must be "buy" or "sell"');
    }

    if (tradeData.quantity <= 0 || tradeData.price <= 0) {
      throw new Error('Quantity and price must be positive numbers');
    }

    return true;
  }

  toJSON() {
    return {
      tradeId: this.tradeId,
      symbol: this.symbol,
      quantity: this.quantity,
      price: this.price,
      side: this.side,
      timestamp: this.timestamp,
      orderType: this.orderType,
      exchange: this.exchange,
      brokerTradeId: this.brokerTradeId,
      broker: this.broker,
      fees: this.fees,
      value: this.value
    };
  }
}

module.exports = Trade;