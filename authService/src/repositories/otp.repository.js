const { Otp } = require("../models/index");

class OtpRepository {
  async create(data) {
    const response = await Otp.create(data);
    return response;
  }

  async fetch(id) {
    const response = await Otp.findByPk(id);
    return response;
  }

  async update(id, data) {
    await Otp.update(data, {
      where: {
        id: id,
      },
    });
    return true;
  }

  async deleteByEmail(email) {
    await Otp.destroy({
      where: { email },
    });
    return true;
  }

  async destroy(id) {
    await Otp.destroy({ where: { id } });
    return true;
  }
}

module.exports = OtpRepository;
