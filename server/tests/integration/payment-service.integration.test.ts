import { StatusCodes } from "http-status-codes";
import Stripe from "stripe";
import { env } from "../../src/config/env";

const repoMock = {
  getUserById: jest.fn(),
  updateOneUser: jest.fn(),
  getUserByStripeCustomerId: jest.fn(),
};

jest.mock("../../src/repositories/user.repository", () => ({
  UserRepository: jest.fn().mockImplementation(() => repoMock),
}));
jest.mock("stripe", () => jest.fn());

const { PaymentService } = require("../../src/services/payment.service") as {
  PaymentService: new () => any;
};

const StripeCtorMock = Stripe as unknown as jest.Mock;

const getRepo = () => repoMock as any;

describe("PaymentService", () => {
  const envBackup = { ...env };

  const mockStripeClient = {
    customers: {
      create: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    StripeCtorMock.mockImplementation(() => mockStripeClient);
    const repo = getRepo();
    repo.getUserById?.mockReset();
    repo.updateOneUser?.mockReset();
    repo.getUserByStripeCustomerId?.mockReset();

    env.NODE_ENV = "test";
    env.CLIENT_URL = "http://localhost:3000/";
    env.STRIPE_SECRET_KEY = "sk_test_123";
    env.STRIPE_WEBHOOK_SECRET = "whsec_123";
    env.STRIPE_PRICE_ID = "price_123";
    env.STRIPE_TEST_AMOUNT = 500;
    env.STRIPE_CURRENCY = "usd";
    env.STRIPE_SUCCESS_URL = "";
    env.STRIPE_CANCEL_URL = "";
  });

  afterAll(() => {
    Object.assign(env, envBackup);
  });

  it("throws when payment status is requested for unknown user", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue(null);

    await expect(service.getPaymentStatus("u404")).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("returns free-plan payment status", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({
      _id: "u1",
      role: "user",
      isPremium: false,
      stripeCustomerId: null,
    } as any);

    const result = await service.getPaymentStatus("u1");

    expect(result).toEqual({
      isPremium: false,
      role: "user",
      plan: "free",
      stripeCustomerId: null,
    });
  });

  it("returns premium-plan payment status", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({
      _id: "u2",
      role: "user",
      isPremium: true,
      stripeCustomerId: "cus_1",
    } as any);

    const result = await service.getPaymentStatus("u2");

    expect(result.plan).toBe("premium");
    expect(result.stripeCustomerId).toBe("cus_1");
  });

  it("rejects checkout session when STRIPE_SECRET_KEY is missing", async () => {
    const service = new PaymentService();
    env.STRIPE_SECRET_KEY = "";

    await expect(service.createCheckoutSession("u1")).rejects.toHaveProperty(
      "status",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  });

  it("rejects checkout when both priceId and dynamic amount are unavailable", async () => {
    const service = new PaymentService();
    env.STRIPE_PRICE_ID = "";
    env.STRIPE_TEST_AMOUNT = 0;

    await expect(service.createCheckoutSession("u1")).rejects.toHaveProperty(
      "status",
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  });

  it("rejects non-test key outside production", async () => {
    const service = new PaymentService();
    env.STRIPE_SECRET_KEY = "sk_live_abc";

    await expect(service.createCheckoutSession("u1")).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
  });

  it("throws when checkout is requested for unknown user", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue(null);

    await expect(service.createCheckoutSession("unknown")).rejects.toHaveProperty(
      "status",
      StatusCodes.NOT_FOUND,
    );
  });

  it("creates customer when user has no stripe customer id", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({
      _id: "u3",
      email: "u3@example.com",
      name: "User 3",
      stripeCustomerId: "",
    } as any);
    mockStripeClient.customers.create.mockResolvedValue({ id: "cus_new" });
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_1",
      url: "https://stripe.example/checkout/cs_1",
    });

    await service.createCheckoutSession("u3");

    expect(mockStripeClient.customers.create).toHaveBeenCalledWith({
      email: "u3@example.com",
      name: "User 3",
      metadata: { userId: "u3" },
    });
    expect(repo.updateOneUser).toHaveBeenCalledWith("u3", {
      stripeCustomerId: "cus_new",
    });
  });

  it("reuses existing stripe customer id", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({
      _id: "u4",
      email: "u4@example.com",
      name: "User 4",
      stripeCustomerId: "cus_existing",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_2",
      url: "https://stripe.example/checkout/cs_2",
    });

    await service.createCheckoutSession("u4");

    expect(mockStripeClient.customers.create).not.toHaveBeenCalled();
    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        customer: "cus_existing",
      }),
    );
  });

  it("uses normalized quoted price id in line items", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.STRIPE_PRICE_ID = "\"price_test_123\"";
    repo.getUserById.mockResolvedValue({
      _id: "u5",
      email: "u5@example.com",
      name: "User 5",
      stripeCustomerId: "cus_5",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_3",
      url: "https://stripe.example/checkout/cs_3",
    });

    await service.createCheckoutSession("u5");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_test_123", quantity: 1 }],
      }),
    );
  });

  it("uses dynamic amount line item when price id is not provided", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.STRIPE_PRICE_ID = "";
    env.STRIPE_TEST_AMOUNT = 799;
    repo.getUserById.mockResolvedValue({
      _id: "u6",
      email: "u6@example.com",
      name: "User 6",
      stripeCustomerId: "cus_6",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_4",
      url: "https://stripe.example/checkout/cs_4",
    });

    await service.createCheckoutSession("u6");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              unit_amount: 799,
            }),
          }),
        ],
      }),
    );
  });

  it("rejects checkout when currency value is blank", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.STRIPE_PRICE_ID = "";
    env.STRIPE_TEST_AMOUNT = 500;
    env.STRIPE_CURRENCY = "   ";
    repo.getUserById.mockResolvedValue({
      _id: "u7",
      email: "u7@example.com",
      name: "User 7",
      stripeCustomerId: "cus_7",
    } as any);

    await expect(service.createCheckoutSession("u7")).rejects.toHaveProperty(
      "status",
      StatusCodes.BAD_REQUEST,
    );
  });

  it("uses configured success URL when provided", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.STRIPE_SUCCESS_URL = "https://client.example/success";
    repo.getUserById.mockResolvedValue({
      _id: "u8",
      email: "u8@example.com",
      name: "User 8",
      stripeCustomerId: "cus_8",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_5",
      url: "https://stripe.example/checkout/cs_5",
    });

    await service.createCheckoutSession("u8");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url: "https://client.example/success",
      }),
    );
  });

  it("builds fallback success URL from CLIENT_URL", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.CLIENT_URL = "http://localhost:3000/";
    repo.getUserById.mockResolvedValue({
      _id: "u9",
      email: "u9@example.com",
      name: "User 9",
      stripeCustomerId: "cus_9",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_6",
      url: "https://stripe.example/checkout/cs_6",
    });

    await service.createCheckoutSession("u9");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        success_url:
          "http://localhost:3000/profile?payment=success&session_id={CHECKOUT_SESSION_ID}",
      }),
    );
  });

  it("uses configured cancel URL when provided", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.STRIPE_CANCEL_URL = "https://client.example/cancel";
    repo.getUserById.mockResolvedValue({
      _id: "u10",
      email: "u10@example.com",
      name: "User 10",
      stripeCustomerId: "cus_10",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_7",
      url: "https://stripe.example/checkout/cs_7",
    });

    await service.createCheckoutSession("u10");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "https://client.example/cancel",
      }),
    );
  });

  it("builds fallback cancel URL from CLIENT_URL", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    env.CLIENT_URL = "http://localhost:3000/";
    env.STRIPE_CANCEL_URL = "";
    repo.getUserById.mockResolvedValue({
      _id: "u11",
      email: "u11@example.com",
      name: "User 11",
      stripeCustomerId: "cus_11",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_8",
      url: "https://stripe.example/checkout/cs_8",
    });

    await service.createCheckoutSession("u11");

    expect(mockStripeClient.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({
        cancel_url: "http://localhost:3000/profile?payment=cancelled",
      }),
    );
  });

  it("returns checkout url and session id", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    repo.getUserById.mockResolvedValue({
      _id: "u12",
      email: "u12@example.com",
      name: "User 12",
      stripeCustomerId: "cus_12",
    } as any);
    mockStripeClient.checkout.sessions.create.mockResolvedValue({
      id: "cs_9",
      url: "https://stripe.example/checkout/cs_9",
    });

    const result = await service.createCheckoutSession("u12");

    expect(result).toEqual({
      checkoutUrl: "https://stripe.example/checkout/cs_9",
      sessionId: "cs_9",
    });
  });

  it("rejects webhook handling when webhook secret is missing", async () => {
    const service = new PaymentService();
    env.STRIPE_WEBHOOK_SECRET = "";

    await expect(
      service.handleWebhook(Buffer.from("payload"), "sig"),
    ).rejects.toHaveProperty("status", StatusCodes.INTERNAL_SERVER_ERROR);
  });

  it("rejects webhook handling when signature is missing", async () => {
    const service = new PaymentService();

    await expect(
      service.handleWebhook(Buffer.from("payload")),
    ).rejects.toHaveProperty("status", StatusCodes.BAD_REQUEST);
  });

  it("marks user premium when checkout completed includes metadata.userId", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: { userId: "u-meta" },
          customer: "cus_meta",
        },
      },
    });

    const result = await service.handleWebhook(Buffer.from("payload"), "sig");

    expect(mockStripeClient.webhooks.constructEvent).toHaveBeenCalled();
    expect(repo.updateOneUser).toHaveBeenCalledWith("u-meta", { isPremium: true });
    expect(result).toEqual({ received: true });
  });

  it("marks user premium through customer lookup when metadata.userId is absent", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: {},
          customer: "cus_lookup",
        },
      },
    });
    repo.getUserByStripeCustomerId.mockResolvedValue({ _id: "u-customer" } as any);

    await service.handleWebhook(Buffer.from("payload"), "sig");

    expect(repo.getUserByStripeCustomerId).toHaveBeenCalledWith("cus_lookup");
    expect(repo.updateOneUser).toHaveBeenCalledWith("u-customer", { isPremium: true });
  });

  it("does not update user when customer lookup returns null", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: "checkout.session.completed",
      data: {
        object: {
          metadata: {},
          customer: "cus_missing",
        },
      },
    });
    repo.getUserByStripeCustomerId.mockResolvedValue(null);

    await service.handleWebhook(Buffer.from("payload"), "sig");

    expect(repo.updateOneUser).not.toHaveBeenCalled();
  });

  it("ignores non-checkout webhook events", async () => {
    const service = new PaymentService();
    const repo = getRepo();
    mockStripeClient.webhooks.constructEvent.mockReturnValue({
      type: "invoice.paid",
      data: { object: {} },
    });

    const result = await service.handleWebhook(Buffer.from("payload"), "sig");

    expect(repo.updateOneUser).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });

});

