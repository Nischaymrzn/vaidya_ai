"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDataDto = void 0;
const user_data_types_1 = require("../types/user-data.types");
exports.UpdateUserDataDto = user_data_types_1.UserDataSchema.omit({
    userId: true,
    latestVitals: true,
}).partial();
