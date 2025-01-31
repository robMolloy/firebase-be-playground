import { Timestamp } from "firebase-admin/firestore";
import { adminFirestoreSdk } from "../../adminFirestoreSdk/adminFirestoreSdk";
import { admin } from "../../config/adminFirebaseInitialisations";
import { stripeSdk } from "../../stripeSdk/stripeSdk";
import { fail, success } from "../../utils/devUtils";

export const createStripePaymentIntentAndDocRouteHandler = async (p: {
  admin: typeof admin;
  uid: string;
  amount: number;
  currency: string;
}) => {
  const createPaymentIntentResponse = await stripeSdk.createPaymentIntent({
    amount: p.amount,
    currency: p.currency,
  });
  if (!createPaymentIntentResponse.success)
    return fail({ error: { message: "createPaymentIntentResponse failed" } });

  const setPaymentIntentDocResponse = await adminFirestoreSdk.setPaymentIntentDoc({
    admin,
    data: {
      id: createPaymentIntentResponse.data.id,
      uid: p.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    },
  });
  if (!setPaymentIntentDocResponse.success)
    return fail({ error: setPaymentIntentDocResponse.error });

  return success({ data: createPaymentIntentResponse.data });
};
