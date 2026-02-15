"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateImmunizationDto = exports.CreateImmunizationDto = void 0;
const zod_1 = __importDefault(require("zod"));
const immunization_types_1 = require("../types/immunization.types");
exports.CreateImmunizationDto = immunization_types_1.ImmunizationSchema.omit({
    userId: true,
}).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateImmunizationDto = exports.CreateImmunizationDto.partial();
