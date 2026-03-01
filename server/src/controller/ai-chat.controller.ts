import { Request, Response } from "express";
import { AiChatService, ChatMessage } from "../services/ai-chat.service";

const aiChatService = new AiChatService();

function getUserId(req: Request): string | null {
  const authUser = req.user as { _id?: unknown; id?: string } | undefined;
  const id = authUser?.id ?? authUser?._id;
  if (!id) return null;
  return String(id);
}

const normalizeMessages = (messages: unknown): ChatMessage[] => {
  if (!Array.isArray(messages)) return [];
  return messages
    .map((message) => {
      if (!message || typeof message !== "object") return null;
      const role = (message as { role?: string }).role;
      const content = (message as { content?: string }).content;
      if (role !== "user" && role !== "assistant") return null;
      if (typeof content !== "string" || !content.trim()) return null;
      return { role, content: content.trim() };
    })
    .filter((message): message is ChatMessage => Boolean(message));
};

export class AiChatController {
  async chat(req: Request, res: Response) {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const messages = normalizeMessages(req.body?.messages);
      const doctor = typeof req.body?.doctor === "string" ? req.body.doctor : undefined;
      const includeHealthContext = true;

      if (!messages.length) {
        return res.status(400).json({
          success: false,
          message: "messages are required",
        });
      }

      const reply = await aiChatService.reply({
        userId,
        messages,
        doctor,
        includeHealthContext,
      });

      return res.status(200).json({
        success: true,
        reply,
      });
    } catch (error: Error | any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }
}
