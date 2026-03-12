const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");
const {
  generateSessionToken,
  hashToken,
} = require("../utils/session-token.js");

const { generateAccessToken } = require("../utils/jwt.js");

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

      //generate session
      const sessionToken = generateSessionToken();
      const tokenHash = hashToken(sessionToken);
      const now = Date.now(); //return number which are milliseconds
      const expiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      const absoluteExpiry = new Date(now + 30 * 24 * 60 * 60 * 1000);

      const token = {
        tokenHash,
        userId: user.id,
        expiresAt,
        absoluteExpiry,
      };
      const session = await sessionRepository.create(token);

      //generate jwt
      const accessToken = generateAccessToken({
        userId: user.id,
        sessionId: session.id,
      });

      return {
        user,
        accessToken,
        sessionToken,
      };
    } catch (error) {
      console.log("Something went wrong in the service layer.", error);
      throw error;
    }
  }

  async refresh(sessionToken) {
    try {
      const tokenHash = hashToken(sessionToken);

      const session = await sessionRepository.fetchByToken(tokenHash);

      if (!session) {
        throw new Error("Invalid session");
      }

      //checking expiry of session token
      const now = new Date();
      if (now > session.expiresAt) {
        throw new Error("Session expired");
      }

      if (now > session.absoluteExpiry) {
        throw new Error("Session exceeded maximum lifetime");
      }

      // rotate session token
      const newSessionToken = generateSessionToken();
      const newHash = hashToken(newSessionToken);
      const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await sessionRepository.update(session.id, {
        tokenHash: newHash,
        expiresAt: newExpiresAt,
      });

      // issue new JWT
      const accessToken = generateAccessToken({
        userId: session.userId,
        sessionId: session.id,
      });

      return {
        accessToken,
        newSessionToken,
      };
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
