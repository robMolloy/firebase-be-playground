import { onCall } from "firebase-functions/v2/https";
import z from "zod";
import { admin } from "../config/adminFirebaseInitialisations";
import { stripeSdk } from "../stripeSdk/stripeSdk";
import { fail } from "../utils/devUtils";
import { createStripePaymentIntentAndDocRouteHandler } from "./routeHandlers/createStripePaymentIntentAndDocRouteHandler.ts";

const requestDataSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const createStripePaymentIntentAndDoc = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success)
    return fail({
      error: { message: "The function must be called with 'amount' and 'currency' arguments." },
    });
  if (!request.auth?.uid) return fail({ error: { message: "user must be authenticated" } });
  const amount = parseResponse.data.amount;
  const currency = parseResponse.data.currency;

  const createPaymentIntentResponse = await stripeSdk.createPaymentIntent({ amount, currency });
  if (!createPaymentIntentResponse.success)
    return fail({ error: { message: "createPaymentIntentResponse failed" } });

  return createStripePaymentIntentAndDocRouteHandler({
    admin,
    uid: request.auth.uid,
    amount,
    currency,
  });
});
