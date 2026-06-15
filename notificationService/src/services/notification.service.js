const { logger, AppError } = require("shared");
const NotificationRepository = require("../repositories/notification.repository");
const authClient = require("../utils/authClient.js");
const flightClient = require("../utils/flightClient.js");
const emailService = require("./email.service");
const emailTemplates = require("../utils/emailTemplate.js");

const notificationRepository = new NotificationRepository();

class NotificationService {
  async handleEvent(eventType, payload) {
    let recipientEmail = "unknown@example.com";
    let emailSubject = "Failed before rendering";
    
    try {
      // 1. Fetch user email from AuthService
      const user = await authClient.getUserById(payload.userId);
      if (!user || !user.email) {
        throw new AppError(`User ${payload.userId} not found or has no email`, 500);
      }
      recipientEmail = user.email;

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
      emailSubject = subject;

      // 4. Create notification record (PENDING)
      const notificationData = {
        userId: payload.userId,
        type: this._mapEventToType(eventType),
        recipientEmail,
        subject: emailSubject,
        status: "PENDING",
      };
      if (eventType !== "register.successful") {
        notificationData.bookingId = payload.bookingId;
      }
      const notification = await notificationRepository.create(notificationData);

      // 5. Send email
      try {
        await emailService.send(recipientEmail, emailSubject, html);
        notification.status = "SENT";
        notification.sentAt = new Date();
        const bookingLog = eventType !== "register.successful" ? ` for booking #${payload.bookingId}` : "";
        logger.info(`Sent ${eventType} email to ${recipientEmail}${bookingLog}`);
      } catch (emailError) {
        notification.status = "FAILED";
        notification.failReason = emailError.message;
        logger.error(
          `Failed to send ${eventType} email to ${recipientEmail}: ${emailError.message}`,
        );
      }

      await notification.save();
      return notification;
    } catch (error) {
      logger.error(`Failed to handle event ${eventType}: ${error.message}`);
      try {
        const failedNotificationData = {
          userId: payload.userId,
          type: this._mapEventToType(eventType),
          recipientEmail,
          subject: emailSubject,
          status: "FAILED",
          failReason: error.message,
        };
        if (eventType !== "register.successful") {
          failedNotificationData.bookingId = payload.bookingId;
        }
        await notificationRepository.create(failedNotificationData);
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

  async getNotificationsByUser(userId, roles = []) {
    const isAdmin = roles.includes("ADMIN");
    // Regular users only see SENT notifications; admins see all
    const filters = isAdmin ? {} : { status: "SENT" };
    return await notificationRepository.findByUserId(userId, filters);
  }

  _mapEventToType(routingKey) {
    const map = {
      "booking.confirmed": "BOOKING_CONFIRMED",
      "booking.cancelled": "BOOKING_CANCELLED",
      "booking.cancelled_no_refund": "BOOKING_CANCELLED_NO_REFUND",
      "booking.refunded": "BOOKING_REFUNDED",
      "booking.expired": "BOOKING_EXPIRED",
      "payment.failed": "PAYMENT_FAILED",
      "departure.reminder": "DEPARTURE_REMINDER",
      "register.successful": "REGISTER_SUCCESFUL",
    };
    return map[routingKey] || routingKey;
  }
}

module.exports = new NotificationService();
