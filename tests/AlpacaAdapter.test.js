const AlpacaAdapter = require('../src/adapters/alpaca/AlpacaAdapter');

// Mock data for testing
const mockAlpacaResponse = [
  {
    id: 'test-123',
    symbol: 'AAPL',
    qty: '100',
    side: 'buy',
    filled_avg_price: '150.25',
    filled_at: '2024-01-01T10:00:00Z',
    status: 'filled',
    order_type: 'market'
  }
];

describe('AlpacaAdapter', () => {
  let adapter;

  beforeEach(() => {
    adapter = new AlpacaAdapter();
  });

  test('should normalize Alpaca data correctly', () => {
    const result = adapter.normalize(mockAlpacaResponse);
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      symbol: 'AAPL',
      quantity: 100,
      price: 150.25,
      side: 'buy',
      broker: 'alpaca'
    });
  });

  test('should filter out unfilled orders', () => {
    const dataWithUnfilled = [
      ...mockAlpacaResponse,
      { ...mockAlpacaResponse[0], status: 'pending' }
    ];
    
    const result = adapter.normalize(dataWithUnfilled);
    expect(result).toHaveLength(1);
  });

  test('should handle empty response', () => {
    const result = adapter.normalize([]);
    expect(result).toHaveLength(0);
  });
});

// To run: npm test