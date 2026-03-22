const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");
const { AppError } = require("shared");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

class UserService {
  // changePassword when user knows his/her old password
  async changePassword(userId, data) {
    const { currentPassword, newPassword } = data;

    if (currentPassword === newPassword) {
      throw new AppError("New password must be different from current password.", 400);
    }
    const user = await userRepository.fetch(userId);
    const isPasswordValid = await comparePassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new AppError("Invalid current password.", 401);
    }
    await userRepository.update(userId, { password: newPassword });
    await sessionRepository.deleteByUserId(userId);
    return true;
  }

  // fetch user using id
  async fetch(id) {
    const response = await userRepository.fetch(id);
    return response;
  }

  // update user using id
  async update(id, data) {
    const response = await userRepository.update(id, data);
    return response;
  }

  // delete user using id
  async destroy(id) {
    const response = await userRepository.destroy(id);
    return response;
  }

  // assign role
  async assignRole(data) {
    const { email, roleName } = data;
    const user = await userRepository.fetchByEmail(email);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const roles = user.roles.map((r) => r.name);
    const hasRoleAlreadyAssigned = roles.includes(roleName);
    if (hasRoleAlreadyAssigned) {
      throw new AppError("User is already assigned with this role.", 409);
    }

    const response = await userRepository.assignRole(email, roleName);
    return response;
  }

  // update role
  async updateRole(data) {
    const { email, roleName } = data;
    const user = await userRepository.fetchByEmail(email);
    if (!user) {
      throw new AppError("User not found.", 404);
    }
    const response = await userRepository.updateRole(email, roleName);
    return response;
  }
}

module.exports = new UserService();
