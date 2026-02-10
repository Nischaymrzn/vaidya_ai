import { AdminUserService } from "../../../src/services/admin.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import { bcryptUtil } from "../../../src/utils/bcrypt";
import bcryptjs from "bcryptjs";

jest.mock("../../../src/repositories/user.repository");
jest.mock("../../../src/utils/bcrypt");
jest.mock("bcryptjs");

const UserRepositoryMock = UserRepository as jest.MockedClass<
  typeof UserRepository
>;

const getRepo = () =>
  UserRepositoryMock.mock.instances[0] as jest.Mocked<UserRepository>;

describe("AdminUserService", () => {
  beforeEach(() => {
    (bcryptUtil.generate as jest.Mock).mockReset();
    (bcryptjs.hash as jest.Mock).mockReset();
    const repo = getRepo();
    repo.getUserByEmail?.mockReset();
    repo.getUserById?.mockReset();
    repo.createUser?.mockReset();
    repo.updateOneUser?.mockReset();
    repo.deleteOneUser?.mockReset();
  });

  it("should create a user with hashed password", async () => {
    const service = new AdminUserService();
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

    expect(bcryptUtil.generate).toHaveBeenCalledWith("Test123!@#", 12);
    expect(repo.createUser).toHaveBeenCalled();
    expect(result).toHaveProperty("email", "a@b.com");
  });

  it("should throw if email exists", async () => {
    const service = new AdminUserService();
    const repo = getRepo();
    repo.getUserByEmail.mockResolvedValue({} as any);

    await expect(
      service.createUser({
        name: "A",
        email: "a@b.com",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      } as any),
    ).rejects.toHaveProperty("status", 409);
  });

  it("should throw 404 if user not found", async () => {
    const service = new AdminUserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue(null);

    await expect(service.getUserById("missing")).rejects.toHaveProperty(
      "status",
      404,
    );
  });

  it("should update user with hashed password when provided", async () => {
    const service = new AdminUserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({ _id: "1", email: "a@b.com" } as any);
    (bcryptjs.hash as jest.Mock).mockResolvedValue("hashed");
    repo.updateOneUser.mockResolvedValue({ _id: "1", name: "B" } as any);

    const result = await service.updateOneUser("1", {
      email: "a@b.com",
      password: "NewPass123!@#",
    } as any);

    expect(bcryptjs.hash).toHaveBeenCalledWith("NewPass123!@#", 10);
    expect(result).toHaveProperty("name", "B");
  });

  it("should delete user when exists", async () => {
    const service = new AdminUserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({ _id: "1" } as any);
    repo.deleteOneUser.mockResolvedValue(true);

    const result = await service.deleteOneUser("1");

    expect(result).toBe(true);
  });
});
