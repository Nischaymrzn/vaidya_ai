import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import { bcryptUtil } from "../../../src/utils/bcrypt";
import GenerateTokens from "../../../src/utils/generateToken";
import { sendEmail } from "../../../src/utils/mailer";
import { env } from "../../../src/config/env";

const repoMock = {
  getUserByEmail: jest.fn(),
  getUserWithPasswordByEmail: jest.fn(),
  getUserByGoogleId: jest.fn(),
  getUserById: jest.fn(),
  createUser: jest.fn(),
  updateOneUser: jest.fn(),
};
const userDataServiceMock = {
  ensureUserData: jest.fn(),
};

jest.mock("../../../src/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => repoMock),
}));
jest.mock("../../../src/utils/bcrypt");
jest.mock("../../../src/utils/generateToken");
jest.mock("../../../src/utils/mailer");
jest.mock("../../../src/services/user-data.service", () => ({
  UserDataService: jest.fn().mockImplementation(() => userDataServiceMock),
}));
jest.mock("jsonwebtoken");

const { UserServices } = require("../../../src/services/auth.service") as {
  UserServices: new () => any;
};

const getRepo = () => repoMock as any;
const getUserDataService = () => userDataServiceMock as any;

describe("UserServices security and identity unit coverage", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    const repo = getRepo();
    const userDataService = getUserDataService();
    repo.getUserByEmail?.mockReset();
    repo.getUserWithPasswordByEmail?.mockReset();
    repo.getUserByGoogleId?.mockReset();
    repo.getUserById?.mockReset();
    repo.createUser?.mockReset();
    repo.updateOneUser?.mockReset();
    userDataService.ensureUserData?.mockReset();
    userDataService.ensureUserData?.mockResolvedValue({} as any);
    (bcryptUtil.generate as jest.Mock).mockReset();
    (bcryptUtil.compare as jest.Mock).mockReset();
    (GenerateTokens as jest.Mock).mockReset();
    (sendEmail as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
    global.fetch = jest.fn() as any;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("rejects createUser for duplicate email", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue({ _id: "u1" } as any);

    await expect(
      service.createUser({
        name: "N",
        email: "x@example.com",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      } as any),
    ).rejects.toHaveProperty("status", StatusCodes.CONFLICT);
  });

  it("creates user and initializes user-data profile", async () => {
    const service = new UserServices();
    const repo = getRepo();
    const userDataService = getUserDataService();
    repo.getUserByEmail.mockResolvedValue(null);
    (bcryptUtil.generate as jest.Mock).mockResolvedValue("hashed-pass");
    repo.createUser.mockResolvedValue({
      _id: "u-new",
      email: "new@example.com",
      name: "New User",
    } as any);

    const result = await service.createUser({
      name: "New User",
      email: "new@example.com",
      password: "Test123!@#",
      confirmPassword: "Test123!@#",
    } as any);

    expect(userDataService.ensureUserData).toHaveBeenCalledWith("u-new");
    expect(result).toEqual({
      id: "u-new",
      email: "new@example.com",
      name: "New User",
    });
  });

  it("rejects login when user is not found", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserWithPasswordByEmail.mockResolvedValue(null);

    await expect(
      service.loginUser({ email: "none@example.com", password: "Test123!@#" }),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("rejects login when password is not set", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserWithPasswordByEmail.mockResolvedValue({
      _id: "u1",
      email: "x@example.com",
      role: "user",
      password: "",
      toObject: () => ({}),
    } as any);

    await expect(
      service.loginUser({ email: "x@example.com", password: "Test123!@#" }),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("rejects login when password comparison fails", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserWithPasswordByEmail.mockResolvedValue({
      _id: "u1",
      email: "x@example.com",
      role: "user",
      password: "hashed",
      toObject: () => ({ _id: "u1", email: "x@example.com", role: "user", password: "hashed" }),
    } as any);
    (bcryptUtil.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.loginUser({ email: "x@example.com", password: "wrong" }),
    ).rejects.toHaveProperty("status", StatusCodes.CONFLICT);
  });

  it("rejects reset email request when email is missing", async () => {
    const service = new UserServices();
    await expect(service.sendResetPasswordEmail()).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
  });

  it("creates password reset token with configured secret and expiry", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue({
      _id: "u1",
      email: "user@example.com",
    } as any);
    (jwt.sign as jest.Mock).mockReturnValue("token-123");
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    await service.sendResetPasswordEmail("user@example.com");

    expect(jwt.sign).toHaveBeenCalledWith(
      { id: "u1" },
      env.PASSWORD_RESET_SECRET,
      { expiresIn: env.PASSWORD_RESET_EXPIRY },
    );
    expect(sendEmail).toHaveBeenCalledWith(
      "user@example.com",
      "Reset your Vaidya.ai password",
      expect.stringContaining("token-123"),
    );
  });

  it("rejects google login when profile has no email", async () => {
    const service = new UserServices();

    await expect(
      service.findOrCreateByGoogle({
        id: "google-1",
        displayName: "User",
        emails: [],
      }),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("returns tokens for existing google-id user", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByGoogleId.mockResolvedValue({
      _id: "u1",
      email: "g@example.com",
      role: "user",
      password: "hashed",
      toObject: () => ({ _id: "u1", email: "g@example.com", role: "user", password: "hashed" }),
    } as any);
    (GenerateTokens as jest.Mock).mockReturnValue({
      accessToken: "a",
      refreshToken: "r",
    });

    const result = await service.findOrCreateByGoogle({
      id: "google-1",
      emails: [{ value: "g@example.com" }],
    });

    expect(result.accessToken).toBe("a");
    expect((result.user as any).password).toBeUndefined();
  });

  it("links existing email account to google id", async () => {
    const service = new UserServices();
    const repo = getRepo();
    const userDataService = getUserDataService();
    repo.getUserByGoogleId.mockResolvedValue(null);
    repo.getUserByEmail.mockResolvedValue({
      _id: "u2",
      email: "link@example.com",
      role: "user",
      toObject: () => ({ _id: "u2", email: "link@example.com", role: "user" }),
    } as any);
    repo.updateOneUser.mockResolvedValue({ _id: "u2" } as any);
    repo.getUserById.mockResolvedValue({
      _id: "u2",
      email: "link@example.com",
      role: "user",
      toObject: () => ({ _id: "u2", email: "link@example.com", role: "user" }),
    } as any);
    (GenerateTokens as jest.Mock).mockReturnValue({
      accessToken: "a2",
      refreshToken: "r2",
    });

    const result = await service.findOrCreateByGoogle({
      id: "google-2",
      emails: [{ value: "link@example.com" }],
    });

    expect(repo.updateOneUser).toHaveBeenCalledWith("u2", {
      googleId: "google-2",
      isEmailVerified: true,
    });
    expect(userDataService.ensureUserData).toHaveBeenCalledWith("u2");
    expect(result.accessToken).toBe("a2");
  });

  it("creates new account for first-time google user", async () => {
    const service = new UserServices();
    const repo = getRepo();
    const userDataService = getUserDataService();
    repo.getUserByGoogleId.mockResolvedValue(null);
    repo.getUserByEmail.mockResolvedValue(null);
    repo.createUser.mockResolvedValue({
      _id: "u3",
      email: "first@example.com",
      role: "user",
      toObject: () => ({ _id: "u3", email: "first@example.com", role: "user" }),
    } as any);
    (GenerateTokens as jest.Mock).mockReturnValue({
      accessToken: "a3",
      refreshToken: "r3",
    });

    const result = await service.findOrCreateByGoogle({
      id: "google-3",
      displayName: "First User",
      emails: [{ value: "first@example.com" }],
    });

    expect(repo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "First User",
        email: "first@example.com",
        googleId: "google-3",
        isEmailVerified: true,
        role: "user",
      }),
    );
    expect(userDataService.ensureUserData).toHaveBeenCalledWith("u3");
    expect(result.accessToken).toBe("a3");
  });

  it("throws when google create/link flow does not return user", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByGoogleId.mockResolvedValue(null);
    repo.getUserByEmail.mockResolvedValue({
      _id: "u4",
      email: "broken@example.com",
      role: "user",
      toObject: () => ({ _id: "u4", email: "broken@example.com", role: "user" }),
    } as any);
    repo.updateOneUser.mockResolvedValue({ _id: "u4" } as any);
    repo.getUserById.mockResolvedValue(null as any);

    await expect(
      service.findOrCreateByGoogle({
        id: "google-4",
        emails: [{ value: "broken@example.com" }],
      }),
    ).rejects.toHaveProperty("status", StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("rejects id-token login when token is missing", async () => {
    const service = new UserServices();
    await expect(service.loginWithGoogleIdToken("")).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
  });

  it("rejects id-token login when google token endpoint returns !ok", async () => {
    const service = new UserServices();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
    });

    await expect(service.loginWithGoogleIdToken("bad-token")).rejects.toHaveProperty(
      "status",
      StatusCodes.UNAUTHORIZED,
    );
  });

  it("rejects id-token login for invalid audience", async () => {
    const service = new UserServices();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: "unknown-client",
        iss: "https://accounts.google.com",
        sub: "sub-1",
        email: "a@b.com",
      }),
    });

    await expect(service.loginWithGoogleIdToken("token")).rejects.toHaveProperty(
      "status",
      StatusCodes.UNAUTHORIZED,
    );
  });

  it("rejects id-token login for invalid issuer", async () => {
    const service = new UserServices();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: env.GOOGLE_CLIENT_ID,
        iss: "https://bad-issuer.example",
        sub: "sub-2",
        email: "a@b.com",
      }),
    });

    await expect(service.loginWithGoogleIdToken("token")).rejects.toHaveProperty(
      "status",
      StatusCodes.UNAUTHORIZED,
    );
  });

  it("rejects id-token login when sub or email is missing", async () => {
    const service = new UserServices();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: env.GOOGLE_CLIENT_ID,
        iss: "accounts.google.com",
      }),
    });

    await expect(service.loginWithGoogleIdToken("token")).rejects.toHaveProperty(
      "status",
      StatusCodes.UNAUTHORIZED,
    );
  });

  it("rejects id-token login when token is expired", async () => {
    const service = new UserServices();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: env.GOOGLE_CLIENT_ID,
        iss: "accounts.google.com",
        sub: "sub-3",
        email: "a@b.com",
        exp: "1",
      }),
    });

    await expect(service.loginWithGoogleIdToken("token")).rejects.toHaveProperty(
      "status",
      StatusCodes.UNAUTHORIZED,
    );
  });

  it("accepts valid id-token and delegates to findOrCreateByGoogle", async () => {
    const service = new UserServices();
    const spy = jest.spyOn(service, "findOrCreateByGoogle").mockResolvedValue({
      accessToken: "ga",
      refreshToken: "gr",
      user: { _id: "u5", email: "ok@example.com" },
    } as any);
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        aud: env.GOOGLE_CLIENT_ID,
        iss: "https://accounts.google.com",
        sub: "sub-4",
        email: "ok@example.com",
        email_verified: "true",
        name: "Google User",
        picture: "https://img.example/avatar.png",
        exp: String(Math.floor(Date.now() / 1000) + 3600),
      }),
    });

    const result = await service.loginWithGoogleIdToken("good-token");

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "sub-4",
        displayName: "Google User",
      }),
    );
    expect(result.accessToken).toBe("ga");
  });

  it("rejects resetPassword when token or password is missing", async () => {
    const service = new UserServices();
    await expect(service.resetPassword(undefined, "New123!@#")).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
    await expect(service.resetPassword("token", undefined)).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
  });

  it("maps verify errors to invalid/expired token error", async () => {
    const service = new UserServices();
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("jwt expired");
    });

    await expect(
      service.resetPassword("bad-token", "New123!@#"),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("maps missing user during reset flow to invalid/expired token error", async () => {
    const service = new UserServices();
    const repo = getRepo();
    (jwt.verify as jest.Mock).mockReturnValue({ id: "u404" });
    repo.getUserById.mockResolvedValue(null);

    await expect(
      service.resetPassword("token", "New123!@#"),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("resets password with hashed value for valid token", async () => {
    const service = new UserServices();
    const repo = getRepo();
    (jwt.verify as jest.Mock).mockReturnValue({ id: "u6" });
    repo.getUserById.mockResolvedValue({ _id: "u6", email: "reset@example.com" } as any);
    (bcryptUtil.generate as jest.Mock).mockResolvedValue("hashed-new-pass");
    repo.updateOneUser.mockResolvedValue({ _id: "u6" } as any);

    const result = await service.resetPassword("good-token", "New123!@#");

    expect(repo.updateOneUser).toHaveBeenCalledWith("u6", {
      password: "hashed-new-pass",
    });
    expect(result).toEqual({ id: "u6", email: "reset@example.com" });
  });
});
