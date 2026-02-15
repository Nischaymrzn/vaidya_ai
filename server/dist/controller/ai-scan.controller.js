"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiScanController = void 0;
const ai_scan_service_1 = require("../services/ai-scan.service");
const aiScanService = new ai_scan_service_1.AiScanService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
class AiScanController {
    async scanImage(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const file = req.file;
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "Image file is required",
                });
            }
            const recordType = typeof req.body?.recordType === "string"
                ? req.body.recordType
                : undefined;
            const result = await aiScanService.scanImage(file.buffer, recordType);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Scan completed",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.AiScanController = AiScanController;
