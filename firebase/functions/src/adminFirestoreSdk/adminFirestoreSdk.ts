import admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";
import z from "zod";

type TTimestamp = ReturnType<typeof Timestamp.now>;
type TTimestampValue = Pick<TTimestamp, "seconds" | "nanoseconds">;

const getTimestampFromTimestampValue = (x: TTimestampValue) => {
  return new Timestamp(x.seconds, x.nanoseconds);
};

export const timestampSchema = z
  .object({ seconds: z.number(), nanoseconds: z.number() })
  .transform((x) => getTimestampFromTimestampValue(x));

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

export const adminGetBalanceByUid = async (p: {
  admin: typeof admin;
  uid: string;
}) => {
  try {
    const initBalance = await p.admin
      .firestore()
      .collection("balances")
      .doc(p.uid)
      .get();

    const balanceResponse = balanceSchema.safeParse(initBalance.data());
    return balanceResponse;
  } catch (error) {
    return { success: false } as const;
  }
};

export const adminSetBalance = async (p: {
  admin: typeof admin;
  data: z.infer<typeof balanceSchema>;
}) => {
  try {
    await p.admin.firestore().collection("balances").doc(p.data.id).set(p.data);
    return { success: true } as const;
  } catch (error) {
    return { success: false } as const;
  }
};

export const adminSetProcessedPaymentFromPaymentIntent = async (p: {
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
    return { success: true } as const;
  } catch (error) {
    return { success: false } as const;
  }
};

export const adminGetProcessedPayment = async (p: {
  admin: typeof admin;
  id: string;
}) => {
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
  } catch (error) {
    return { success: false } as const;
  }
};
export const adminGetPaymentIntentDoc = async (p: {
  admin: typeof admin;
  id: string;
}) => {
  try {
    const getDocResponse = await p.admin
      .firestore()
      .collection("paymentIntents")
      .doc(p.id)
      .get();

    const parsedDocResponse = paymentIntentDocSchema.safeParse(
      getDocResponse.data()
    );

    return parsedDocResponse;
  } catch (error) {
    return { success: false } as const;
  }
};
