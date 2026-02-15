"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateLabTestDto = exports.CreateLabTestDto = void 0;
const zod_1 = __importDefault(require("zod"));
const lab_test_types_1 = require("../types/lab-test.types");
exports.CreateLabTestDto = lab_test_types_1.LabTestSchema.omit({ userId: true }).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateLabTestDto = exports.CreateLabTestDto.partial();
