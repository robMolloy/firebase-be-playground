import { auth } from "@/config/firebaseInitialisations";
import { fbTestUtils } from "@/utils/firebaseTestUtils";
import { RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "../config/firebaseConfig";
import { functionsSdk } from "../functionsSdk";
import { v4 as uuid } from "uuid";

let testEnv: RulesTestEnvironment;
let email: string;
const password = "test123";

describe("createStripePaymentIntentFunctionsSdkTests", () => {
  beforeAll(async () => {
    fbTestUtils.setDefaultLogLevel();
    testEnv = await fbTestUtils.createTestEnvironment({
      projectId: firebaseConfig.projectId,
    });
    email = `${uuid()}@test.com`;
    await createUserWithEmailAndPassword(auth, email, password);
  });
  beforeEach(async () => {
    await testEnv.clearFirestore();
  });
  afterAll(async () => {
    await testEnv.cleanup();
  });
  it("should return a success response", async () => {
    await signInWithEmailAndPassword(auth, email, password);
    const result2 = await functionsSdk.createStripePaymentIntentAndDoc({
      amount: 100,
      currency: "USD",
    });
    expect(result2.success).toBe(true);
  });
});
