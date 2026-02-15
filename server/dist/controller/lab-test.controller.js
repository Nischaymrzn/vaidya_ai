"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LabTestController = void 0;
const zod_1 = __importDefault(require("zod"));
const lab_test_dto_1 = require("../dtos/lab-test.dto");
const lab_test_service_1 = require("../services/lab-test.service");
const labTestService = new lab_test_service_1.LabTestService();
function getUserId(req) {
    const authUser = req.user;
    const id = authUser?.id ?? authUser?._id;
    if (!id)
        return null;
    return String(id);
}
function normalizePayload(payload) {
    const normalized = { ...payload };
    if (normalized.testedDate === "") {
        delete normalized.testedDate;
    }
    if (normalized.recordId === "") {
        delete normalized.recordId;
    }
    return normalized;
}
class LabTestController {
    async createLabTest(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = lab_test_dto_1.CreateLabTestDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const labTest = await labTestService.createLabTest(userId, parsedData.data);
            return res.status(201).json({
                success: true,
                data: labTest,
                message: "Lab test created",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getLabTestById(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const labTestId = req.params.id;
            const labTest = await labTestService.getLabTestById(userId, labTestId);
            return res.status(200).json({
                success: true,
                data: labTest,
                message: "Lab test fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async getAllLabTests(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const result = await labTestService.getAllLabTests(userId);
            return res.status(200).json({
                success: true,
                data: result,
                message: "Lab tests fetched",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async updateLabTest(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const parsedData = lab_test_dto_1.UpdateLabTestDto.safeParse(normalizePayload(req.body ?? {}));
            if (!parsedData.success) {
                return res
                    .status(400)
                    .json({ success: false, message: zod_1.default.prettifyError(parsedData.error) });
            }
            const labTestId = req.params.id;
            const updated = await labTestService.updateLabTest(userId, labTestId, parsedData.data);
            return res.status(200).json({
                success: true,
                data: updated,
                message: "Lab test updated",
            });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
    async deleteLabTest(req, res) {
        try {
            const userId = getUserId(req);
            if (!userId) {
                return res
                    .status(401)
                    .json({ success: false, message: "Unauthorized" });
            }
            const labTestId = req.params.id;
            await labTestService.deleteLabTest(userId, labTestId);
            return res
                .status(200)
                .json({ success: true, message: "Lab test deleted" });
        }
        catch (error) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
exports.LabTestController = LabTestController;
