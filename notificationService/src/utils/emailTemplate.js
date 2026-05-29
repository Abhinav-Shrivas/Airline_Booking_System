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

    "register.successful": () => ({
      subject: "🎉 Welcome to SkyBooker!",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background: #2563eb; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Welcome to SkyBooker ✈️</h1>
      </div>

      <div style="padding: 30px;">
        <h2>Hello ${data.user.name},</h2>

        <p>
          We're excited to have you on board! Your account has been successfully
          created and you're now ready to explore, book, and manage your flights with ease.
        </p>

        <p>
          With SkyBooker, you can:
        </p>

        <ul>
          <li>✈️ Search and book flights effortlessly</li>
          <li>📅 Manage your upcoming trips</li>
          <li>💳 Securely handle bookings and payments</li>
          <li>🔔 Receive timely travel updates and notifications</li>
        </ul>

        <p>
          Your next journey is just a few clicks away.
        </p>

        <p>
          Thank you for choosing <strong>SkyBooker</strong>. We look forward to helping you travel smarter and easier.
        </p>

        <p>
          Safe travels,<br />
          <strong>The SkyBooker Team</strong>
        </p>
      </div>

      <div style="background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280;">
        © ${new Date().getFullYear()} SkyBooker. All rights reserved.
      </div>
    </div>
  `,
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
    return {
      subject: "Notification from SkyBooker",
      html: `<p>Event: ${eventType}</p>`,
    };
  }
  return templateFn();
}

module.exports = { build };
