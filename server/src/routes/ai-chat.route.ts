import { Router } from "express";
import { AiChatController } from "../controller/ai-chat.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const aiChatRouter = Router();
const aiChatController = new AiChatController();

aiChatRouter.post(
  "/",
  middlewares.isAuthenticated,
  middlewares.userOnlyMiddleware,
  aiChatController.chat,
);

export default aiChatRouter;
