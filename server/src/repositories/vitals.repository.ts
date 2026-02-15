import { Vitals, VitalsDb, VitalsDocument } from "../models/vitals.model";
import { VitalsType } from "../types/vitals.types";

export interface IVitalsRepository {
  create(data: Partial<VitalsType>): Promise<VitalsDocument>;
  getForUser(id: string, userId: string): Promise<VitalsDb | null>;
  getAllForUser(userId: string): Promise<VitalsDb[]>;
  getRecentForUser(userId: string, limit: number): Promise<VitalsDb[]>;
  getLatestForUser(userId: string): Promise<VitalsDb | null>;
  update(
    id: string,
    userId: string,
    data: Partial<VitalsType>,
  ): Promise<VitalsDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class VitalsRepository implements IVitalsRepository {
  async create(data: Partial<VitalsType>): Promise<VitalsDocument> {
    return Vitals.create(data);
  }

  async getForUser(id: string, userId: string): Promise<VitalsDb | null> {
    return Vitals.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
  ): Promise<VitalsDb[]> {
    const records = await Vitals.find({ userId })
      .sort({ recordedAt: -1, createdAt: -1 })
      .lean();
    return records as VitalsDb[];
  }

  async getRecentForUser(userId: string, limit: number): Promise<VitalsDb[]> {
    const records = await Vitals.find({ userId })
      .sort({ recordedAt: -1, createdAt: -1 })
      .limit(Math.max(1, limit))
      .lean();
    return records as VitalsDb[];
  }

  async getLatestForUser(userId: string): Promise<VitalsDb | null> {
    return Vitals.findOne({ userId })
      .sort({ recordedAt: -1, createdAt: -1 })
      .lean();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<VitalsType>,
  ): Promise<VitalsDb | null> {
    return Vitals.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await Vitals.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
