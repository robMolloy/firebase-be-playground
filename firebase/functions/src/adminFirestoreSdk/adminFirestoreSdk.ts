import admin from "firebase-admin";
import z from "zod";
import { fail, success, TSuccessOrFail } from "../utils/devUtils";
import { timestampSchema } from "./adminFirestoreUtils";

export const paymentIntentDocSchema = z.object({
  id: z.string(),
  uid: z.string(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});
export const paymentProcessedDocSchema = paymentIntentDocSchema.extend({
  processedAt: timestampSchema,
});

export const balanceSchema = z.object({
  id: z.string(),
  uid: z.string(),
  couponStream: z.number(),
  numberOfCoupons: z.number(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

const getBalanceByUid = async (p: { admin: typeof admin; uid: string }) => {
  try {
    const initBalance = await p.admin.firestore().collection("balances").doc(p.uid).get();

    return balanceSchema.safeParse(initBalance.data());
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const setBalance = async (p: { admin: typeof admin; data: z.infer<typeof balanceSchema> }) => {
  try {
    await p.admin.firestore().collection("balances").doc(p.data.id).set(p.data);
    return success({ data: undefined });
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const setPaymentIntentDoc = async (p: {
  admin: typeof admin;
  data: z.infer<typeof paymentIntentDocSchema>;
}) => {
  try {
    await p.admin
      .firestore()
      .collection("paymentIntents")
      .doc(p.data.id)
      .set({ ...p.data });
    return success({ data: undefined });
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const setProcessedPaymentFromPaymentIntent = async (p: {
  admin: typeof admin;
  data: z.infer<typeof paymentIntentDocSchema>;
}) => {
  try {
    await p.admin
      .firestore()
      .collection("processedPayments")
      .doc(p.data.id)
      .set({
        ...p.data,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    return success({ data: undefined });
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const getProcessedPayment = async (p: {
  admin: typeof admin;
  id: string;
}): Promise<TSuccessOrFail<z.infer<typeof paymentProcessedDocSchema>>> => {
  try {
    const getProcessedPaymentResponse = await p.admin
      .firestore()
      .collection("processedPayments")
      .doc(p.id)
      .get();

    const processedPaymentResponse = paymentProcessedDocSchema.safeParse(
      getProcessedPaymentResponse.data()
    );

    return processedPaymentResponse;
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

const getPaymentIntentDoc = async (p: {
  admin: typeof admin;
  id: string;
}): Promise<TSuccessOrFail<z.infer<typeof paymentIntentDocSchema>>> => {
  try {
    const getDocResponse = await p.admin.firestore().collection("paymentIntents").doc(p.id).get();

    return paymentIntentDocSchema.safeParse(getDocResponse.data());
  } catch (e) {
    const error = e as { message: string };
    return fail({ error });
  }
};

export const adminFirestoreSdk = {
  getPaymentIntentDoc,
  setProcessedPaymentFromPaymentIntent,
  getBalanceByUid,
  getProcessedPayment,
  setBalance,
  setPaymentIntentDoc,
};
