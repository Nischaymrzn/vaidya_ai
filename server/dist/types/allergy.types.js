"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllergySchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.AllergySchema = zod_1.default.object({
    userId: zod_1.default.string(),
    allergen: zod_1.default.string().min(1),
    type: zod_1.default
        .enum(["food", "drug", "environmental", "other"])
        .optional(),
    reaction: zod_1.default.string().optional(),
    severity: zod_1.default.enum(["mild", "moderate", "severe"]).optional(),
    status: zod_1.default.enum(["active", "resolved"]).optional(),
    onsetDate: zod_1.default.coerce.date().optional(),
    recordedAt: zod_1.default.coerce.date().optional(),
    notes: zod_1.default.string().optional(),
});
