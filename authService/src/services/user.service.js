const UserRepository = require("../repositories/user.repository.js");
const userRepository = new UserRepository();

class UserService {
  async register(data) {
    try {
      const response = await userRepository.create(data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async fetch(id) {
    try {
      const response = await userRepository.fetch(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async update(id, data) {
    try {
      const response = await userRepository.update(id, data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async destroy(id) {
    try {
      const response = await userRepository.destroy(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
}

module.exports = new UserService();
