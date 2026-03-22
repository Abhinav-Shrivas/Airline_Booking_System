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
const { AppError } = require("shared");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const otpRepository = new OtpRepository();

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

class AuthService {
  /** Creates a new session for the user and returns session token + access token. */
  async _createSessionForUser(userId, roles) {
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
      roles,
    });

    return { sessionToken, accessToken };
  }

  /** Verifies OTP by id + code; returns stored OTP record or throws. */
  async _verifyOtp(otpId, otp) {
    const storeOtp = await otpRepository.fetch(otpId);
    if (!storeOtp) {
      throw new AppError("Invalid or expired OTP",400);
    }

    const attempts = storeOtp.attemptCount;
    const isExpired = new Date() > storeOtp.expiresAt;

    if (isExpired) {
      await otpRepository.deleteByEmail(storeOtp.email);
      throw new AppError("Invalid or expired OTP",400);
    }
    if (attempts >= OTP_MAX_ATTEMPTS) {
      await otpRepository.deleteByEmail(storeOtp.email);
      throw new AppError("Too many attempts. Please request a new OTP",429);
    }
    const hashOtp = hashToken(String(otp));
    if (storeOtp.otpHash !== hashOtp) {
      await otpRepository.update(otpId, { attemptCount: attempts + 1 });
      throw new AppError("Invalid or expired OTP", 400);
    }
    return storeOtp;
  }

  //register
  async register(data) {
    const response = await userRepository.fetchByEmail(data.email);
    if (response) {
      throw new AppError("User already exists. Please sign in.", 409);
    }
    const user = await userRepository.create(data);
    const { sessionToken, accessToken } = await this._createSessionForUser(
      user.id,
      ["USER"],
    );
    return {
      user,
      accessToken,
      sessionToken,
    };
  }

  async login(data) {
    const { email, password } = data;
    const user = await userRepository.fetchByEmail(email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const sessions = await sessionRepository.findAllSessions(user.id);
    if (sessions.length >= SESSION_LIMIT_PER_USER) {
      const sessionsToDelete = sessions.length - 1;
      for (let i = 0; i < sessionsToDelete; i++) {
        await sessionRepository.destroy(sessions[i].id);
      }
    }
    const roles = user.roles.map((r) => r.name);
    const { sessionToken, accessToken } = await this._createSessionForUser(
      user.id,
      roles,
    );

    return {
      user,
      accessToken,
      sessionToken,
    };
  }

  async loginWithOtp(data) {
    const { otpId, otp } = data;
    const storeOtp = await this._verifyOtp(otpId, otp);

    const user = await userRepository.fetchByEmail(storeOtp.email);
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    await otpRepository.deleteByEmail(storeOtp.email);
    const roles = user.roles.map((r) => r.name);
    const { sessionToken, accessToken } = await this._createSessionForUser(
      user.id,
      roles,
    );

    return {
      user,
      accessToken,
      sessionToken,
    };
  }

  //refresh
  async refresh(sessionToken) {
    const tokenHash = hashToken(sessionToken);

    const session = await sessionRepository.fetchByToken(tokenHash);

    if (!session) {
      throw new AppError("Invalid or Expired Session",401);
    }

    //checking expiry of session token
    const now = new Date();
    if (now > session.expiresAt) {
      throw new AppError("Invalid or Expired Session",401);
    }

    if (now > session.absoluteExpiry) {
      throw new AppError("Invalid or Expired Session",401);
    }
    const user = await userRepository.fetch(session.userId);
    const roles = user.roles.map((r) => r.name);
    const newSessionToken = generateSessionToken();
    const newHash = hashToken(newSessionToken);
    const newExpiresAt = new Date(
      Date.now() + SESSION_ROLLING_DAYS * MS_PER_DAY,
    );

    await sessionRepository.update(session.id, {
      tokenHash: newHash,
      expiresAt: newExpiresAt,
    });

    // issue new JWT
    const accessToken = generateAccessToken({
      userId: session.userId,
      sessionId: session.id,
      roles,
    });
    return {
      accessToken,
      newSessionToken,
    };
  }

  //logout
  async logout(sessionToken) {
    const tokenHash = hashToken(sessionToken);
    await sessionRepository.deleteByTokenHash(tokenHash);
    return true;
  }

  //logoutFromOtherDevices
  async logoutFromOtherDevices(jwtPayload) {
    const { userId, sessionId } = jwtPayload;
    await sessionRepository.deleteOtherSessions(userId, sessionId);
    return true;
  }

  async sendOtp(email) {
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
        throw new AppError("Something went wrong", 500);
      }
      return { otpId: otpSession.id };
    }
    // fake id if user doesn't exist to prevent data enumeration attack
    return { otpId: generateUuid() };
  }

  async verifyOtpAndGetResetToken(data) {
    const { otpId, otp } = data;
    const storeOtp = await this._verifyOtp(otpId, otp);
    const resetToken = generateResetToken(storeOtp.email);
    await otpRepository.deleteByEmail(storeOtp.email);
    return resetToken;
  }

  // change password using temporary access token
  async changePasswordWithToken(email, newPassword) {
    const user = await userRepository.fetchByEmail(email);
    await userRepository.update(user.id, { password: newPassword });
    await sessionRepository.deleteByUserId(user.id);
    return true;
  }
}

module.exports = new AuthService();
