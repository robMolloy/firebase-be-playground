import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { admin } from "../config/adminFirebaseInitialisations";
import { updateBalanceIfValidAndReceipt } from "./routeHandlers/updateBalanceIfValidAndReceipt";

export const onCreatePaymentIntentDocUpdateBalanceIfValidAndReceipt = onDocumentCreated(
  "paymentIntents/{id}",
  async (event) => {
    const response = await updateBalanceIfValidAndReceipt({
      admin,
      paymentIntentId: event.params.id,
    });

    return response;
  }
);
