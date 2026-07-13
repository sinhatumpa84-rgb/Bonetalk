import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";


export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

async function ensureUserRole(userId: string, meta: Record<string, any> | undefined) {
  const { data: existing } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existing) return;
  const role = meta?.role === "doctor" ? "doctor" : "patient";
  const specialty = role === "doctor" ? (meta?.specialty ?? null) : null;
  await supabase.from("user_roles").insert({ user_id: userId, role, specialty });
}

function AuthLayout() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) {
        navigate({ to: "/auth", replace: true });
      } else {
        setSignedIn(true);
        ensureUserRole(data.session.user.id, data.session.user.user_metadata);
      }
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setSignedIn(false);
        navigate({ to: "/auth", replace: true });
      } else {
        setSignedIn(true);
        ensureUserRole(session.user.id, session.user.user_metadata);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  if (!ready || !signedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      
    </div>
  );
}
