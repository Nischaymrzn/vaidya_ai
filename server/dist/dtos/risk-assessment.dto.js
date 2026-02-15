"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateRiskAssessmentDto = void 0;
const zod_1 = __importDefault(require("zod"));
exports.GenerateRiskAssessmentDto = zod_1.default.object({
    vitalsIds: zod_1.default.array(zod_1.default.string()).optional(),
    symptomsIds: zod_1.default.array(zod_1.default.string()).optional(),
    maxInsights: zod_1.default.coerce.number().int().min(1).max(8).optional(),
    notes: zod_1.default.string().optional(),
    useLatest: zod_1.default.coerce.boolean().optional(),
    includeAi: zod_1.default.coerce.boolean().optional(),
    reportId: zod_1.default.string().optional(),
});
