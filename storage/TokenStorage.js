/**
 * Simple in-memory token storage
 * In production, this would be replaced with Redis or database storage
 */
class TokenStorage {
  constructor() {
    this.tokens = new Map();
  }

  set(key, value) {
    this.tokens.set(key, {
      ...value,
      storedAt: new Date().toISOString()
    });
  }

  get(key) {
    return this.tokens.get(key);
  }

  delete(key) {
    return this.tokens.delete(key);
  }

  has(key) {
    return this.tokens.has(key);
  }

  clear() {
    this.tokens.clear();
  }

  size() {
    return this.tokens.size;
  }

  // Utility method to get all tokens for debugging
  getAllTokens() {
    const result = {};
    for (const [key, value] of this.tokens.entries()) {
      result[key] = {
        ...value,
        // Don't expose sensitive data in logs
        apiKey: value.apiKey ? '***' : undefined,
        secretKey: value.secretKey ? '***' : undefined
      };
    }
    return result;
  }
}

module.exports = TokenStorage;