import { AllergyController } from "../../../src/controller/allergy.controller";
import { AllergyService } from "../../../src/services/allergy.service";

jest.mock("../../../src/services/allergy.service");

const AllergyServiceMock = AllergyService as jest.MockedClass<
  typeof AllergyService
>;

const getService = () =>
  AllergyServiceMock.mock.instances[0] as jest.Mocked<AllergyService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("AllergyController", () => {
  beforeEach(() => {
    const service = getService();
    service.createAllergy?.mockReset();
    service.getAllAllergies?.mockReset();
    service.updateAllergy?.mockReset();
    service.deleteAllergy?.mockReset();
  });

  it("should return 401 when user is not authenticated", async () => {
    const controller = new AllergyController();
    const req: any = { body: { allergen: "Dust" } };
    const res = mockRes();

    await controller.createAllergy(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should create allergy with valid payload", async () => {
    const controller = new AllergyController();
    const service = getService();
    service.createAllergy.mockResolvedValue({ _id: "a1" } as any);

    const req: any = {
      user: { id: "u1" },
      body: { allergen: "Dust", severity: "mild" },
    };
    const res = mockRes();

    await controller.createAllergy(req, res);

    expect(service.createAllergy).toHaveBeenCalledWith("u1", {
      allergen: "Dust",
      severity: "mild",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 for invalid allergy payload", async () => {
    const controller = new AllergyController();
    const service = getService();
    const req: any = {
      user: { id: "u1" },
      body: { allergen: "" },
    };
    const res = mockRes();

    await controller.createAllergy(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createAllergy).not.toHaveBeenCalled();
  });
});

