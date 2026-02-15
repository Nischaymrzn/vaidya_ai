"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateAllergyDto = exports.CreateAllergyDto = void 0;
const zod_1 = __importDefault(require("zod"));
const allergy_types_1 = require("../types/allergy.types");
exports.CreateAllergyDto = allergy_types_1.AllergySchema.omit({ userId: true }).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateAllergyDto = exports.CreateAllergyDto.partial();
