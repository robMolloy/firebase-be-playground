import { connectAuthEmulator, getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { firebaseConfig } from "./firebaseConfig";

export const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

connectAuthEmulator(auth, "http://127.0.0.1:9099");
connectFirestoreEmulator(db, "127.0.0.1", 8080);
connectStorageEmulator(storage, "127.0.0.1", 9199);
connectFunctionsEmulator(functions, "127.0.0.1", 5001);
