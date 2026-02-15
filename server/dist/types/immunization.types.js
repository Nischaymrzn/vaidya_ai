"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImmunizationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.ImmunizationSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    vaccineName: zod_1.default.string().min(1),
    date: zod_1.default.coerce.date().optional(),
    doseNumber: zod_1.default.coerce.number().int().nonnegative().optional(),
    series: zod_1.default.string().optional(),
    manufacturer: zod_1.default.string().optional(),
    lotNumber: zod_1.default.string().optional(),
    site: zod_1.default.string().optional(),
    route: zod_1.default.string().optional(),
    provider: zod_1.default.string().optional(),
    nextDue: zod_1.default.coerce.date().optional(),
    notes: zod_1.default.string().optional(),
});
