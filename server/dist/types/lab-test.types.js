"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabTestSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.LabTestSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    testName: zod_1.default.string().min(1),
    resultValue: zod_1.default.string().optional(),
    normalRange: zod_1.default.string().optional(),
    unit: zod_1.default.string().optional(),
    testedDate: zod_1.default.coerce.date().optional(),
    reportFileId: zod_1.default.string().optional(),
    notes: zod_1.default.string().optional(),
});
