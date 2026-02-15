"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MedicalFileSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.MedicalFileSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    url: zod_1.default.string().url(),
    publicId: zod_1.default.string().optional(),
    type: zod_1.default.string().optional(),
    name: zod_1.default.string().optional(),
    size: zod_1.default.number().int().nonnegative().optional(),
    uploadedAt: zod_1.default.coerce.date().optional(),
});
