"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicalFileDto = exports.CreateMedicalFileDto = void 0;
const zod_1 = __importDefault(require("zod"));
const medical_file_types_1 = require("../types/medical-file.types");
exports.CreateMedicalFileDto = medical_file_types_1.MedicalFileSchema.omit({
    userId: true,
    url: true,
    publicId: true,
    type: true,
    name: true,
    size: true,
    uploadedAt: true,
}).extend({
    recordId: zod_1.default.string().optional(),
    url: zod_1.default.string().url().optional(),
});
exports.UpdateMedicalFileDto = exports.CreateMedicalFileDto.partial();
