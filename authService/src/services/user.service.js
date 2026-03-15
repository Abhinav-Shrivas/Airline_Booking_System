const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

class UserService {
  //register
  async register(data) {
    try {
      const response = await userRepository.create(data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
  //changePassword when user knows his/her old password
  async changePassword(userId, data) {
    try {
      const { currentPassword, newPassword } = data;

      if (currentPassword === newPassword) {
        throw new Error("New password must be different from current password");
      }
      const user = await userRepository.fetch(userId);
      const isPasswordValid = await comparePassword(
        currentPassword,
        user.password,
      );

      if (!isPasswordValid) {
        throw new Error("Invalid current password");
      }
      await userRepository.update(userId, { password: newPassword });
      await sessionRepository.deleteByUserId(userId);
      return true;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
  //fetch user using id
  async fetch(id) {
    try {
      const response = await userRepository.fetch(id);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  //update using using id
  async update(id, data) {
    try {
      const response = await userRepository.update(id, data);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  //delete user using id
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
