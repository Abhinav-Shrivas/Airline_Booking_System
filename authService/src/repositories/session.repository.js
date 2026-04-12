const { Session } = require("../models/index");
const { Op } = require("sequelize");

class SessionRepository {
  async create(data) {
    const response = await Session.create(data);
    return response;
  }

  async fetchByToken(tokenHash) {
    const response = await Session.findOne({ where: { tokenHash } });
    return response;
  }

  async findAllSessions(userId) {
    const response = await Session.findAll({
      where: { userId },
      order: [["createdAt", "ASC"]],
    });
    return response;
  }

  async update(id, data) {
    await Session.update(data, {
      where: {
        id: id,
      },
    });
    return true;
  }

  async deleteOtherSessions(userId, currentSessionId) {
    return await Session.destroy({
      where: {
        userId,
        id: { [Op.ne]: currentSessionId }, // Op.ne = "not equal"
      },
    });
  }

  async deleteByTokenHash(tokenHash) {
    return await Session.destroy({
      where: { tokenHash },
    });
  }

  async deleteByUserId(userId) {
    return await Session.destroy({
      where: { userId },
    });
  }

  async destroy(id) {
    await Session.destroy({ where: { id } });
    return true;
  }
}

module.exports = SessionRepository;
