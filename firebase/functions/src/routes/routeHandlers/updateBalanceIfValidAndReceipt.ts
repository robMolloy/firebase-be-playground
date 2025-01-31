import admin from "firebase-admin";
import { adminFirestoreSdk } from "../../adminFirestoreSdk/adminFirestoreSdk";
import { stripeSdk } from "../../stripeSdk/stripeSdk";
import { fail } from "../../utils/devUtils";

export const updateBalanceIfValidAndReceipt = async (p: {
  admin: typeof admin;
  paymentIntentId: string;
}) => {
  const getPaymentIntentDocResponse = await adminFirestoreSdk.getPaymentIntentDoc({
    admin,
    id: p.paymentIntentId,
  });
  if (!getPaymentIntentDocResponse.success)
    return fail({ error: { message: "getPaymentIntentDocResponse failed" } });

  const stripePaymentIntentResponse = await stripeSdk.retrievePaymentIntent({
    id: p.paymentIntentId,
  });
  if (!stripePaymentIntentResponse.success)
    return fail({ error: { message: "stripePaymentIntentResponse failed" } });

  const paymentIntent = stripePaymentIntentResponse.data;
  if (paymentIntent.status !== "succeeded")
    return { success: false, error: { message: "payment has not succeeded" } };

  const getProcessedPaymentResponse = await adminFirestoreSdk.getProcessedPayment({
    admin,
    id: p.paymentIntentId,
  });
  if (getProcessedPaymentResponse.success)
    return { success: false, error: { message: "getProcessedPayment failed" } };

  const getBalanceResponse = await adminFirestoreSdk.getBalanceByUid({
    admin,
    uid: getPaymentIntentDocResponse.data.uid,
  });
  if (!getBalanceResponse.success)
    return { success: false, error: { message: "getBalanceResponse failed" } };

  const setBalanceResponse = await adminFirestoreSdk.setBalance({
    admin,
    data: {
      ...getBalanceResponse.data,
      numberOfCoupons: getBalanceResponse.data.numberOfCoupons + paymentIntent.amount,
      couponStream: getBalanceResponse.data.couponStream + 1,
    },
  });

  if (!setBalanceResponse.success)
    return { success: false, error: { message: "setBalanceResponse failed" } };

  const setProcessedPaymentResponse = await adminFirestoreSdk.setProcessedPaymentFromPaymentIntent({
    admin,
    data: getPaymentIntentDocResponse.data,
  });

  if (!setProcessedPaymentResponse.success)
    return { success: false, error: { message: "setProcessedPayment failed" } };

  return { success: setProcessedPaymentResponse.success };
};
