import { AuthController } from "../../../src/controller/auth.controller";
import { UserServices } from "../../../src/services/auth.service";

jest.mock("../../../src/services/auth.service");

const UserServicesMock = UserServices as jest.MockedClass<typeof UserServices>;

const getService = () =>
  UserServicesMock.mock.instances[0] as jest.Mocked<UserServices>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AuthController", () => {
  beforeEach(() => {
    const service = getService();
    service.createUser?.mockReset();
    service.loginUser?.mockReset();
    service.getCurrentUser?.mockReset();
  });

  it("should register user and return 201", async () => {
    const controller = new AuthController();
    const service = getService();
    service.createUser.mockResolvedValue({ id: "1", email: "a@b.com" } as any);

    const req: any = {
      body: {
        name: "A",
        email: "a@b.com",
        password: "Test123!@#",
        confirmPassword: "Test123!@#",
      },
    };
    const res = mockRes();
    const next = jest.fn();

    await controller.createUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it("should login user and return 201", async () => {
    const controller = new AuthController();
    const service = getService();
    service.loginUser.mockResolvedValue({
      accessToken: "access",
      refreshToken: "refresh",
      user: { id: "1" },
    } as any);

    const req: any = {
      body: { email: "a@b.com", password: "Test123!@#" },
    };
    const res = mockRes();
    const next = jest.fn();

    await controller.loginUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should call next when not authenticated", async () => {
    const controller = new AuthController();
    const req: any = {};
    const res = mockRes();
    const next = jest.fn();

    await controller.getCurrentUser(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
