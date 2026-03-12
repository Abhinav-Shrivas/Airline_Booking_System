const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");
const {
  generateSessionToken,
  hashToken,
} = require("../utils/session-token.js");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

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

  async login(data) {
    try {
      const { email, password } = data;
      const user = await userRepository.fetchByEmail(email);

      if (!user) {
        throw new Error("User not found");
      }
      const isPasswordValid = await comparePassword(password, user.password);

      if (!isPasswordValid) {
        throw new Error("Invalid password");
      }

      const sessionToken = generateSessionToken();
      const tokenHash = hashToken(sessionToken);
      const now = Date.now();
      const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      const absoluteExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000);

      const token = {
        tokenHash,
        userId: user.id,
        expiresAt,
        absoluteExpiry,
      };
      const session = await sessionRepository.create(token);
      return {
        session,
        user,
        sessionToken
      };
    } catch (error) {
      console.log("Something went wrong in the service layer.",error);
      throw error;

    }

    return user;
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
