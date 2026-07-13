import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — HealthVision AI" },
      { name: "description", content: "Set a new password for your HealthVision AI account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // When user clicks the recovery email link, Supabase establishes a temporary
    // session and emits PASSWORD_RECOVERY. We allow the form to render either way
    // but only allow submission once a session exists.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    if (password !== confirm) return toast.error("Passwords do not match");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error("Could not update password", { description: error.message });
    toast.success("Password updated. Please sign in.");
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="mt-3 text-muted-foreground">Set a new password</p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 bg-card/80 backdrop-blur border-border">
        {!ready ? (
          <div className="text-sm text-muted-foreground text-center">
            Open the password reset link from your email to continue. If you arrived here directly,
            <Link to="/auth" className="text-primary ml-1 hover:underline">
              return to sign in
            </Link>
            .
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="New password">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>
            <Field label="Confirm new password">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <Input
                type={showPw ? "text" : "password"}
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </Field>
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-brand text-primary-foreground hover:opacity-90"
              disabled={loading}
            >
              Update password <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>
        )}
      </Card>

      <Link to="/auth" className="mt-6 text-xs text-muted-foreground hover:text-foreground">
        ← Back to sign in
      </Link>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="mt-1.5 flex items-center gap-2 rounded-md border border-input bg-input px-3 h-11">
        {children}
      </div>
    </div>
  );
}
