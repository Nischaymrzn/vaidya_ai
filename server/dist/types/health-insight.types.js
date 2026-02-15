"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthInsightSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.HealthInsightSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    insightTitle: zod_1.default.string().min(1),
    description: zod_1.default.string().min(1),
    generatedFromRisk: zod_1.default.string().optional(),
    priority: zod_1.default.enum(["High", "Medium", "Low", "Info"]).optional(),
    createdAt: zod_1.default.coerce.date().optional(),
});
