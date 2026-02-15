import {
  Symptoms,
  SymptomsDb,
  SymptomsDocument,
} from "../models/symptoms.model";
import { SymptomsType } from "../types/symptoms.types";

export interface ISymptomsRepository {
  create(data: Partial<SymptomsType>): Promise<SymptomsDocument>;
  getForUser(id: string, userId: string): Promise<SymptomsDb | null>;
  getAllForUser(userId: string): Promise<SymptomsDb[]>;
  getRecentForUser(userId: string, limit: number): Promise<SymptomsDb[]>;
  getLatestForUser(userId: string): Promise<SymptomsDb | null>;
  update(
    id: string,
    userId: string,
    data: Partial<SymptomsType>,
  ): Promise<SymptomsDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class SymptomsRepository implements ISymptomsRepository {
  async create(data: Partial<SymptomsType>): Promise<SymptomsDocument> {
    return Symptoms.create(data);
  }

  async getForUser(id: string, userId: string): Promise<SymptomsDb | null> {
    return Symptoms.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
  ): Promise<SymptomsDb[]> {
    const records = await Symptoms.find({ userId })
      .sort({ loggedAt: -1, createdAt: -1 })
      .lean();
    return records as SymptomsDb[];
  }

  async getRecentForUser(userId: string, limit: number): Promise<SymptomsDb[]> {
    const records = await Symptoms.find({ userId })
      .sort({ loggedAt: -1, createdAt: -1 })
      .limit(Math.max(1, limit))
      .lean();
    return records as SymptomsDb[];
  }

  async getLatestForUser(userId: string): Promise<SymptomsDb | null> {
    return Symptoms.findOne({ userId })
      .sort({ loggedAt: -1, createdAt: -1 })
      .lean();
  }

  async update(
    id: string,
    userId: string,
    data: Partial<SymptomsType>,
  ): Promise<SymptomsDb | null> {
    return Symptoms.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await Symptoms.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
