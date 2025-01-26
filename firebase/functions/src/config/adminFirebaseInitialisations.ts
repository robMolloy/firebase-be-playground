import adminImport from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";

adminImport.initializeApp(firebaseConfig);

export const admin = adminImport;
