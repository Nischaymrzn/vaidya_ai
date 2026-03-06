import { Router } from "express";
import { PaymentController } from "../controller/payment.controller";
import { middlewares } from "../middlewares/authorization.middleware";

const paymentRouter = Router();
const paymentController = new PaymentController();

paymentRouter.get(
  "/status",
  middlewares.isAuthenticated,
  paymentController.getPaymentStatus,
);
paymentRouter.post(
  "/checkout-session",
  middlewares.isAuthenticated,
  paymentController.createCheckoutSession,
);
paymentRouter.post("/webhook", paymentController.handleStripeWebhook);

export default paymentRouter;
