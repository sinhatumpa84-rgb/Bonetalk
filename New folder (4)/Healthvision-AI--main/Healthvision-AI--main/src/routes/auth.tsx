import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Lock, Mail, ArrowRight, User, Stethoscope, HeartPulse } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — HealthVision AI" },
      { name: "description", content: "Sign in or create your HealthVision AI account as a patient or doctor." },
    ],
  }),
  component: AuthPage,
});

const SPECIALTIES = [
  "General Practitioner",
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Radiology",
  "Other",
];

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [specialty, setSpecialty] = useState("General Practitioner");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error("Sign in failed", { description: error.message });
    toast.success("Welcome back!");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          display_name: displayName,
          role,
          specialty: role === "doctor" ? specialty : null,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error("Sign up failed", { description: error.message });
    toast.success("Account created — check your email if confirmation is required.");
  };

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Enter your email above first");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) return toast.error("Could not send reset email", { description: error.message });
    toast.success("Reset link sent — check your inbox.");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-8">
        <div className="flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="mt-3 text-muted-foreground">HealthVision AI — Patient & Doctor Portal</p>
      </div>

      <Card className="w-full max-w-md p-6 sm:p-8 bg-card/80 backdrop-blur border-border">
        <Tabs defaultValue="signin">
          <TabsList className="grid grid-cols-2 mb-6 w-full">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <Field label="Email">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </Field>
              <Field label="Password">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
              <div className="flex justify-end -mt-2">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs text-primary hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-brand text-primary-foreground hover:opacity-90"
                disabled={loading}
              >
                Sign In <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label className="text-sm">I am a</Label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <RoleCard
                    active={role === "patient"}
                    icon={<HeartPulse className="h-4 w-4" />}
                    label="Patient"
                    onClick={() => setRole("patient")}
                  />
                  <RoleCard
                    active={role === "doctor"}
                    icon={<Stethoscope className="h-4 w-4" />}
                    label="Doctor"
                    onClick={() => setRole("doctor")}
                  />
                </div>
              </div>

              <Field label="Full name">
                <User className="h-4 w-4 text-muted-foreground" />
                <Input
                  required
                  placeholder={role === "doctor" ? "Dr. Jane Doe" : "Jane Doe"}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </Field>

              {role === "doctor" && (
                <div>
                  <Label className="text-sm">Specialty</Label>
                  <Select value={specialty} onValueChange={setSpecialty}>
                    <SelectTrigger className="mt-1.5 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALTIES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Field label="Email">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </Field>
              <Field label="Password">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPw ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </Field>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-brand text-primary-foreground hover:opacity-90"
                disabled={loading}
              >
                Create {role === "doctor" ? "doctor" : "patient"} account
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      <Link to="/" className="mt-6 text-xs text-muted-foreground hover:text-foreground">
        ← Back to home
      </Link>
      
    </div>
  );
}

function RoleCard({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-md border px-3 h-11 text-sm font-medium transition-colors ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-input text-foreground hover:bg-accent"
      }`}
    >
      {icon}
      {label}
    </button>
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
