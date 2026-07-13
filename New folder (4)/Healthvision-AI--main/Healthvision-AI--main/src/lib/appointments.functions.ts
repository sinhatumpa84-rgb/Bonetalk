import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateSchema = z.object({
  doctor_id: z.string().uuid().optional().nullable(),
  doctor_name: z.string().min(1).max(120),
  specialty: z.string().min(1).max(80),
  scheduled_at: z.string().min(1),
  notes: z.string().max(1000).optional(),
});

const UpdateSchema = z.object({
  id: z.string().uuid(),
  doctor_name: z.string().min(1).max(120).optional(),
  specialty: z.string().min(1).max(80).optional(),
  scheduled_at: z.string().min(1).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

function genRoom() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .or(`user_id.eq.${userId},doctor_id.eq.${userId}`)
      .order("scheduled_at", { ascending: true });
    if (error) throw new Error(error.message);

    // Attach patient names for doctor's view
    const patientIds = Array.from(new Set((data ?? []).map((a) => a.user_id)));
    let nameMap = new Map<string, string>();
    if (patientIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", patientIds);
      nameMap = new Map(profs?.map((p) => [p.id, p.display_name ?? "Patient"]) ?? []);
    }
    return (data ?? []).map((a) => ({
      ...a,
      patient_name: nameMap.get(a.user_id) ?? "Patient",
    }));
  });

export const createAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => CreateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("appointments")
      .insert({
        user_id: userId,
        doctor_id: data.doctor_id ?? null,
        doctor_name: data.doctor_name,
        specialty: data.specialty,
        scheduled_at: data.scheduled_at,
        notes: data.notes ?? null,
        status: data.doctor_id ? "pending" : "scheduled",
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const updateAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => UpdateSchema.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...patch } = data;
    const { data: row, error } = await supabase
      .from("appointments")
      .update(patch)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const cancelAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const acceptAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const room = genRoom();
    const { data: row, error } = await supabase
      .from("appointments")
      .update({ status: "accepted", meeting_room: room })
      .eq("id", data.id)
      .eq("doctor_id", userId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const declineAppointment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string().uuid() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("appointments")
      .update({ status: "declined" })
      .eq("id", data.id)
      .eq("doctor_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
