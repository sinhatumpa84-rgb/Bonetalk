import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const RoleSchema = z.object({
  role: z.enum(["patient", "doctor"]),
  specialty: z.string().trim().max(80).optional().nullable(),
});

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, specialty")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? { role: "patient" as const, specialty: null };
  });

export const setMyRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => RoleSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_roles").upsert(
      {
        user_id: userId,
        role: data.role,
        specialty: data.role === "doctor" ? data.specialty ?? null : null,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listDoctors = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id, specialty")
      .eq("role", "doctor");
    if (error) throw new Error(error.message);
    if (!roles?.length) return [];
    const ids = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ids);
    const byId = new Map(profiles?.map((p) => [p.id, p.display_name]) ?? []);
    return roles.map((r) => ({
      id: r.user_id,
      display_name: byId.get(r.user_id) ?? "Doctor",
      specialty: r.specialty ?? "General Practitioner",
    }));
  });
