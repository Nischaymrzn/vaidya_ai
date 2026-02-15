"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiResponse {
    constructor(status = 200, message = "", data = {}, success = true) {
        this.status = status;
        this.message = message;
        this.data = data;
        this.success = success;
    }
}
exports.default = ApiResponse;
