import { AdminUserController } from "../../../src/controller/admin.controller";
import { AdminUserService } from "../../../src/services/admin.service";
import { uploadImageBuffer } from "../../../src/utils/cloudinary";

jest.mock("../../../src/services/admin.service");
jest.mock("../../../src/utils/cloudinary", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue({ url: "http://img" }),
}));

const AdminUserServiceMock = AdminUserService as jest.MockedClass<
  typeof AdminUserService
>;

const getService = () =>
  AdminUserServiceMock.mock.instances[0] as jest.Mocked<AdminUserService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AdminUserController", () => {
  beforeEach(() => {
    (uploadImageBuffer as jest.Mock).mockClear();
    const service = getService();
    service.createUser?.mockReset();
    service.getUserById?.mockReset();
    service.getAllUsers?.mockReset();
    service.updateOneUser?.mockReset();
    service.deleteOneUser?.mockReset();
  });

  it("should create user with profile picture", async () => {
    const controller = new AdminUserController();
    const service = getService();
    service.createUser.mockResolvedValue({ _id: "1", email: "a@b.com" } as any);

    const req: any = {
      body: {
        name: "A",
        email: "a@b.com",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      },
      file: { buffer: Buffer.from("x") },
    };
    const res = mockRes();

    await controller.createUser(req, res);

    expect(uploadImageBuffer).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 for invalid create payload", async () => {
    const controller = new AdminUserController();
    const req: any = { body: {} };
    const res = mockRes();

    await controller.createUser(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should get user by id", async () => {
    const controller = new AdminUserController();
    const service = getService();
    service.getUserById.mockResolvedValue({ _id: "1" } as any);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
