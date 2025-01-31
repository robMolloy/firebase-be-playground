import { Stripe } from "stripe";
import z from "zod";
import { fail, TSuccessOrFail } from "../utils/devUtils";

const stripeSecretKey =
  "sk_test_51QhH4nIGFJRyk0RhUnRTVsXZICgwBLG5C6tiDecTJNR5MC40Skm1y3HMQt0HQA0dEdReAcEH3v2TozuJ9mlLHBQM00d3N3noeZ";
const stripe = new Stripe(stripeSecretKey);

const paymentIntentSchema = z.object({
  id: z.string(),
  amount: z.number(),
  currency: z.literal("usd"),
  status: z.string(),
  client_secret: z.string(),
});

const retrievePaymentIntent = async (p: {
  id: string;
}): Promise<TSuccessOrFail<z.infer<typeof paymentIntentSchema>>> => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(p.id);

    return paymentIntentSchema.safeParse(paymentIntent);
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};
const createPaymentIntent = async (p: {
  amount: number;
  currency: string;
}): Promise<TSuccessOrFail<z.infer<typeof paymentIntentSchema>>> => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: p.amount,
      currency: p.currency,
    });

    return paymentIntentSchema.safeParse(paymentIntent);
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const stripeSdk = {
  retrievePaymentIntent,
  createPaymentIntent,
};
