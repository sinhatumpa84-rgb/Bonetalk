import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Copy,
  Stethoscope,
  Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/consult")({
  validateSearch: (s: Record<string, unknown>) => ({
    room: typeof s.room === "string" ? s.room.toUpperCase().slice(0, 8) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Live Consultation — HealthVision AI" },
      { name: "description", content: "Talk to a doctor over secure video." },
    ],
  }),
  component: ConsultPage,
});

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "stun:global.stun.twilio.com:3478" },
];

type Status = "idle" | "joining" | "waiting" | "calling" | "connected" | "ended";

function makeRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function ConsultPage() {
  const [roomInput, setRoomInput] = useState("");
  const [room, setRoom] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [peers, setPeers] = useState(0);

  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const meRef = useRef<string>(crypto.randomUUID());
  const isInitiatorRef = useRef(false);

  const search = Route.useSearch();

  useEffect(() => () => cleanup(), []);

  useEffect(() => {
    if (search.room && !room && status === "idle") {
      joinRoom(search.room);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.room]);

  function cleanup() {
    pcRef.current?.close();
    pcRef.current = null;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function send(event: string, payload: any) {
    await channelRef.current?.send({
      type: "broadcast",
      event,
      payload: { from: meRef.current, ...payload },
    });
  }

  async function setupPC() {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate) send("ice", { candidate: e.candidate.toJSON() });
    };
    pc.ontrack = (e) => {
      if (remoteRef.current) {
        remoteRef.current.srcObject = e.streams[0];
      }
      setStatus("connected");
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected" || pc.connectionState === "failed") {
        setStatus("ended");
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    return pc;
  }

  async function joinRoom(code: string) {
    setStatus("joining");
    setRoom(code);
    try {
      const pc = await setupPC();

      const channel = supabase.channel(`consult:${code}`, {
        config: { broadcast: { self: false }, presence: { key: meRef.current } },
      });
      channelRef.current = channel;

      channel.on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setPeers(count);
      });

      channel.on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.from === meRef.current) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await send("answer", { sdp: answer });
        setStatus("calling");
      });
      channel.on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.from === meRef.current) return;
        if (pc.signalingState !== "stable") {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        }
      });
      channel.on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (payload.from === meRef.current) return;
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {}
      });
      channel.on("broadcast", { event: "ready" }, async ({ payload }) => {
        if (payload.from === meRef.current) return;
        // a peer joined; the initiator (first one in) creates the offer
        if (isInitiatorRef.current) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await send("offer", { sdp: offer });
          setStatus("calling");
        }
      });

      await channel.subscribe(async (st) => {
        if (st === "SUBSCRIBED") {
          await channel.track({ joined_at: Date.now() });
          const state = channel.presenceState();
          const others = Object.keys(state).filter((k) => k !== meRef.current).length;
          isInitiatorRef.current = others === 0;
          setStatus(isInitiatorRef.current ? "waiting" : "calling");
          await send("ready", {});
        }
      });
    } catch (e: any) {
      toast.error(e.message ?? "Could not access camera / microphone");
      setStatus("idle");
      cleanup();
    }
  }

  function createAndJoin() {
    const code = makeRoomCode();
    joinRoom(code);
  }
  function joinExisting() {
    const c = roomInput.trim().toUpperCase();
    if (c.length < 4) return toast.error("Enter a valid room code");
    joinRoom(c);
  }
  function hangup() {
    cleanup();
    setStatus("ended");
    setRoom(null);
    setPeers(0);
  }
  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }
  function toggleCam() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setCamOn(track.enabled);
  }
  function copyCode() {
    if (!room) return;
    navigator.clipboard.writeText(room);
    toast.success("Room code copied");
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-xl bg-gradient-brand flex items-center justify-center">
          <Stethoscope className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Live Doctor Consultation</h1>
          <p className="text-muted-foreground text-sm">
            Secure peer-to-peer video powered by WebRTC. Share the room code with your doctor.
          </p>
        </div>
      </div>

      {!room && status === "idle" && (
        <Card className="mt-8 p-6 bg-card/60 border-border max-w-xl">
          <h2 className="font-semibold text-foreground">Start a consultation</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Create a private room or join one your doctor shared with you.
          </p>
          <Button
            onClick={createAndJoin}
            className="w-full mt-4 bg-gradient-brand text-primary-foreground hover:opacity-90"
          >
            <Video className="h-4 w-4 mr-2" /> Create new room
          </Button>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or join existing</span>
            </div>
          </div>
          <Label className="text-xs">Room code</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={roomInput}
              onChange={(e) => setRoomInput(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={8}
            />
            <Button variant="outline" onClick={joinExisting}>Join</Button>
          </div>
        </Card>
      )}

      {room && (
        <Card className="mt-8 p-4 bg-card/60 border-border">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/40">
                Room {room}
              </Badge>
              <Button variant="ghost" size="icon" onClick={copyCode} aria-label="Copy code">
                <Copy className="h-3.5 w-3.5" />
              </Button>
              <Badge variant="outline" className="gap-1">
                <Users className="h-3 w-3" /> {peers}
              </Badge>
              <Badge
                className={
                  status === "connected"
                    ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-500 border border-amber-500/30"
                }
                variant="outline"
              >
                {status === "waiting" ? "Waiting for doctor…" :
                 status === "calling" ? "Connecting…" :
                 status === "connected" ? "Live" :
                 status === "ended" ? "Ended" : status}
              </Badge>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
              {status !== "connected" && (
                <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                  Waiting for remote video…
                </div>
              )}
              <span className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                Remote
              </span>
            </div>
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
              <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <span className="absolute top-2 left-2 text-xs bg-black/50 text-white px-2 py-0.5 rounded">
                You
              </span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4">
            <Button variant="outline" size="icon" onClick={toggleMic} aria-label="Toggle mic">
              {micOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4 text-destructive" />}
            </Button>
            <Button variant="outline" size="icon" onClick={toggleCam} aria-label="Toggle camera">
              {camOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4 text-destructive" />}
            </Button>
            <Button variant="destructive" onClick={hangup}>
              <PhoneOff className="h-4 w-4 mr-2" /> End call
            </Button>
          </div>
        </Card>
      )}

      {status === "ended" && !room && (
        <Card className="mt-6 p-6 bg-card/60 border-border max-w-xl text-center">
          <h3 className="font-semibold text-foreground">Call ended</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Start another consultation when you're ready.
          </p>
          <Button onClick={() => setStatus("idle")} className="mt-3">Back</Button>
        </Card>
      )}
    </div>
  );
}
