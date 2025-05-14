import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async ({ context }) => {
    if (!context.user) {
      return redirect({
        to: "/auth/$pathname",
        params: { pathname: "login" },
      });
    }
  },
});
