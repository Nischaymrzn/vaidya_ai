import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import ApiError from "../exceptions/apiError";
import { env } from "../config/env";
import { UserRepository } from "../repositories/user.repository";

const userRepository = new UserRepository();

function normalizeEnvValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/,+$/g, "");
}

function requireStripeConfig() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Stripe is not configured. Missing STRIPE_SECRET_KEY.",
    );
  }
  const hasPriceId = Boolean(normalizeEnvValue(env.STRIPE_PRICE_ID));
  const hasDynamicAmount = Number.isFinite(env.STRIPE_TEST_AMOUNT) &&
    env.STRIPE_TEST_AMOUNT > 0;

  if (!hasPriceId && !hasDynamicAmount) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Stripe is not configured. Provide STRIPE_PRICE_ID or STRIPE_TEST_AMOUNT.",
    );
  }

  if (
    env.NODE_ENV !== "production" &&
    !env.STRIPE_SECRET_KEY.startsWith("sk_test_")
  ) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Use Stripe test/sandbox key (sk_test_...) for development.",
    );
  }
}

function getStripeClient() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Stripe is not configured. Missing STRIPE_SECRET_KEY.",
    );
  }
  return new Stripe(env.STRIPE_SECRET_KEY);
}

function buildSuccessUrl() {
  if (env.STRIPE_SUCCESS_URL) return env.STRIPE_SUCCESS_URL;
  return `${env.CLIENT_URL.replace(/\/$/, "")}/profile?payment=success&session_id={CHECKOUT_SESSION_ID}`;
}

function buildCancelUrl() {
  if (env.STRIPE_CANCEL_URL) return env.STRIPE_CANCEL_URL;
  return `${env.CLIENT_URL.replace(/\/$/, "")}/profile?payment=cancelled`;
}

export class PaymentService {
  async getPaymentStatus(userId: string) {
    const currentUser = await userRepository.getUserById(userId);
    if (!currentUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return {
      isPremium: !!currentUser.isPremium,
      role: currentUser.role,
      plan: currentUser.isPremium ? "premium" : "free",
      stripeCustomerId: currentUser.stripeCustomerId ?? null,
    };
  }

  async createCheckoutSession(userId: string) {
    requireStripeConfig();
    const stripe = getStripeClient();

    const currentUser = await userRepository.getUserById(userId);
    if (!currentUser) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    let stripeCustomerId = currentUser.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: currentUser.email,
        name: currentUser.name,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await userRepository.updateOneUser(userId, { stripeCustomerId });
    }

    const currency = normalizeEnvValue(env.STRIPE_CURRENCY).toLowerCase();
    if (!currency) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid STRIPE_CURRENCY value.",
      );
    }

    const priceId = normalizeEnvValue(env.STRIPE_PRICE_ID);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      priceId
        ? [
            {
              price: priceId,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency,
                unit_amount: Math.round(env.STRIPE_TEST_AMOUNT),
                product_data: {
                  name: "Vaidya Premium (Test)",
                  description: "Unlock PDF report downloads in test mode",
                },
              },
              quantity: 1,
            },
          ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: lineItems,
      metadata: {
        userId,
        feature: "premium_pdf_download",
      },
      success_url: buildSuccessUrl(),
      cancel_url: buildCancelUrl(),
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  }

  async handleWebhook(payload: Buffer | string, signature?: string) {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Stripe webhook is not configured. Missing STRIPE_WEBHOOK_SECRET.",
      );
    }

    if (!signature) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Missing Stripe signature.");
    }

    const stripe = getStripeClient();
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadataUserId = session.metadata?.userId;

      if (metadataUserId) {
        await userRepository.updateOneUser(metadataUserId, { isPremium: true });
      } else if (typeof session.customer === "string") {
        const customerUser = await userRepository.getUserByStripeCustomerId(
          session.customer,
        );
        if (customerUser) {
          await userRepository.updateOneUser(String(customerUser._id), {
            isPremium: true,
          });
        }
      }
    }

    return { received: true };
  }
}
