"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVitalsDto = exports.CreateVitalsDto = void 0;
const zod_1 = __importDefault(require("zod"));
const vitals_types_1 = require("../types/vitals.types");
exports.CreateVitalsDto = vitals_types_1.VitalsSchema.omit({ userId: true }).extend({
    recordId: zod_1.default.string().optional(),
});
exports.UpdateVitalsDto = exports.CreateVitalsDto.partial();
