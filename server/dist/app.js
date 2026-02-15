"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const passport_1 = __importDefault(require("passport"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const passport_2 = require("./config/passport");
const rateLimiter_1 = __importDefault(require("./utils/rateLimiter"));
const routes_1 = __importDefault(require("./routes"));
const env_1 = require("./config/env");
const http_logger_1 = require("./lib/http-logger");
const logger_1 = require("./lib/logger");
const app = (0, express_1.default)();
app.use(rateLimiter_1.default);
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
(0, passport_2.configurePassport)();
app.use(passport_1.default.initialize());
app.use(`/${env_1.env.VERSION}/api/`, routes_1.default);
app.get("/", (req, res) => {
    res.send("Welcome to Vaidya api!");
});
(0, db_1.default)();
app.use(http_logger_1.httpLogger);
app.use((err, req, res, next) => {
    const status = err.status || 500;
    logger_1.logger.error(err);
    res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});
exports.default = app;
