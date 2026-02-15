"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(status = 400, message) {
        super(message);
        this.status = status;
    }
    toJSON() {
        return {
            success: false,
            status: this.status,
            message: this.message,
            data: {},
        };
    }
}
exports.default = ApiError;
