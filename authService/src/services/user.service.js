const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

class UserService {
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

  //assign role
  async assignRole(data) {
    try {
      const { email, roleName } = data;
      const user = await userRepository.fetchByEmail(email);
      if(!user){
        throw new Error("User not exists.")
      }
      const roles = user.roles.map(r => r.name);
      const hasRoleAlreadyAssigned = roles.includes(roleName);
      if(hasRoleAlreadyAssigned) throw new Error("User is already assigned with the role.");

      const response = await userRepository.assignRole(email,roleName);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async updateRole(data) {
    try {
      const { email, roleName } = data;
      const user = await userRepository.fetchByEmail(email);
      if(!user){
        throw new Error("User not exists.")
      }
      const response = await userRepository.updateRole(email,roleName);
      return response;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }
}

module.exports = new UserService();
