const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const OtpRepository = require("../repositories/otp.repository.js");
const { comparePassword } = require("../utils/password.js");
const {
  generateSessionToken,
  hashToken,
  generateOtp,
  generateUuid,
} = require("../utils/crypto.js");
const sendEmail = require("../utils/sendEmail.js");
const { generateAccessToken, generateResetToken } = require("../utils/jwt.js");
const {
  SESSION_ROLLING_DAYS,
  SESSION_ABSOLUTE_DAYS,
  SESSION_LIMIT_PER_USER,
  OTP_EXPIRY_MINUTES,
  OTP_MAX_ATTEMPTS,
} = require("../config/serverConfig.js");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const otpRepository = new OtpRepository();

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

class AuthService {
  /** Creates a new session for the user and returns session token + access token. */
  async _createSessionForUser(userId) {
    const sessionToken = generateSessionToken();
    const tokenHash = hashToken(sessionToken);
    const now = Date.now();
    const expiresAt = new Date(now + SESSION_ROLLING_DAYS * MS_PER_DAY);
    const absoluteExpiry = new Date(now + SESSION_ABSOLUTE_DAYS * MS_PER_DAY);

    const session = await sessionRepository.create({
      tokenHash,
      userId,
      expiresAt,
      absoluteExpiry,
    });

    const accessToken = generateAccessToken({
      userId,
      sessionId: session.id,
    });

    return { session, sessionToken, accessToken };
  }

  /** Verifies OTP by id + code; returns stored OTP record or throws. */
  async _verifyOtp(otpId, otp) {
    const storeOtp = await otpRepository.fetch(otpId);
    if (!storeOtp) {
      throw new Error("Invalid request. Please try again.");
    }

    const attempts = storeOtp.attemptCount;
    const isExpired = new Date() > storeOtp.expiresAt;

    if (isExpired) {
      await otpRepository.deleteByEmail(storeOtp.email);
      throw new Error("Expired Otp. Please request otp again.");
    }
    if (attempts >= OTP_MAX_ATTEMPTS) {
      await otpRepository.deleteByEmail(storeOtp.email);
      throw new Error("Attemp limit reached. Please request otp again.");
    }
    const hashOtp = hashToken(String(otp));
    if (storeOtp.otpHash !== hashOtp) {
      await otpRepository.update(otpId, { attemptCount: attempts + 1 });
      throw new Error("Wrong Otp. Please type correct Otp.");
    }

    return storeOtp;
  }

    //register
  async register(data) {
    try {
      const response = await userRepository.fetchByEmail(data.email);
      if(response){
        throw new Error("User already exists. Please sign in.");
      }
      const user = await userRepository.create(data);
      const { sessionToken, accessToken } = await this._createSessionForUser(user.id);
      return {
        user,
        accessToken,
        sessionToken,
      };
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

      const sessions = await sessionRepository.findAllSessions(user.id);
      if (sessions.length >= SESSION_LIMIT_PER_USER) {
        const sessionsToDelete = sessions.length - 1;
        for (let i = 0; i < sessionsToDelete; i++) {
          await sessionRepository.destroy(sessions[i].id);
        }
      }

      const { sessionToken, accessToken } = await this._createSessionForUser(user.id);

      return {
        user,
        accessToken,
        sessionToken,
      };
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async loginWithOtp(data) {
    try {
      const { otpId, otp } = data;
      const storeOtp = await this._verifyOtp(otpId, otp);

      const user = await userRepository.fetchByEmail(storeOtp.email);
      if (!user) {
        throw new Error("User not found");
      }

      await otpRepository.deleteByEmail(storeOtp.email);
      const { sessionToken, accessToken } = await this._createSessionForUser(user.id);

      return {
        user,
        accessToken,
        sessionToken,
      };
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  //refresh
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

      const newSessionToken = generateSessionToken();
      const newHash = hashToken(newSessionToken);
      const newExpiresAt = new Date(Date.now() + SESSION_ROLLING_DAYS * MS_PER_DAY);

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

  //logout
  async logout(sessionToken) {
    try {
      const tokenHash = hashToken(sessionToken);
      await sessionRepository.deleteByTokenHash(tokenHash);
      return true;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  //logoutFromOtherDevices
  async logoutFromOtherDevices(jwtPayload) {
    try {
      const { userId, sessionId } = jwtPayload;
      await sessionRepository.deleteOtherSessions(userId, sessionId);
      return true;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async sendOtp(email) {
    try {
      const otp = generateOtp();
      const otpHash = hashToken(String(otp));
      const now = Date.now();
      const expiresAt = new Date(now + OTP_EXPIRY_MINUTES * MS_PER_MINUTE);
      const otpData = {
        otpHash,
        expiresAt,
        email,
      };

      //race condtion could occur in delete and creating data in otp so we can handle it by upsert or transaction(currently not implementing them).
      await otpRepository.deleteByEmail(email);
      const user = await userRepository.fetchByEmail(email);
      if (user) {
        const emailText = `Otp is: ${otp}`;
        const otpSession = await otpRepository.create(otpData);
        // if sendEmail fails then we delete the otp stored and throw the error
        try {
          await sendEmail(email, "OTP", emailText);
        } catch (error) {
          await otpRepository.deleteByEmail(email);
          throw error;
        }
        return { otpId: otpSession.id };
      }
      // fake id if user doesn't exist to prevent data enumeration attack
      return { otpId: generateUuid() };
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  async verifyOtp(data) {
    try {
      const { otpId, otp } = data;
      const storeOtp = await this._verifyOtp(otpId, otp);
      const resetToken = generateResetToken(storeOtp.email);
      await otpRepository.deleteByEmail(storeOtp.email);
      return resetToken;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  // change password using temporary access token
  async changePasswordWithToken(email, newPassword) {
    try {
      const user = await userRepository.fetchByEmail(email);
      await userRepository.update(user.id, { password: newPassword });
      await sessionRepository.deleteByUserId(user.id);
      return true;
    } catch (error) {
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

}

module.exports = new AuthService();
