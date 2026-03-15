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

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();
const otpRepository = new OtpRepository();

class AuthService{

  //login
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

      //check if more than two sessions already exists
      const sessions = await sessionRepository.findAllSessions(user.id);
      if (sessions.length >= 2) {
        // Delete all sessions except the 1 newest one
        const sessionsToDelete = sessions.length - 1;
        for (let i = 0; i < sessionsToDelete; i++) {
          await sessionRepository.destroy(sessions[i].id);
        }
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
      console.log("Something went wrong in the service layer.");
      throw error;
    }
  }

  //login with otp
  async loginWithOtp(data) {
    try {
      //verify otp
      const { otpId, otp } = data;
      const hashOtp = hashToken(String(otp));
      const storeOtp = await otpRepository.fetch(otpId);

      if (storeOtp) {
        const user = await userRepository.fetchByEmail(storeOtp.email);
        const attempts = storeOtp.attemptCount;
        const isExpired = new Date() > storeOtp.expiresAt;
        if (isExpired) {
          await otpRepository.deleteByEmail(storeOtp.email);
          throw new Error("Expired Otp. Please request otp again.");
        }
        if (attempts >= 5){
          await otpRepository.deleteByEmail(storeOtp.email);
          throw new Error("Attemp limit reached. Please request otp again.");
        }
        if (storeOtp.otpHash !== hashOtp) {
          await otpRepository.update(otpId, { attemptCount: attempts + 1 });
          throw new Error("Wrong Otp. Please type correct Otp.");
        }
        if (!user) {
          throw new Error("User not found");
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
        //delete otp data from db
        await otpRepository.deleteByEmail(storeOtp.email);
        return {
          user,
          accessToken,
          sessionToken,
        };
      }
      throw new Error("Invalid request. Please try again.");
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

  //forgot password

  //generate and send otp
  async sendOtp(email) {
    try {
      const otp = generateOtp();
      const otpHash = hashToken(String(otp));
      const now = Date.now();
      const expiresAt = new Date(now + 2 * 60 * 1000);
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

  //verify otp
  async verifyOtp(data) {
    try {
      const { otpId, otp } = data;
      const hashOtp = hashToken(String(otp));
      const storeOtp = await otpRepository.fetch(otpId);

      if (storeOtp) {
        const attempts = storeOtp.attemptCount;
        const isExpired = new Date() > storeOtp.expiresAt;
        if (isExpired) {
          await otpRepository.deleteByEmail(storeOtp.email);
          throw new Error("Expired Otp. Please request otp again.");
        }
        if (attempts >= 5){
          await otpRepository.deleteByEmail(storeOtp.email);
          throw new Error("Attemp limit reached. Please request otp again.");
        }
        if (storeOtp.otpHash !== hashOtp) {
          await otpRepository.update(otpId, { attemptCount: attempts + 1 });
          throw new Error("Wrong Otp. Please type correct Otp.");
        }
        const resetToken = generateResetToken(storeOtp.email);
        await otpRepository.deleteByEmail(storeOtp.email);

        return resetToken;
      }
      throw new Error("Invalid request. Please try again.");
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
