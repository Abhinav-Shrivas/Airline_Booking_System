function build(eventType, data) {
  const templates = {
    "booking.confirmed": () => ({
      subject: `Booking #${data.bookingId} Confirmed ✈️`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #22c55e;">Your booking is confirmed!</h2>
          <p>Hi ${data.user.name},</p>
          <table style="border-collapse: collapse; width: 100%;">
            <tr><td><strong>Booking ID</strong></td><td>#${data.bookingId}</td></tr>
            <tr><td><strong>Flight</strong></td><td>${data.flight?.flightNo || data.flightId}</td></tr>
            <tr><td><strong>Departure</strong></td><td>${new Date(data.flight?.departureTime).toLocaleString()}</td></tr>
            <tr><td><strong>Passengers</strong></td><td>${data.noOfSeats}</td></tr>
            <tr><td><strong>Total Paid</strong></td><td>₹${data.totalCost}</td></tr>
          </table>
          <p style="color: #666; margin-top: 20px;">Thank you for booking with SkyBooker!</p>
        </div>
      `,
    }),

    "booking.cancelled": () => ({
      subject: `Booking #${data.bookingId} Cancelled`,
      html: `<div style="font-family: Arial;"><h2 style="color: #ef4444;">Booking Cancelled</h2><p>Hi ${data.user.name}, your booking #${data.bookingId} has been cancelled. ${data.noOfSeats} seat(s) have been released.</p></div>`,
    }),

    "booking.refunded": () => ({
      subject: `Refund for Booking #${data.bookingId} Processed`,
      html: `<div style="font-family: Arial;"><h2 style="color: #3b82f6;">Refund Processed</h2><p>Hi ${data.user.name}, your refund of ₹${data.refundAmount} for booking #${data.bookingId} has been processed. The amount will be credited in 5-7 business days.</p></div>`,
    }),

    "booking.expired": () => ({
      subject: `Booking #${data.bookingId} Expired`,
      html: `<div style="font-family: Arial;"><h2 style="color: #f59e0b;">Booking Expired</h2><p>Hi ${data.user.name}, your booking #${data.bookingId} has expired because payment was not completed within 10 minutes. The reserved seats have been released.</p></div>`,
    }),

    "payment.failed": () => ({
      subject: `Payment Failed for Booking #${data.bookingId}`,
      html: `<div style="font-family: Arial;"><h2 style="color: #ef4444;">Payment Failed</h2><p>Hi ${data.user.name}, your payment of ₹${data.amount} for booking #${data.bookingId} was declined. Please try again with a different payment method.</p></div>`,
    }),

    "departure.reminder": () => ({
      subject: `Reminder: Your flight departs tomorrow ✈️`,
      html: `<div style="font-family: Arial;"><h2 style="color: #8b5cf6;">Flight Reminder</h2><p>Hi ${data.user.name}, this is a reminder that your flight ${data.flight?.flightNo} departs on ${new Date(data.flight?.departureTime).toLocaleString()}.</p><p>Booking #${data.bookingId} — ${data.noOfSeats} passenger(s).</p></div>`,
    }),
  };

  const templateFn = templates[eventType];
  if (!templateFn) {
    return { subject: "Notification from SkyBooker", html: `<p>Event: ${eventType}</p>` };
  }
  return templateFn();
}

module.exports = { build };