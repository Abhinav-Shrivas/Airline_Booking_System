const { v4: uuidv4 } = require("uuid");

/**
 * Simulates a payment gateway.
 * - Always succeeds after a short delay
 * - Returns a mock transactionId
 * - Set SUCCESS_RATE < 1 to simulate random failures for testing
 */
const SUCCESS_RATE = 1.0; // 1.0 = always success, 0.5 = 50% failure
const DELAY_MS = 1500; // Simulate network latency

const processPayment = async (amount) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  const isSuccess = Math.random() < SUCCESS_RATE;

  if (isSuccess) {
    return {
      success: true,
      transactionId: `MOCK_TXN_${uuidv4()}`,
      message: "Payment processed successfully",
    };
  }

  return {
    success: false,
    transactionId: null,
    message: "Payment declined by provider",
  };
};

const processRefund = async (transactionId) => {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  return {
    success: true,
    refundId: `MOCK_REFUND_${uuidv4()}`,
    message: "Refund processed successfully",
  };
};

module.exports = { processPayment, processRefund };
