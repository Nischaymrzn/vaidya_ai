"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_status_codes_1 = require("http-status-codes");
const apiError_1 = __importDefault(require("../exceptions/apiError"));
const apiResponse_1 = __importDefault(require("../utils/apiResponse"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const auth_service_1 = require("../services/auth.service");
const responseMessages_1 = __importDefault(require("../constants/responseMessages"));
const user_dto_1 = require("../dtos/user.dto");
const errorMessages_1 = __importDefault(require("../constants/errorMessages"));
const userServices = new auth_service_1.UserServices();
class AuthController {
    constructor() {
        this.createUser = (0, asyncHandler_1.default)(async (req, res) => {
            const parsedData = user_dto_1.CreateUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: parsedData.error.flatten().fieldErrors,
                });
            }
            const createdUser = await userServices.createUser(parsedData.data);
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(new apiResponse_1.default(201, responseMessages_1.default.USER.CREATED, createdUser));
        });
        this.loginUser = (0, asyncHandler_1.default)(async (req, res) => {
            const parsedData = user_dto_1.loginUserDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: parsedData.error.flatten().fieldErrors,
                });
            }
            const { accessToken, refreshToken, user } = await userServices.loginUser(parsedData.data);
            return res.status(http_status_codes_1.StatusCodes.CREATED).json(new apiResponse_1.default(201, responseMessages_1.default.USER.LOGGED_IN, {
                user,
                accessToken,
                refreshToken,
            }));
        });
        this.getCurrentUser = (0, asyncHandler_1.default)(async (req, res) => {
            if (!req.user) {
                throw new apiError_1.default(http_status_codes_1.StatusCodes.UNAUTHORIZED, errorMessages_1.default.USER.UNAUTHORIZED);
            }
            const userId = req.user?.id ?? (req.user?._id != null ? String(req.user._id) : "");
            const currentUser = await userServices.getCurrentUser(userId);
            return res.json(new apiResponse_1.default(http_status_codes_1.StatusCodes.OK, responseMessages_1.default.USER.RETRIEVED, currentUser));
        });
        this.sendResetPasswordEmail = (0, asyncHandler_1.default)(async (req, res) => {
            const parsedData = user_dto_1.requestPasswordResetDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: parsedData.error.flatten().fieldErrors,
                });
            }
            await userServices.sendResetPasswordEmail(parsedData.data.email);
            return res.json(new apiResponse_1.default(http_status_codes_1.StatusCodes.OK, "If the email is registered, a reset link has been sent.", {}));
        });
        this.resetPassword = (0, asyncHandler_1.default)(async (req, res) => {
            const parsedData = user_dto_1.resetPasswordDTO.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    status: 400,
                    message: parsedData.error.flatten().fieldErrors,
                });
            }
            const token = req.params.token;
            await userServices.resetPassword(token, parsedData.data.newPassword);
            return res.json(new apiResponse_1.default(http_status_codes_1.StatusCodes.OK, "Password has been reset successfully.", {}));
        });
    }
}
exports.AuthController = AuthController;
