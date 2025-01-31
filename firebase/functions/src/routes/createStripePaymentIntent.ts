import { onCall } from "firebase-functions/v2/https";
import z from "zod";
import { stripeSdk } from "../stripeSdk/stripeSdk";
import { fail } from "../utils/devUtils";

const requestDataSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const createStripePaymentIntent = onCall(async (request) => {
  const parseResponse = requestDataSchema.safeParse(request.data);
  if (!parseResponse.success)
    return fail({
      error: { message: "The function must be called with 'amount' and 'currency' arguments." },
    });
  if (!request.auth?.uid) return fail({ error: { message: "user must be authenticated" } });

  return stripeSdk.createPaymentIntent({
    amount: parseResponse.data.amount,
    currency: parseResponse.data.currency,
  });
});
