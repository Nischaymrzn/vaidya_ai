import {
  Medications,
  MedicationsDb,
  MedicationsDocument,
} from "../models/medications.model";
import { MedicationsType } from "../types/medications.types";

export interface IMedicationsRepository {
  create(data: Partial<MedicationsType>): Promise<MedicationsDocument>;
  getForUser(id: string, userId: string): Promise<MedicationsDb | null>;
  getAllForUser(userId: string): Promise<MedicationsDb[]>;
  getLatestForUser(userId: string): Promise<MedicationsDb | null>;
  update(
    id: string,
    userId: string,
    data: Partial<MedicationsType>,
  ): Promise<MedicationsDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class MedicationsRepository implements IMedicationsRepository {
  async create(data: Partial<MedicationsType>): Promise<MedicationsDocument> {
    return Medications.create(data);
  }

  async getForUser(id: string, userId: string): Promise<MedicationsDb | null> {
    return Medications.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
  ): Promise<MedicationsDb[]> {
    const records = await Medications.find({ userId })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
    return records as MedicationsDb[];
  }

  async getLatestForUser(userId: string): Promise<MedicationsDb | null> {
    return Medications.findOne({ userId })
      .sort({ startDate: -1, createdAt: -1 })
      .lean();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<MedicationsType>,
  ): Promise<MedicationsDb | null> {
    return Medications.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await Medications.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
