import jwt from "jsonwebtoken";
import { UserServices } from "../../../src/services/auth.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import { bcryptUtil } from "../../../src/utils/bcrypt";
import GenerateTokens from "../../../src/utils/generateToken";
import { sendEmail } from "../../../src/utils/mailer";

jest.mock("../../../src/repositories/user.repository");
jest.mock("../../../src/utils/bcrypt");
jest.mock("../../../src/utils/generateToken");
jest.mock("../../../src/utils/mailer");
jest.mock("jsonwebtoken");

const UserRepositoryMock = UserRepository as jest.MockedClass<
  typeof UserRepository
>;

const getRepo = () =>
  UserRepositoryMock.mock.instances[0] as jest.Mocked<UserRepository>;

describe("UserServices", () => {
  beforeEach(() => {
    (bcryptUtil.generate as jest.Mock).mockReset();
    (bcryptUtil.compare as jest.Mock).mockReset();
    (GenerateTokens as jest.Mock).mockReset();
    (sendEmail as jest.Mock).mockReset();
    (jwt.sign as jest.Mock).mockReset();
    (jwt.verify as jest.Mock).mockReset();
    const repo = getRepo();
    repo.getUserByEmail?.mockReset();
    repo.getUserWithPasswordByEmail?.mockReset();
    repo.createUser?.mockReset();
    repo.getUserById?.mockReset();
    repo.updateOneUser?.mockReset();
  });

  it("should create user and return safe payload", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue(null);
    (bcryptUtil.generate as jest.Mock).mockResolvedValue("hashed");
    repo.createUser.mockResolvedValue({
      _id: "1",
      email: "a@b.com",
      name: "A",
    } as any);

    const result = await service.createUser({
      name: "A",
      email: "a@b.com",
      password: "Test123!@#",
      confirmPassword: "Test123!@#",
    } as any);

    expect(result).toEqual({ id: "1", email: "a@b.com", name: "A" });
  });

  it("should login and return tokens", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserWithPasswordByEmail.mockResolvedValue({
      _id: "1",
      email: "a@b.com",
      role: "user",
      password: "hashed",
      toObject: () => ({ _id: "1", email: "a@b.com", role: "user", password: "hashed" }),
    } as any);
    (bcryptUtil.compare as jest.Mock).mockResolvedValue(true);
    (GenerateTokens as jest.Mock).mockReturnValue({
      accessToken: "access",
      refreshToken: "refresh",
    });

    const result = await service.loginUser({
      email: "a@b.com",
      password: "Test123!@#",
    });

    expect(result.accessToken).toBe("access");
    expect(result.refreshToken).toBe("refresh");
    expect(result.user).toHaveProperty("email", "a@b.com");
    expect((result.user as any).password).toBeUndefined();
  });

  it("should return null when reset email not found", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue(null);

    const result = await service.sendResetPasswordEmail("missing@x.com");
    expect(result).toBeNull();
  });

  it("should send reset password email when user exists", async () => {
    const service = new UserServices();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue({ _id: "1", email: "a@b.com" } as any);
    (jwt.sign as jest.Mock).mockReturnValue("token");
    (sendEmail as jest.Mock).mockResolvedValue(undefined);

    const result = await service.sendResetPasswordEmail("a@b.com");
    expect(sendEmail).toHaveBeenCalled();
    expect(result).toEqual({ id: "1", email: "a@b.com" });
  });

  it("should reset password with valid token", async () => {
    const service = new UserServices();
    const repo = getRepo();
    (jwt.verify as jest.Mock).mockReturnValue({ id: "1" });
    repo.getUserById.mockResolvedValue({ _id: "1", email: "a@b.com" } as any);
    (bcryptUtil.generate as jest.Mock).mockResolvedValue("hashed");
    repo.updateOneUser.mockResolvedValue({ _id: "1" } as any);

    const result = await service.resetPassword("token", "NewPass123!@#");
    expect(result).toEqual({ id: "1", email: "a@b.com" });
  });
});
