import {
  Immunization,
  ImmunizationDb,
  ImmunizationDocument,
} from "../models/immunization.model";
import { ImmunizationType } from "../types/immunization.types";

export interface IImmunizationRepository {
  create(data: Partial<ImmunizationType>): Promise<ImmunizationDocument>;
  getForUser(id: string, userId: string): Promise<ImmunizationDb | null>;
  getAllForUser(userId: string): Promise<ImmunizationDb[]>;
  update(
    id: string,
    userId: string,
    data: Partial<ImmunizationType>,
  ): Promise<ImmunizationDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class ImmunizationRepository implements IImmunizationRepository {
  async create(data: Partial<ImmunizationType>): Promise<ImmunizationDocument> {
    return Immunization.create(data);
  }

  async getForUser(
    id: string,
    userId: string,
  ): Promise<ImmunizationDb | null> {
    return Immunization.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(userId: string): Promise<ImmunizationDb[]> {
    const records = await Immunization.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .lean();
    return records as ImmunizationDb[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<ImmunizationType>,
  ): Promise<ImmunizationDb | null> {
    return Immunization.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await Immunization.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
