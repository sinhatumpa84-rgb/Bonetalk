import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="container mx-auto px-4 sm:px-6 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <Logo size="sm" />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            AI-powered healthcare insights for smarter, faster, more accessible care.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Product</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Symptom Checker</li>
            <li>Medical Analysis</li>
            <li>Health Chat</li>
            <li>Dashboard</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Disclaimer</h4>
          <p className="mt-3 text-sm text-muted-foreground">
            HealthVision AI is for informational purposes only and is not a substitute for
            professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} HealthVision AI
      </div>
    </footer>
  );
}
