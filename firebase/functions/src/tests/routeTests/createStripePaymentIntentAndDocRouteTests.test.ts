import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import Test from "firebase-functions-test";
import { firebaseConfig } from "../../config/firebaseConfig";
import * as routes from "../../routes";
import { stripeSdk } from "../../stripeSdk/stripeSdk";
import { fbTestUtils } from "../firebaseTestUtils";
import { admin } from "../../config/adminFirebaseInitialisations";
import { createStripePaymentIntentAndDocRouteHandler } from "../../routes/routeHandlers/createStripePaymentIntentAndDocRouteHandler.ts";
import { adminFirestoreSdk } from "../../adminFirestoreSdk/adminFirestoreSdk";

let testEnv: RulesTestEnvironment;

const test = Test();

describe("createStripePaymentIntentAndDocRouteTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({ projectId: firebaseConfig.projectId });
  });
  beforeEach(async () => {
    // await testEnv.clearFirestore();
  });
  afterAll(async () => {
    // await testEnv.clearFirestore();
    await testEnv.cleanup();
  });
  it("should return a success response and create a payment intent and a payment intent doc", async () => {
    const amount = 300;
    const currency = "USD";
    const uid = "test123";
    const wrappedCreateStripePaymentIntentAndDoc = test.wrap(
      routes.createStripePaymentIntentAndDoc
    );
    const result = await wrappedCreateStripePaymentIntentAndDoc({
      data: { amount, currency },
      // @ts-ignore
      auth: { uid },
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();
    expect(result.data.amount).toBe(amount);
    expect(result.data.currency.toLowerCase()).toBe(currency.toLowerCase());
    const paymentIntentResponse = await stripeSdk.retrievePaymentIntent({
      id: result.data.id,
    });
    expect(paymentIntentResponse.success).toBe(true);
    if (!paymentIntentResponse.success) return;
    expect(paymentIntentResponse.data.id).toBe(result.data.id);
    expect(paymentIntentResponse.data.amount).toBe(amount);
    expect(paymentIntentResponse.data.currency.toLowerCase()).toBe(currency.toLowerCase());
  });
  it("should test that the createStripePaymentIntentRouteHandler returns a success response", async () => {
    const amount = 300;
    const currency = "USD";
    const uid = "test123";
    const result = await createStripePaymentIntentAndDocRouteHandler({
      admin,
      uid,
      amount,
      currency,
    });

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.id).toBeDefined();

    const paymentIntentResponse = await stripeSdk.retrievePaymentIntent({ id: result.data.id });
    const paymentIntentDocResponse = await adminFirestoreSdk.getPaymentIntentDoc({
      admin,
      id: result.data.id,
    });
    expect(paymentIntentDocResponse.success && paymentIntentResponse.success).toBe(true);
    if (!paymentIntentDocResponse.success || !paymentIntentResponse.success) return;

    expect(paymentIntentDocResponse.data.id).toBeDefined();
    expect(paymentIntentResponse.data.id).toBeDefined();
    expect(paymentIntentResponse.data.id).toBe(paymentIntentDocResponse.data.id);

    expect(paymentIntentResponse.data.amount).toBe(amount);
    expect(paymentIntentResponse.data.currency.toLowerCase()).toBe(currency.toLowerCase());
  });
});
