"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_insights_controller_1 = require("../controller/ai-insights.controller");
const authorization_middleware_1 = require("../middlewares/authorization.middleware");
const aiInsightsRouter = (0, express_1.Router)();
const aiInsightsController = new ai_insights_controller_1.AiInsightsController();
aiInsightsRouter.post("/", authorization_middleware_1.middlewares.isAuthenticated, authorization_middleware_1.middlewares.userOnlyMiddleware, aiInsightsController.generate);
exports.default = aiInsightsRouter;
