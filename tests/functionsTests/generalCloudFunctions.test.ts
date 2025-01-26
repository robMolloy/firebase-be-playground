import { doc, getDoc } from "@firebase/firestore";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import * as fbTestUtils from "@/utils/firebaseTestUtils";
import { functionsSdk } from "../functionsSdk/functionsSdk";
import { firebaseConfig } from "../config/firebaseConfig";

let testEnv: RulesTestEnvironment;

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
    await testEnv.clearFirestore();
    await testEnv.cleanup();
  });
  it("should test that the hello world cloud function exists", async () => {
    const result2 = await functionsSdk.helloWorld();

    expect(result2.success).toBe(true);
    if (!result2.success) return;

    expect(result2.data.message).toBe("User added successfully");
    const uid = result2.data.uid;

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const docRef = doc(context.firestore(), "tests", `${uid}`);
      const snapshot = await getDoc(docRef);
      const someDoc = snapshot.data();

      expect(someDoc).toBeTruthy();
    });
  });
});
