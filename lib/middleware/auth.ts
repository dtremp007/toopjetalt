import { createMiddleware } from "@tanstack/react-start";
import { getWebRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";

export const authMiddleware = createMiddleware()
  .server(async ({ next }) => {
    const { headers } = getWebRequest()!;
    const session = await auth.api.getSession({ headers });
    const user = session?.user || null;

    if (!user) {
      throw new Error("Unauthorized");
    }

    return next({
      context: {
        user,
      },
    });
  });
