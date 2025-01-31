import adminImport from "firebase-admin";
import { firebaseConfig } from "./firebaseConfig";

adminImport.initializeApp(firebaseConfig);

const db = adminImport.firestore();
db.settings({ host: "localhost:8080", ssl: false });

export const admin = adminImport;
