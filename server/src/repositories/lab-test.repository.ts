import { LabTest, LabTestDb, LabTestDocument } from "../models/lab-test.model";
import { LabTestType } from "../types/lab-test.types";

export interface ILabTestRepository {
  create(data: Partial<LabTestType>): Promise<LabTestDocument>;
  getForUser(id: string, userId: string): Promise<LabTestDb | null>;
  getAllForUser(userId: string): Promise<LabTestDb[]>;
  getLatestForUser(userId: string): Promise<LabTestDb | null>;
  update(
    id: string,
    userId: string,
    data: Partial<LabTestType>,
  ): Promise<LabTestDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class LabTestRepository implements ILabTestRepository {
  async create(data: Partial<LabTestType>): Promise<LabTestDocument> {
    return LabTest.create(data);
  }

  async getForUser(id: string, userId: string): Promise<LabTestDb | null> {
    return LabTest.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
  ): Promise<LabTestDb[]> {
    const records = await LabTest.find({ userId })
      .sort({ testedDate: -1, createdAt: -1 })
      .lean();
    return records as LabTestDb[];
  }

  async getLatestForUser(userId: string): Promise<LabTestDb | null> {
    return LabTest.findOne({ userId })
      .sort({ testedDate: -1, createdAt: -1 })
      .lean();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<LabTestType>,
  ): Promise<LabTestDb | null> {
    return LabTest.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await LabTest.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
