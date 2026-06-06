jest.mock("../utils/password.js", () => ({
  comparePassword: jest.fn(),
}));

/*
It tells Jest:
Whenever any file does require("../utils/password.js"), return this fake module instead of the real one.
Jest applies this before imports/requires are executed.

So when auth.service.js loads:
const { comparePassword } = require("../utils/password.js");
it receives the mocked function, not the real one.

That's why better practice was to :
const passwordUtils = require("../utils/password");
await passwordUtils.comparePassword(...)
inside authService
*/

jest.mock("../utils/crypto.js", () => ({
  generateSessionToken: jest.fn(),
  hashToken: jest.fn(),
}));

jest.mock("../utils/jwt.js", () => ({
  generateAccessToken: jest.fn(),
}));

const passwordUtils = require("../utils/password.js");
const { SESSION_LIMIT_PER_USER } = require("../config/serverConfig.js");
const UserRepository = require("../repositories/user.repository.js");
const SessionRepository = require("../repositories/session.repository.js");
const authService = require("../services/auth.service.js");
const cryptoFunctions = require("../utils/crypto.js");
const jwtFunctions = require("../utils/jwt.js");

describe("testing login function of auth service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // HAPPY PATH
  //login function testing
  it("login function should return access and session token along with user object", async () => {
    //values
    const mockUserData = {
      id: 1,
      email: "test@gmail.com",
      provider: "local",
      password: "password123",
      roles: [
        {
          id: 1,
          name: "USER",
        },
        {
          id: 2,
          name: "ADMIN",
        },
      ],
    };

    const mockSessionData = [
      {
        id: 1,
        userId: 1,
        tokenHash: "tokenHash1",
      },
      {
        id: 2,
        userId: 1,
        tokenHash: "tokenHash2",
      },
      {
        id: 3,
        userId: 1,
        tokenHash: "tokenHash3",
      },
      {
        id: 4,
        userId: 1,
        tokenHash: "tokenHash4",
      },
    ];

    // mocking fetchByEmail function of UserRepository class
    const fetchByEmailSpy = jest
      .spyOn(UserRepository.prototype, "fetchByEmail")
      .mockResolvedValue(mockUserData);

    // mocking functions of SessionRepository class
    const findAllSessionsSpy = jest
      .spyOn(SessionRepository.prototype, "findAllSessions")
      .mockResolvedValue(mockSessionData);

    const destroySpy = jest
      .spyOn(SessionRepository.prototype, "destroy")
      .mockResolvedValue(true);

    // mock comparePassword function
    passwordUtils.comparePassword.mockResolvedValue(true);

    // mock _createSessionForUser function
    const createSessionSpy = jest
      .spyOn(authService, "_createSessionForUser")
      .mockResolvedValue({
        sessionToken: "session123",
        accessToken: "access123",
      });

    //test login()
    const result = await authService.login({
      email: "test@gmail.com",
      password: "password123",
    });

    //checking result
    expect(result).toEqual({
      user: mockUserData,
      sessionToken: "session123",
      accessToken: "access123",
    });

    //checking dependencies and functions
    expect(fetchByEmailSpy).toHaveBeenCalledWith("test@gmail.com");

    expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
      "password123",
      "password123",
    );

    expect(findAllSessionsSpy).toHaveBeenCalledWith(1);

    const thisManyTimes = mockSessionData.length - SESSION_LIMIT_PER_USER + 1;
    expect(destroySpy).toHaveBeenCalledTimes(thisManyTimes);
    for (let i = 0; i < thisManyTimes; i++) {
      expect(destroySpy).toHaveBeenNthCalledWith(i + 1, mockSessionData[i].id);
    }

    expect(createSessionSpy).toHaveBeenCalledWith(1, ["USER", "ADMIN"]);
  });

  //ERRORS
  //user not found
  it("login function should throw error if user not found", async () => {
    const mockUserInput = {
      email: "test@gmail.com",
      password: "password123",
    };

    // mocking fetchByEmail function of UserRepository class to return null
    const fetchByEmailSpy = jest
      .spyOn(UserRepository.prototype, "fetchByEmail")
      .mockResolvedValue(null);

    //calling login function to check if it throws error
    await expect(() => authService.login(mockUserInput)).rejects.toThrow(
      "Invalid email or password",
    );

    //checking dependencies
    expect(fetchByEmailSpy).toHaveBeenCalledWith(mockUserInput.email);
  });

  //user provider is "google" and password is null inside database
  it("login function should throw error user provider is 'google' and password is null inside database", async () => {
    const mockUserInput = {
      email: "test@gmail.com",
      password: "password123",
    };

    const mockUserData = {
      email: "test@gmail.com",
      provider: "google",
      password: null,
    };

    // mocking fetchByEmail function of UserRepository class to return null
    const fetchByEmailSpy = jest
      .spyOn(UserRepository.prototype, "fetchByEmail")
      .mockResolvedValue(mockUserData);

    //calling login function to check if it throws error
    await expect(() => authService.login(mockUserInput)).rejects.toThrow(
      "This account uses Google login. Please sign in with Google.",
    );

    //checking dependencies
    expect(fetchByEmailSpy).toHaveBeenCalledWith(mockUserInput.email);
  });

  //password do not match
  it("login function should throw error if password do not match", async () => {
    const mockUserInput = {
      email: "test@gmail.com",
      password: "password123",
    };

    const mockUserData = {
      email: "test@gmail.com",
      password: "password321",
    };

    // mocking fetchByEmail function of UserRepository class to return null
    const fetchByEmailSpy = jest
      .spyOn(UserRepository.prototype, "fetchByEmail")
      .mockResolvedValue(mockUserData);

    // mock comparePassword function
    passwordUtils.comparePassword.mockResolvedValue(false);

    //calling login function to check if it throws error
    await expect(() => authService.login(mockUserInput)).rejects.toThrow(
      "Invalid email or password",
    );

    //checking dependencies
    expect(fetchByEmailSpy).toHaveBeenCalledWith(mockUserInput.email);
    expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
      mockUserInput.password,
      mockUserData.password,
    );
  });
});

//_createSessionForUser function testing
describe("tesing _createSessionForUser of auth service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it("_createSessionForUser function should return session and access token", async () => {
    //mock userData
    const userId = 1;
    const roles = ["USER", "ADMIN"];
    const mockSessionData = {
      id: 1,
      userId: 1,
      tokenHash: "hashToken",
    };

    //mock functions
    const createSessionSpy = jest
      .spyOn(SessionRepository.prototype, "create")
      .mockResolvedValue(mockSessionData);

    cryptoFunctions.generateSessionToken.mockReturnValue("session123");
    cryptoFunctions.hashToken.mockReturnValue("hashToken");

    jwtFunctions.generateAccessToken.mockReturnValue("access123");

    //call _createSessionForUser()
    const result = await authService._createSessionForUser(userId, roles);

    //checking results
    expect(result).toEqual({
      sessionToken: "session123",
      accessToken: "access123",
    });

    expect(cryptoFunctions.generateSessionToken).toHaveBeenCalledTimes(1);
    expect(cryptoFunctions.hashToken).toHaveBeenCalledWith("session123");

    expect(createSessionSpy).toHaveBeenCalledWith({
      tokenHash: "hashToken",
      userId,
      expiresAt: expect.any(Date),
      absoluteExpiry: expect.any(Date),
    });

    expect(jwtFunctions.generateAccessToken).toHaveBeenCalledWith({
      userId,
      sessionId: mockSessionData.id,
      roles,
    });
  });
});
