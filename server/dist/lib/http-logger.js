"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const pino_http_1 = require("pino-http");
const logger_1 = require("./logger");
exports.httpLogger = (0, pino_http_1.pinoHttp)({ logger: logger_1.logger });
