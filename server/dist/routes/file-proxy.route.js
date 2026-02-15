"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_proxy_controller_1 = require("../controller/file-proxy.controller");
const fileProxyRouter = (0, express_1.Router)();
const fileProxyController = new file_proxy_controller_1.FileProxyController();
fileProxyRouter.get("/", fileProxyController.getFile);
exports.default = fileProxyRouter;
