const { logger } = require("shared");
const NotificationRepository = require("../repositories/notification.repository");
const authClient = require("../utils/authClient.js");
const flightClient = require("../utils/flightClient.js");
const emailService = require("./email.service");
const emailTemplates = require("../utils/emailTemplate.js");

const notificationRepository = new NotificationRepository();

class NotificationService {
  async handleEvent(eventType, payload) {
    try {
      // 1. Fetch user email from AuthService
      const user = await authClient.getUserById(payload.userId);

      // 2. Fetch flight details (if event has a flightId)
      let flight = null;
      if (payload.flightId) {
        try {
          flight = await flightClient.getFlightById(payload.flightId);
        } catch (e) {
          logger.warn(
            `Could not fetch flight ${payload.flightId}, proceeding without flight details`,
          );
        }
      }

      // 3. Build email content
      const enrichedData = { ...payload, user, flight };
      const { subject, html } = emailTemplates.build(eventType, enrichedData);

      // 4. Create notification record (PENDING)
      const notification = await notificationRepository.create({
        userId: payload.userId,
        bookingId: payload.bookingId,
        type: this._mapEventToType(eventType),
        recipientEmail: user.email,
        subject,
        status: "PENDING",
      });

      // 5. Send email
      try {
        await emailService.send(user.email, subject, html);
        notification.status = "SENT";
        notification.sentAt = new Date();
        logger.info(
          `Sent ${eventType} email to ${user.email} for booking #${payload.bookingId}`,
        );
      } catch (emailError) {
        notification.status = "FAILED";
        notification.failReason = emailError.message;
        logger.error(
          `Failed to send ${eventType} email to ${user.email}: ${emailError.message}`,
        );
      }

      await notification.save();
      return notification;
    } catch (error) {
      logger.error(`Failed to handle event ${eventType}: ${error.message}`);
      try {
        await notificationRepository.create({
          userId: payload.userId,
          bookingId: payload.bookingId,
          type: this._mapEventToType(eventType),
          status: "FAILED",
          failReason: error.message,
        });
      } catch (dbError) {
        logger.error(`Could not even save failure record: ${dbError.message}`);
        // At this point, only logs have the evidence
      }
    }
  }

  async sendDepartureReminders(upcomingBookings) {
    for (const booking of upcomingBookings) {
      const existing = await notificationRepository.findExistingReminder(
        booking.userId,
        booking.bookingId,
      );
      if (existing) continue;

      await this.handleEvent("departure.reminder", {
        bookingId: booking.bookingId,
        userId: booking.userId,
        flightId: booking.flightId,
        noOfSeats: booking.noOfSeats,
      });
    }
  }

  async getNotificationsByUser(userId) {
    return await notificationRepository.findByUserId(userId);
  }

  _mapEventToType(routingKey) {
    const map = {
      "booking.confirmed": "BOOKING_CONFIRMED",
      "booking.cancelled": "BOOKING_CANCELLED",
      "booking.refunded": "BOOKING_REFUNDED",
      "booking.expired": "BOOKING_EXPIRED",
      "payment.failed": "PAYMENT_FAILED",
      "departure.reminder": "DEPARTURE_REMINDER",
    };
    return map[routingKey] || routingKey;
  }
}

module.exports = new NotificationService();
