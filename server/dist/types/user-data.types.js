"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.UserDataSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    fullName: zod_1.default.string().optional(),
    dob: zod_1.default.coerce.date().optional(),
    gender: zod_1.default.string().optional(),
    heightCm: zod_1.default.coerce.number().int().nonnegative().optional(),
    weightKg: zod_1.default.coerce.number().nonnegative().optional(),
    bloodGroup: zod_1.default.string().optional(),
    phone: zod_1.default.string().optional(),
    address: zod_1.default.string().optional(),
    emergencyContact: zod_1.default.string().optional(),
    latestVitals: zod_1.default
        .object({
        refId: zod_1.default.string().optional(),
        recordedAt: zod_1.default.coerce.date().optional(),
        systolicBp: zod_1.default.coerce.number().int().nonnegative().optional(),
        diastolicBp: zod_1.default.coerce.number().int().nonnegative().optional(),
        glucoseLevel: zod_1.default.coerce.number().nonnegative().optional(),
        heartRate: zod_1.default.coerce.number().int().nonnegative().optional(),
        weight: zod_1.default.coerce.number().nonnegative().optional(),
        height: zod_1.default.coerce.number().nonnegative().optional(),
        bmi: zod_1.default.coerce.number().nonnegative().optional(),
    })
        .optional(),
});
