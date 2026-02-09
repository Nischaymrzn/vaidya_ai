import { UserController } from "../../../src/controller/user.controller";
import { UserService } from "../../../src/services/user.service";
import { uploadImageBuffer } from "../../../src/utils/cloudinary";

jest.mock("../../../src/services/user.service");
jest.mock("../../../src/utils/cloudinary", () => ({
  uploadImageBuffer: jest.fn().mockResolvedValue({ url: "http://img" }),
}));

const UserServiceMock = UserService as jest.MockedClass<typeof UserService>;

const getService = () =>
  UserServiceMock.mock.instances[0] as jest.Mocked<UserService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("UserController", () => {
  beforeEach(() => {
    (uploadImageBuffer as jest.Mock).mockClear();
    const service = getService();
    service.getUserById?.mockReset();
    service.updateOneUser?.mockReset();
    service.deleteOneUser?.mockReset();
  });

  it("should get user by id", async () => {
    const controller = new UserController();
    const service = getService();
    service.getUserById.mockResolvedValue({ _id: "1" } as any);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.getUserById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should update user and upload profile picture when file provided", async () => {
    const controller = new UserController();
    const service = getService();
    service.updateOneUser.mockResolvedValue({ _id: "1", name: "B" } as any);

    const req: any = {
      params: { id: "1" },
      body: { name: "B", email: "a@b.com" },
      file: { buffer: Buffer.from("x") },
    };
    const res = mockRes();

    await controller.updateOneUser(req, res);

    expect(uploadImageBuffer).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should delete user", async () => {
    const controller = new UserController();
    const service = getService();
    service.deleteOneUser.mockResolvedValue(true);

    const req: any = { params: { id: "1" } };
    const res = mockRes();

    await controller.deleteOneUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
