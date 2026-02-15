"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicationsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.MedicationsSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    medicineName: zod_1.default.string().min(1),
    dosage: zod_1.default.string().optional(),
    frequency: zod_1.default.string().optional(),
    durationDays: zod_1.default.coerce.number().int().nonnegative().optional(),
    startDate: zod_1.default.coerce.date().optional(),
    endDate: zod_1.default.coerce.date().optional(),
    purpose: zod_1.default.string().optional(),
    diagnosis: zod_1.default.string().optional(),
    disease: zod_1.default.string().optional(),
    notes: zod_1.default.string().optional(),
});
