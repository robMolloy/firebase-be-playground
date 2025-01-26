import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { fbTestUtils } from "../utils/firebaseTestUtils";
import { firebaseConfig } from "../config/firebaseConfig";

let testEnv: RulesTestEnvironment;

const randomCollectionName = "randomCollection";

describe("firestore rules for a randomCollection", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({
      projectId: firebaseConfig.projectId,
    });
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });

  it("should not allow read access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), randomCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, randomCollectionName, "id1");

    const promises = [
      fbTestUtils.isRequestGranted(getDoc(docRef)),
      fbTestUtils.isRequestDenied(getDoc(docRef)),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted from to getDoc from ${randomCollectionName} but should not be`
    );
  });

  it("should not allow create access to a random collection", async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, randomCollectionName, "id1");
    const promises = [
      fbTestUtils.isRequestGranted(setDoc(docRef, { some: "data2" })),
      fbTestUtils.isRequestDenied(setDoc(docRef, { some: "data2" })),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted to setDoc on ${randomCollectionName} but should not be`
    );
  });

  it("should not allow update access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), randomCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, randomCollectionName, "id1");

    const promises = [
      fbTestUtils.isRequestGranted(setDoc(docRef, { some: "data2" })),
      fbTestUtils.isRequestGranted(
        setDoc(docRef, { more: "data" }, { merge: true })
      ),
      fbTestUtils.isRequestDenied(setDoc(docRef, { some: "data2" })),
      fbTestUtils.isRequestDenied(
        setDoc(docRef, { more: "data" }, { merge: true })
      ),
    ];
    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted to setDoc updates on ${randomCollectionName} but should not be`
    );
  });

  it("should not allow delete access to a random collection", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), randomCollectionName, "id1");
      await setDoc(docRef, { some: "data" });
    });

    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    const docRef = doc(unauthedDb, randomCollectionName, "id1");
    const promises = [
      fbTestUtils.isRequestDenied(deleteDoc(docRef)),
      fbTestUtils.isRequestGranted(deleteDoc(docRef)),
    ];

    const results = await Promise.all(promises);
    const isAllDenied = results.every((x) => x.permissionDenied);
    if (isAllDenied) return;

    throw new Error(
      `permission granted to deleteDoc on ${randomCollectionName} but should not be`
    );
  });
});
