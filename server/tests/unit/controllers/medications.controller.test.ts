import { MedicationsController } from "../../../src/controller/medications.controller";
import { MedicationsService } from "../../../src/services/medications.service";

jest.mock("../../../src/services/medications.service");

const MedicationsServiceMock = MedicationsService as jest.MockedClass<
  typeof MedicationsService
>;

const getService = () =>
  MedicationsServiceMock.mock.instances[0] as jest.Mocked<MedicationsService>;

const mockRes = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("MedicationsController", () => {
  beforeEach(() => {
    const service = getService();
    service.createMedication?.mockReset();
    service.getAllMedications?.mockReset();
    service.updateMedication?.mockReset();
    service.deleteMedication?.mockReset();
  });

  it("should return 401 when fetching medications without auth user", async () => {
    const controller = new MedicationsController();
    const req: any = {};
    const res = mockRes();

    await controller.getAllMedications(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("should create medication with valid payload", async () => {
    const controller = new MedicationsController();
    const service = getService();
    service.createMedication.mockResolvedValue({ _id: "m1" } as any);

    const req: any = {
      user: { id: "u1" },
      body: {
        medicineName: "Metformin",
        dosage: "500mg",
      },
    };
    const res = mockRes();

    await controller.createMedication(req, res);

    expect(service.createMedication).toHaveBeenCalledWith("u1", {
      medicineName: "Metformin",
      dosage: "500mg",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it("should return 400 when medication payload is invalid", async () => {
    const controller = new MedicationsController();
    const service = getService();
    const req: any = {
      user: { id: "u1" },
      body: {
        medicineName: "",
      },
    };
    const res = mockRes();

    await controller.createMedication(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(service.createMedication).not.toHaveBeenCalled();
  });
});

