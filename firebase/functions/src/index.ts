import { admin } from "./config/adminFirebaseInitialisations";
import { onCall } from "firebase-functions/v2/https";
import { v4 } from "uuid";

export const helloWorld = onCall(async () => {
  const uid = v4();
  const userRef = admin.firestore().collection("tests").doc(uid);

  await userRef.set({ uid });
  return { success: true, data: { uid, message: `User added successfully` } };
});
