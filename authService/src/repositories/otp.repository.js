const { Otp } = require("../models/index");

class OtpRepository {
  async create(data) {
    try {
      const response = await Otp.create(data);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await Otp.findByPk(id);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async update(id, data) {
    try {
      await Otp.update(data, {
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

  async deleteByEmail(email) {
    try {
      await Otp.destroy({
        where: { email },
      });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async destroy(id) {
    try {
      await Otp.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = OtpRepository;
