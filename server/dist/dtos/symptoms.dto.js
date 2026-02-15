"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateSymptomsDto = exports.CreateSymptomsDto = void 0;
const zod_1 = __importDefault(require("zod"));
const symptoms_types_1 = require("../types/symptoms.types");
exports.CreateSymptomsDto = symptoms_types_1.SymptomsSchema.omit({ userId: true }).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateSymptomsDto = exports.CreateSymptomsDto.partial();
