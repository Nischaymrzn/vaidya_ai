"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMedicationsDto = exports.CreateMedicationsDto = void 0;
const zod_1 = __importDefault(require("zod"));
const medications_types_1 = require("../types/medications.types");
exports.CreateMedicationsDto = medications_types_1.MedicationsSchema.omit({
    userId: true,
}).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateMedicationsDto = exports.CreateMedicationsDto.partial();
