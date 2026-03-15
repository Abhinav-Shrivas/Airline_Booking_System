const { Session } = require("../models/index");
const { Op } = require("sequelize");

class SessionRepository {
  async create(data) {
    try {
      const response = await Session.create(data);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetchByToken(tokenHash) {
    try {
      const response = await Session.findOne({ where: { tokenHash } });
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async findAllSessions(userId) {
    try {
      const response = await Session.findAll({
        where: { userId },
        order: [["createdAt", "ASC"]],
      });
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async update(id, data) {
    try {
      await Session.update(data, {
        where: {
          id: id,
        },
      });
      return true;
    } catch (error) {
      console.log("Something went wrong in the repository layer.");
      throw error;
    }
  }

  async deleteOtherSessions(userId, currentSessionId) {
    try {
      return await Session.destroy({
        where: {
          userId,
          id: { [Op.ne]: currentSessionId }, // Op.ne = "not equal"
        },
      });
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async deleteByTokenHash(tokenHash) {
    try {
      return await Session.destroy({
        where: { tokenHash },
      });
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async deleteByUserId(userId) {
    try {
      return await Session.destroy({
        where: { userId },
      });
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async destroy(id) {
    try {
      await Session.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = SessionRepository;
