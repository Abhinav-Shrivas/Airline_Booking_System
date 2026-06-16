const { Notification } = require("../models");
const CrudRepository = require("./crud.repository");

class NotificationRepository extends CrudRepository {
  constructor() {
    super(Notification);
  }

  async findByUserId(userId, { status } = {}) {
    const where = { userId };
    if (status) {
      where.status = status;
    }
    return await Notification.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });
  }

  async findExistingReminder(userId, bookingId, journeyType) {
    return await Notification.findOne({
      where: {
        userId,
        bookingId,
        journeyType,
        type: "DEPARTURE_REMINDER",
        status: "SENT",
      },
    });
  }
}

module.exports = NotificationRepository;
