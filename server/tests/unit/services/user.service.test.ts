import { UserService } from "../../../src/services/user.service";
import { UserRepository } from "../../../src/repositories/user.repository";
import bcryptjs from "bcryptjs";

jest.mock("../../../src/repositories/user.repository");
jest.mock("bcryptjs");

const UserRepositoryMock = UserRepository as jest.MockedClass<
  typeof UserRepository
>;

const getRepo = () =>
  UserRepositoryMock.mock.instances[0] as jest.Mocked<UserRepository>;

describe("UserService", () => {
  beforeEach(() => {
    (bcryptjs.hash as jest.Mock).mockReset();
    const repo = getRepo();
    repo.getUserById?.mockReset();
    repo.getUserByEmail?.mockReset();
    repo.updateOneUser?.mockReset();
    repo.deleteOneUser?.mockReset();
  });

  it("should get user by id", async () => {
    const service = new UserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({ _id: "1" } as any);

    const result = await service.getUserById("1");
    expect(result).toHaveProperty("_id", "1");
  });

  it("should throw 404 when user not found", async () => {
    const service = new UserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue(null);

    await expect(service.getUserById("missing")).rejects.toHaveProperty(
      "status",
      404,
    );
  });

  it("should update user with hashed password when provided", async () => {
    const service = new UserService();
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
    const service = new UserService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({ _id: "1" } as any);
    repo.deleteOneUser.mockResolvedValue(true);

    const result = await service.deleteOneUser("1");
    expect(result).toBe(true);
  });
});
