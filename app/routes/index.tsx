import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Zap, Lock } from "lucide-react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold tracking-tight">
            Spreadsheets with <span className="text-primary">JavaScript</span>{" "}
            Power
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A simplified yet powerful spreadsheet that lets you execute
            JavaScript code directly in your cells. Transform your data with the
            full power of JavaScript.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <Link to="/auth/$pathname" params={{ pathname: "sign-up" }}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/auth/$pathname" params={{ pathname: "login" }}>
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border bg-card">
            <Code className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">JavaScript in Cells</h3>
            <p className="text-muted-foreground">
              Write and execute JavaScript code directly in your spreadsheet
              cells.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-foreground">
              Instant calculations and updates as you type your code.
            </p>
          </div>
          <div className="p-6 rounded-lg border bg-card">
            <Lock className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your data stays private and secure in your browser.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to Transform Your Data?</h2>
          <p className="text-muted-foreground">
            Join thousands of users who are already using our powerful
            spreadsheet.
          </p>
          <Button size="lg" className="gap-2" asChild>
            <Link to="/auth/$pathname" params={{ pathname: "sign-up" }}>
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
