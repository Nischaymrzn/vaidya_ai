"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bcryptUtil = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const env_1 = require("../config/env");
exports.bcryptUtil = {
    async generate(password, saltRounds) {
        return await bcryptjs_1.default.hash(password + env_1.env.SECRET_KEY, saltRounds);
    },
    async compare(password, hash) {
        return await bcryptjs_1.default.compare(password + env_1.env.SECRET_KEY, hash);
    },
};
