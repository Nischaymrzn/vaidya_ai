"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../lib/logger");
const connectDB = async () => {
    try {
        const mongodbURI = env_1.env.MONGODB_URI || "";
        await mongoose_1.default.connect(mongodbURI);
        mongoose_1.default.connection.on("error", (err) => {
            logger_1.logger.error("Mongodb connection error", err);
        });
        mongoose_1.default.connection.on("disconnected", (err) => {
            logger_1.logger.error("Mongodb disconnected", err);
        });
        logger_1.logger.info("Mongodb connected successfully");
    }
    catch (error) {
        logger_1.logger.error(error);
        process.exit(1);
    }
};
exports.default = connectDB;
