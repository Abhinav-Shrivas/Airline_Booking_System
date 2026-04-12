const { PaymentRepository } = require("../repositories");
const { AppError } = require("shared");
const bookingService = require("./booking.service");
const mockProvider = require("../utils/mockPaymentProvider");

const paymentRepository = new PaymentRepository();

class PaymentService {
  async initiatePayment(bookingId, userId) {
    // 1. Verify booking exists and belongs to user
    const booking = await bookingService.getBooking(bookingId, userId);

    if (booking.status !== "INITIATED") {
      throw new AppError(
        `Cannot pay for a booking with status: ${booking.status}`,
        400
      );
    }

    // 2. Check if payment already exists
    const existingPayment = await paymentRepository.findByBookingId(bookingId);
    if (existingPayment) {
      throw new AppError("Payment already initiated for this booking", 409);
    }

    // 3. Transition booking to PENDING
    booking.status = "PENDING";
    await booking.save();

    // 4. Create payment record
    const payment = await paymentRepository.create({
      bookingId,
      amount: booking.totalCost,
      status: "PENDING",
      provider: "MOCK",
    });

    // 5. Process payment via mock provider
    const result = await mockProvider.processPayment(booking.totalCost);

    if (result.success) {
      payment.status = "SUCCESS";
      payment.transactionId = result.transactionId;
      payment.paidAt = new Date();
      await payment.save();

      // Confirm the booking
      await bookingService.confirmBooking(bookingId);
    } else {
      payment.status = "FAILED";
      await payment.save();

      // Fail the booking (releases seats)
      await bookingService.failBooking(bookingId);
    }

    return payment;
  }

  async getPaymentByBooking(bookingId, userId) {
    // Verify ownership through booking service
    await bookingService.getBooking(bookingId, userId);

    const payment = await paymentRepository.findByBookingId(bookingId);
    if (!payment) {
      throw new AppError("No payment found for this booking", 404);
    }
    return payment;
  }

  async refundPayment(bookingId, userId) {
    const payment = await this.getPaymentByBooking(bookingId, userId);

    if (payment.status !== "SUCCESS") {
      throw new AppError("Can only refund successful payments", 400);
    }

    const result = await mockProvider.processRefund(payment.transactionId);

    if (result.success) {
      payment.status = "REFUNDED";
      await payment.save();
    }

    return payment;
  }
}

module.exports = new PaymentService();
