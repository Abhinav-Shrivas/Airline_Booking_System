const {User} = require('../models/index');

class UserRepository {
  async create(data) {
    try {
      const response = await User.create(data);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await User.findByPk(id);
      return response;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }

  async fetchByEmail(email) {
  try {
    const response = await User.findOne({ where: { email } });
    return response;
  } catch (error) {
    console.log("Something went wrong in the repository layer");
    throw error;
  }
}


  async update(id, data) {
    try {
      await User.update(data, {
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

  async destroy(id) {
    try {
      await User.destroy({ where: { id } });
      return true;
    } catch (error) {
      console.log("something went wrong in the repository layer");
      throw error;
    }
  }
}

module.exports = UserRepository;
