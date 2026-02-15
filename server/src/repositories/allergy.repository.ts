import { Allergy, AllergyDb, AllergyDocument } from "../models/allergy.model";
import { AllergyType } from "../types/allergy.types";

export interface IAllergyRepository {
  create(data: Partial<AllergyType>): Promise<AllergyDocument>;
  getForUser(id: string, userId: string): Promise<AllergyDb | null>;
  getAllForUser(userId: string): Promise<AllergyDb[]>;
  update(
    id: string,
    userId: string,
    data: Partial<AllergyType>,
  ): Promise<AllergyDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class AllergyRepository implements IAllergyRepository {
  async create(data: Partial<AllergyType>): Promise<AllergyDocument> {
    return Allergy.create(data);
  }

  async getForUser(id: string, userId: string): Promise<AllergyDb | null> {
    return Allergy.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(userId: string): Promise<AllergyDb[]> {
    const records = await Allergy.find({ userId })
      .sort({ recordedAt: -1, createdAt: -1 })
      .lean();
    return records as AllergyDb[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<AllergyType>,
  ): Promise<AllergyDb | null> {
    return Allergy.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await Allergy.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
