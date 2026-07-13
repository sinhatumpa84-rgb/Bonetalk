import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, isPast } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Calendar,
  Plus,
  Stethoscope,
  Clock,
  X,
  Check,
  Video,
  User,
} from "lucide-react";
import {
  listAppointments,
  createAppointment,
  cancelAppointment,
  acceptAppointment,
  declineAppointment,
} from "@/lib/appointments.functions";
import { getMyRole, listDoctors } from "@/lib/roles.functions";

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({ meta: [{ title: "Appointments — HealthVision AI" }] }),
  component: AppointmentsPage,
});

type Appt = {
  id: string;
  user_id: string;
  doctor_id: string | null;
  doctor_name: string;
  specialty: string | null;
  scheduled_at: string;
  status: string;
  notes: string | null;
  meeting_room: string | null;
  patient_name?: string;
};

function statusColor(s: string) {
  switch (s) {
    case "accepted":
      return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-500 border-amber-500/30";
    case "declined":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    case "cancelled":
      return "bg-red-500/10 text-red-400 border-red-500/30";
    default:
      return "bg-primary/10 text-primary border-primary/30";
  }
}

function AppointmentsPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const list = useServerFn(listAppointments);
  const create = useServerFn(createAppointment);
  const cancelFn = useServerFn(cancelAppointment);
  const acceptFn = useServerFn(acceptAppointment);
  const declineFn = useServerFn(declineAppointment);
  const myRoleFn = useServerFn(getMyRole);
  const doctorsFn = useServerFn(listDoctors);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    doctor_id: "" as string,
    doctor_name: "",
    specialty: "General Practitioner",
    scheduled_at: "",
    notes: "",
  });

  const roleQ = useQuery({ queryKey: ["my-role"], queryFn: () => myRoleFn() });
  const isDoctor = roleQ.data?.role === "doctor";

  const q = useQuery({ queryKey: ["appointments"], queryFn: () => list() });
  const doctorsQ = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorsFn(),
    enabled: !isDoctor,
  });

  const createMut = useMutation({
    mutationFn: () => {
      const picked = doctorsQ.data?.find((d) => d.id === form.doctor_id);
      return create({
        data: {
          doctor_id: form.doctor_id || null,
          doctor_name: picked?.display_name ?? form.doctor_name,
          specialty: picked?.specialty ?? form.specialty,
          scheduled_at: new Date(form.scheduled_at).toISOString(),
          notes: form.notes || undefined,
        },
      });
    },
    onSuccess: () => {
      toast.success("Appointment requested");
      setOpen(false);
      setForm({
        doctor_id: "",
        doctor_name: "",
        specialty: "General Practitioner",
        scheduled_at: "",
        notes: "",
      });
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not book"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Appointment cancelled");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
  const acceptMut = useMutation({
    mutationFn: (id: string) => acceptFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Appointment accepted — meeting room ready");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to accept"),
  });
  const declineMut = useMutation({
    mutationFn: (id: string) => declineFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Appointment declined");
      qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const data = (q.data ?? []) as Appt[];
  const upcoming = data.filter(
    (a) =>
      ["pending", "accepted", "scheduled"].includes(a.status) &&
      !isPast(new Date(a.scheduled_at)),
  );
  const past = data.filter(
    (a) => !["cancelled", "declined"].includes(a.status) && isPast(new Date(a.scheduled_at)),
  );
  const cancelled = data.filter((a) => ["cancelled", "declined"].includes(a.status));

  function joinMeeting(code: string) {
    navigate({ to: "/consult", search: { room: code } as any });
  }

  const ApptCard = ({ a }: { a: Appt }) => {
    const allowPatientCancel = !isDoctor && a.status !== "cancelled" && !isPast(new Date(a.scheduled_at));
    const showAcceptDecline = isDoctor && a.status === "pending";
    const canJoin = a.status === "accepted" && a.meeting_room;
    return (
      <Card className="p-4 bg-card/60 border-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-brand flex items-center justify-center shrink-0">
              {isDoctor ? (
                <User className="h-5 w-5 text-primary-foreground" />
              ) : (
                <Stethoscope className="h-5 w-5 text-primary-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                {isDoctor ? a.patient_name ?? "Patient" : a.doctor_name}
              </h3>
              <p className="text-xs text-muted-foreground">{a.specialty}</p>
              <p className="mt-2 text-sm text-foreground flex items-center gap-1">
                <Clock className="h-3 w-3 text-primary" />
                {format(new Date(a.scheduled_at), "PPP 'at' p")}
              </p>
              {a.notes && <p className="mt-1 text-xs text-muted-foreground">{a.notes}</p>}
              {a.meeting_room && (
                <p className="mt-1 text-xs text-primary">
                  Meeting room: <span className="font-mono">{a.meeting_room}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Badge variant="outline" className={statusColor(a.status)}>
              {a.status}
            </Badge>
            {canJoin && (
              <Button
                size="sm"
                onClick={() => joinMeeting(a.meeting_room!)}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              >
                <Video className="h-3.5 w-3.5 mr-1" /> Join
              </Button>
            )}
            {showAcceptDecline && (
              <>
                <Button
                  size="sm"
                  onClick={() => acceptMut.mutate(a.id)}
                  disabled={acceptMut.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  <Check className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => declineMut.mutate(a.id)}
                  disabled={declineMut.isPending}
                >
                  Decline
                </Button>
              </>
            )}
            {allowPatientCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label="Cancel">
                    <X className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel appointment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark the appointment as cancelled.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep it</AlertDialogCancel>
                    <AlertDialogAction onClick={() => cancelMut.mutate(a.id)}>
                      Cancel appointment
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-4xl">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Calendar className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isDoctor ? "Patient Appointments" : "Appointments"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isDoctor
                ? "Accept or decline incoming bookings and start video consultations."
                : "Book and manage your visits with our doctors."}
            </p>
          </div>
        </div>
        {!isDoctor && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4 mr-1" /> Book Appointment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book an appointment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Doctor</Label>
                  <Select
                    value={form.doctor_id}
                    onValueChange={(v) => setForm({ ...form, doctor_id: v })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue
                        placeholder={
                          doctorsQ.isLoading
                            ? "Loading doctors…"
                            : doctorsQ.data?.length
                              ? "Select a doctor"
                              : "No doctors registered yet"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsQ.data?.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.display_name} — {d.specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The doctor will receive your request and can accept it.
                  </p>
                </div>
                <div>
                  <Label>Date & time</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Notes (optional)</Label>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="mt-2"
                    placeholder="Reason for visit, symptoms…"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={
                    !form.doctor_id || !form.scheduled_at || createMut.isPending
                  }
                  onClick={() => createMut.mutate()}
                  className="bg-gradient-brand text-primary-foreground hover:opacity-90"
                >
                  {createMut.isPending ? "Booking…" : "Request appointment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="upcoming" className="mt-8">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming ({upcoming.length})</TabsTrigger>
          <TabsTrigger value="past">Past ({past.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelled.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-3 mt-4">
          {upcoming.length === 0 ? (
            <Empty msg={isDoctor ? "No incoming appointments." : "No upcoming appointments."} />
          ) : (
            upcoming.map((a) => <ApptCard key={a.id} a={a} />)
          )}
        </TabsContent>
        <TabsContent value="past" className="space-y-3 mt-4">
          {past.length === 0 ? <Empty msg="No past appointments." /> : past.map((a) => <ApptCard key={a.id} a={a} />)}
        </TabsContent>
        <TabsContent value="cancelled" className="space-y-3 mt-4">
          {cancelled.length === 0 ? (
            <Empty msg="No cancelled appointments." />
          ) : (
            cancelled.map((a) => <ApptCard key={a.id} a={a} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ msg }: { msg: string }) {
  return (
    <Card className="p-8 text-center bg-card/40 border-border">
      <p className="text-sm text-muted-foreground">{msg}</p>
    </Card>
  );
}
