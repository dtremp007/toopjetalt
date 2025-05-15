import { GitHubIcon, UserButton } from "@daveyplate/better-auth-ui";

import { Link } from "@tanstack/react-router";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Calculator } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/60 px-4 py-3 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Calculator className="size-5" />
          Toopjetalt
        </Link>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/daveyplate/better-auth-tanstack-starter"
            target="_blank"
            rel="noreferrer"
          >
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-full"
            >
              <GitHubIcon />
            </Button>
          </a>

          <ModeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
