import {
  MedicalRecord,
  MedicalRecordDb,
  MedicalRecordDocument,
} from "../models/medical-record.model";
import { MedicalRecordItem, MedicalRecordType } from "../types/medical-record.types";

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface IMedicalRecordRepository {
  createRecord(data: Partial<MedicalRecordType>): Promise<MedicalRecordDocument>;
  getRecordForUser(id: string, userId: string): Promise<MedicalRecordDb | null>;
  getAllForUser(
    userId: string,
    options?: PaginationParams,
  ): Promise<PaginatedResult<MedicalRecordDb>>;
  updateRecord(
    id: string,
    userId: string,
    data: Partial<MedicalRecordType>,
  ): Promise<MedicalRecordDb | null>;
  deleteRecord(id: string, userId: string): Promise<boolean | null>;
  addItem(
    id: string,
    userId: string,
    item: MedicalRecordItem,
  ): Promise<MedicalRecordDb | null>;
  removeItemByRef(
    userId: string,
    type: string,
    refId: string,
  ): Promise<boolean>;
}

export class MedicalRecordRepository implements IMedicalRecordRepository {
  async createRecord(
    data: Partial<MedicalRecordType>,
  ): Promise<MedicalRecordDocument> {
    return MedicalRecord.create(data);
  }

  async getRecordForUser(
    id: string,
    userId: string,
  ): Promise<MedicalRecordDb | null> {
    return MedicalRecord.findOne({ _id: id, userId }).lean();
  }

  async getAllForUser(
    userId: string,
    options?: PaginationParams,
  ): Promise<PaginatedResult<MedicalRecordDb>> {
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.min(100, Math.max(1, options?.limit ?? 10));

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      MedicalRecord.find({ userId })
        .sort({ recordDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      MedicalRecord.countDocuments({ userId }),
    ]);

    return {
      data: records as MedicalRecordDb[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }

  async updateRecord(
    id: string,
    userId: string,
    data: Partial<MedicalRecordType>,
  ): Promise<MedicalRecordDb | null> {
    const updatedRecord = await MedicalRecord.findOneAndUpdate(
      { _id: id, userId },
      data,
      { new: true },
    ).lean();
    return updatedRecord;
  }

  async deleteRecord(id: string, userId: string): Promise<boolean | null> {
    const result = await MedicalRecord.findOneAndDelete({ _id: id, userId });
    return result ? true : null;
  }

  async addItem(
    id: string,
    userId: string,
    item: MedicalRecordItem,
  ): Promise<MedicalRecordDb | null> {
    return MedicalRecord.findOneAndUpdate(
      { _id: id, userId },
      { $addToSet: { items: item } },
      { new: true },
    ).lean();
  }

  async removeItemByRef(
    userId: string,
    type: string,
    refId: string,
  ): Promise<boolean> {
    const result = await MedicalRecord.updateMany(
      { userId },
      { $pull: { items: { type, refId } } },
    );
    return result.acknowledged ?? false;
  }
}
