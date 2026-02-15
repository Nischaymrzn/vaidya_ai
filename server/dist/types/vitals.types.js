"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VitalsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.VitalsSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    systolicBp: zod_1.default.coerce.number().int().nonnegative().optional(),
    diastolicBp: zod_1.default.coerce.number().int().nonnegative().optional(),
    glucoseLevel: zod_1.default.coerce.number().nonnegative().optional(),
    heartRate: zod_1.default.coerce.number().int().nonnegative().optional(),
    weight: zod_1.default.coerce.number().nonnegative().optional(),
    height: zod_1.default.coerce.number().nonnegative().optional(),
    bmi: zod_1.default.coerce.number().nonnegative().optional(),
    recordedAt: zod_1.default.coerce.date().optional(),
    notes: zod_1.default.string().optional(),
});
