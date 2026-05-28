const { Notification } = require("../models");
const CrudRepository = require("./crud.repository");

class NotificationRepository extends CrudRepository {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId) {
    return await Notification.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
  }

  async findExistingReminder(userId, bookingId) {
    return await Notification.findOne({
      where: {
        userId,
        bookingId,
        type: "DEPARTURE_REMINDER",
        status: "SENT",
      },
    });
  }
}

module.exports = NotificationRepository;