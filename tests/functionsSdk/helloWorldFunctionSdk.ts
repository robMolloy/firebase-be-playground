import { httpsCallable } from "@firebase/functions";
import z from "zod";
import { functions } from "../config/firebaseInitialisations";

const successResponseSchema = z.object({
  data: z.object({
    success: z.literal(true),
    data: z.object({ message: z.string(), uid: z.string() }),
  }),
});

const helloWorldFn = httpsCallable(functions, "helloWorld");
export const helloWorld = async () => {
  const response = await helloWorldFn();
  const parsedResponse = successResponseSchema.safeParse(response);
  if (!parsedResponse.success) return parsedResponse;
  return {
    success: parsedResponse.success,
    data: parsedResponse.data.data.data,
  } as const;
};
