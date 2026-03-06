import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import ApiError from "../exceptions/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import errorMessages from "../constants/errorMessages";
import { PaymentService } from "../services/payment.service";

const paymentService = new PaymentService();

function resolveUserId(req: Request) {
  if (!req.user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      errorMessages.USER.UNAUTHORIZED,
    );
  }
  return req.user?.id ?? (req.user?._id != null ? String(req.user._id) : "");
}

export class PaymentController {
  getPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const userId = resolveUserId(req);
    const status = await paymentService.getPaymentStatus(userId);
    return res.json(new ApiResponse(StatusCodes.OK, "Payment status", status));
  });

  createCheckoutSession = asyncHandler(async (req: Request, res: Response) => {
    const userId = resolveUserId(req);
    const session = await paymentService.createCheckoutSession(userId);
    return res.json(
      new ApiResponse(
        StatusCodes.OK,
        "Stripe checkout session created",
        session,
      ),
    );
  });

  handleStripeWebhook = asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers["stripe-signature"];
    const signatureHeader = Array.isArray(signature) ? signature[0] : signature;
    const rawBody = (req as any).rawBody;

    if (!rawBody) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Missing webhook raw body. Check express.json verify config.",
      );
    }

    const result = await paymentService.handleWebhook(rawBody, signatureHeader);
    return res.json(new ApiResponse(StatusCodes.OK, "Webhook received", result));
  });
}
