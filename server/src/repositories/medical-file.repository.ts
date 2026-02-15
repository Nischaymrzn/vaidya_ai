import {
  MedicalFile,
  MedicalFileDb,
  MedicalFileDocument,
} from "../models/medical-file.model";
import { MedicalFileType } from "../types/medical-file.types";

export interface IMedicalFileRepository {
  create(data: Partial<MedicalFileType>): Promise<MedicalFileDocument>;
  getForUser(id: string, userId: string): Promise<MedicalFileDb | null>;
  getAllForUser(userId: string): Promise<MedicalFileDb[]>;
  update(
    id: string,
    userId: string,
    data: Partial<MedicalFileType>,
  ): Promise<MedicalFileDb | null>;
  delete(id: string, userId: string): Promise<boolean | null>;
}

export class MedicalFileRepository implements IMedicalFileRepository {
  async create(data: Partial<MedicalFileType>): Promise<MedicalFileDocument> {
    return MedicalFile.create(data);
  }

  async getForUser(id: string, userId: string): Promise<MedicalFileDb | null> {
    return MedicalFile.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
  ): Promise<MedicalFileDb[]> {
    const records = await MedicalFile.find({ userId })
      .sort({ uploadedAt: -1, createdAt: -1 })
      .lean();
    return records as MedicalFileDb[];
  }

  async update(
    id: string,
    userId: string,
    data: Partial<MedicalFileType>,
  ): Promise<MedicalFileDb | null> {
    return MedicalFile.findOneAndUpdate({ _id: id, userId }, data, {
      new: true,
    }).lean();
  }

  async delete(id: string, userId: string): Promise<boolean | null> {
    const result = await MedicalFile.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }
}
