import { httpsCallable } from "@firebase/functions";
import z from "zod";
import { functions } from "../config/firebaseInitialisations";
import { fail, success } from "@/utils/devUtils";

const createStripePaymentIntentAndDocFn = httpsCallable(
  functions,
  "createStripePaymentIntentAndDoc"
);

const successResponseDataSchema = z.object({
  success: z.literal(true),
  data: z.object({
    amount: z.number(),
    currency: z.literal("usd"),
    status: z.string(),
    client_secret: z.string(),
  }),
});

export const createStripePaymentIntentAndDoc = async (p: { amount: number; currency: string }) => {
  const response = await createStripePaymentIntentAndDocFn(p);
  const parsedResponse = successResponseDataSchema.safeParse(response.data);

  if (!parsedResponse.success)
    return fail({ error: { message: "createStripePaymentIntentAndDoc failed" } });
  return success({ data: parsedResponse.data.data });
};
