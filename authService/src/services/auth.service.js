const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const { comparePassword } = require("../utils/password.js");
const eventPublisher = require("../utils/eventPublisher.js");
const redis = require("../config/redis.js");
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

const { getGoogleTokens, getGoogleUserInfo } = require("../utils/google-oauth");
const { AppError, logger } = require("shared");

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

const MS_PER_DAY = 24 * 60 * 60 * 1000;

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
    const raw = await redis.get(`otp:${otpId}`);
    if (!raw) {
      logger.warn(`OTP verification failed: OTP expired or not found [otpId=${otpId}]`);
      throw new AppError("Invalid or expired OTP", 400);
    }
    const storedOtp = JSON.parse(raw);
    if (storedOtp.attemptCount >= OTP_MAX_ATTEMPTS) {
      await redis.del(`otp:${otpId}`, `otp:email:${storedOtp.email}`);
      logger.warn(`OTP max attempts exceeded, deleted [otpId=${otpId}]`);
      throw new AppError("Too many attempts. Please request a new OTP", 429);
    }
    const hashOtp = hashToken(String(otp));
    if (storedOtp.otpHash !== hashOtp) {
      storedOtp.attemptCount += 1;
      await redis.set(`otp:${otpId}`, JSON.stringify(storedOtp), "KEEPTTL");
      logger.warn(`OTP mismatch, attempt ${storedOtp.attemptCount}/${OTP_MAX_ATTEMPTS} [otpId=${otpId}]`);
      throw new AppError("Invalid or expired OTP", 400);
    }
    logger.info(`OTP verified successfully [otpId=${otpId}]`);
    return storedOtp;
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
    eventPublisher.publish("register.successful", {
      userId: user.id,
    });
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
    if (user.provider === "google" && !user.password) {
      throw new AppError(
        "This account uses Google login. Please sign in with Google.",
        400,
      );
    }
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    const sessions = await sessionRepository.findAllSessions(user.id);
    if (sessions.length >= SESSION_LIMIT_PER_USER) {
      const sessionsToDelete = sessions.length - SESSION_LIMIT_PER_USER + 1;
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

    await redis.del(`otp:${otpId}`, `otp:email:${storeOtp.email}`);
    logger.info(`OTP login successful, cleaned up OTP keys [email=${storeOtp.email}]`);

    // Enforce session limits (same logic as login)
    const sessions = await sessionRepository.findAllSessions(user.id);
    if (sessions.length >= SESSION_LIMIT_PER_USER) {
      const sessionsToDelete = sessions.length - SESSION_LIMIT_PER_USER + 1;
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

  async loginWithGoogle(code) {
    // Google API calls live here now
    const { access_token } = await getGoogleTokens(code);
    const googleUser = await getGoogleUserInfo(access_token);
    const { sub: googleId, email, name } = googleUser;

    let user = await userRepository.fetchByEmail(email);

    if (!user) {
      // New user — create with Google provider, no password
      user = await userRepository.create({
        name,
        email,
        password: null,
        provider: "google",
        googleId,
      });
    } else {
      if (!user.googleId) {
        // Existing local user logging in with Google for the first time — link accounts
        await userRepository.update(user.id, { googleId, provider: "both" });
      } else if (user.googleId !== googleId) {
        throw new AppError("Google account mismatch", 401);
      }
    }

    // Enforce session limits (same logic as login)
    const sessions = await sessionRepository.findAllSessions(user.id);
    if (sessions.length >= SESSION_LIMIT_PER_USER) {
      const sessionsToDelete = sessions.length - SESSION_LIMIT_PER_USER + 1;
      for (let i = 0; i < sessionsToDelete; i++) {
        await sessionRepository.destroy(sessions[i].id);
      }
    }

    // For new users, roles aren't loaded on the object — re-fetch to get roles
    if (!user.roles) {
      user = await userRepository.fetch(user.id);
    }
    const roles = user.roles.map((r) => r.name);
    const { sessionToken, accessToken } = await this._createSessionForUser(
      user.id,
      roles,
    );

    return { user, accessToken, sessionToken };
  }

  //refresh
  async refresh(sessionToken) {
    const tokenHash = hashToken(sessionToken);

    const session = await sessionRepository.fetchByToken(tokenHash);

    if (!session) {
      throw new AppError("Invalid or Expired Session", 401);
    }

    //checking expiry of session token
    const now = new Date();
    if (now > session.expiresAt) {
      throw new AppError("Invalid or Expired Session", 401);
    }

    if (now > session.absoluteExpiry) {
      throw new AppError("Invalid or Expired Session", 401);
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

  //send otp and store data in redis
  async sendOtp(email) {
    try {
      await redis.ping();
    } catch (err) {
      logger.error("Redis ping failed — OTP service unavailable");
      throw new AppError(
        "OTP service temporarily unavailable. Please use password login.",
        503,
      );
    }
    const otp = generateOtp();
    const otpHash = hashToken(String(otp));
    const otpId = generateUuid();
    const ttlSeconds = OTP_EXPIRY_MINUTES * 60;
    // Delete any existing OTP for this email
    const existingOtpId = await redis.get(`otp:email:${email}`);
    if (existingOtpId) {
      await redis.del(`otp:${existingOtpId}`, `otp:email:${email}`);
      logger.info(`Deleted existing OTP for [email=${email}]`);
    }
    const user = await userRepository.fetchByEmail(email);
    if (user) {
      const emailText = `Otp is: ${otp}`;
      const otpData = JSON.stringify({ email, otpHash, attemptCount: 0 });
      await redis.setex(`otp:${otpId}`, ttlSeconds, otpData);
      await redis.setex(`otp:email:${email}`, ttlSeconds, otpId);
      logger.info(`OTP stored in Redis [otpId=${otpId}, ttl=${ttlSeconds}s]`);
      // if sendEmail fails then we delete the otp stored and throw the error
      try {
        await sendEmail(email, "OTP", emailText);
        logger.info(`OTP email sent to [email=${email}]`);
      } catch (error) {
        await redis.del(`otp:${otpId}`, `otp:email:${email}`);
        logger.error(`OTP email failed, cleaned up Redis keys [email=${email}]`);
        throw new AppError("Something went wrong", 500);
      }
      return { otpId: otpId };
    }

    // fake id if user doesn't exist to prevent data enumeration attack
    logger.info("OTP requested for non-existent user — returning fake otpId");
    return { otpId: generateUuid() };
  }

  async verifyOtpAndGetResetToken(data) {
    const { otpId, otp } = data;
    const storeOtp = await this._verifyOtp(otpId, otp);
    const resetToken = generateResetToken(storeOtp.email);
    await redis.del(`otp:${otpId}`, `otp:email:${storeOtp.email}`);
    logger.info(`Reset token generated, OTP cleaned up [email=${storeOtp.email}]`);
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
