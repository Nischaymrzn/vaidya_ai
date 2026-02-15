"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SymptomsSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.SymptomsSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    symptomList: zod_1.default.array(zod_1.default.string()).optional(),
    severity: zod_1.default.string().optional(),
    durationDays: zod_1.default.coerce.number().int().nonnegative().optional(),
    diagnosis: zod_1.default.string().optional(),
    disease: zod_1.default.string().optional(),
    notes: zod_1.default.string().optional(),
    loggedAt: zod_1.default.coerce.date().optional(),
});
