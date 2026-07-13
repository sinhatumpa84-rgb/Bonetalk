import { Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Helpline = { label: string; number: string };
type Region = { name: string; lines: Helpline[] };

const NATIONAL: Helpline[] = [
  { label: "All-in-One Emergency", number: "112" },
  { label: "Police", number: "100" },
  { label: "Fire", number: "101" },
  { label: "Ambulance", number: "102" },
  { label: "Medical Emergency (108)", number: "108" },
  { label: "Women Helpline", number: "1091" },
  { label: "Child Helpline", number: "1098" },
  { label: "Senior Citizen", number: "14567" },
  { label: "Disaster Management (NDMA)", number: "1078" },
  { label: "Blood Bank", number: "104" },
  { label: "Mental Health (KIRAN)", number: "18005990019" },
  { label: "COVID Helpline", number: "1075" },
  { label: "Road Accident", number: "1073" },
  { label: "Railway Protection", number: "182" },
];

const STATES: Region[] = [
  { name: "Andhra Pradesh", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Disha (Women SOS)", number: "1800-425-0033" },
  ]},
  { name: "Arunachal Pradesh", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Assam", lines: [
    { label: "State Emergency", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Mental Health (SCARF)", number: "1800-599-0019" },
  ]},
  { name: "Bihar", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Chhattisgarh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Delhi (NCT)", lines: [
    { label: "All Emergencies", number: "112" },
    { label: "Delhi Police WhatsApp", number: "9999999999" },
    { label: "CATS Ambulance", number: "102" },
    { label: "Women Helpline", number: "1091" },
    { label: "Anti-Stalking", number: "1096" },
  ]},
  { name: "Goa", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Tourist Helpline", number: "1364" },
  ]},
  { name: "Gujarat", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 EMRI Ambulance", number: "108" },
    { label: "Abhayam Women Helpline", number: "181" },
  ]},
  { name: "Haryana", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Himachal Pradesh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Gudiya Helpline (Women)", number: "1515" },
  ]},
  { name: "Jharkhand", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Karnataka", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Arogya Kavacha Ambulance", number: "108" },
    { label: "Vanitha Sahayavani (Women)", number: "1091" },
    { label: "BBMP Control Room", number: "1533" },
  ]},
  { name: "Kerala", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Mithra 181 (Women)", number: "181" },
    { label: "Disaster Management", number: "1077" },
  ]},
  { name: "Madhya Pradesh", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance (Janani Express)", number: "108" },
    { label: "Women Helpline", number: "1090" },
  ]},
  { name: "Maharashtra", lines: [
    { label: "Dial 112", number: "112" },
    { label: "MEMS Ambulance", number: "108" },
    { label: "Women Helpline", number: "103" },
    { label: "Mumbai Police", number: "100" },
    { label: "BMC Disaster", number: "1916" },
  ]},
  { name: "Manipur", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Meghalaya", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Mizoram", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Nagaland", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Odisha", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "181" },
  ]},
  { name: "Punjab", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Helpline", number: "1091" },
  ]},
  { name: "Rajasthan", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 Ambulance", number: "108" },
    { label: "Women Helpline", number: "1090" },
  ]},
  { name: "Sikkim", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Tamil Nadu", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 GVK EMRI", number: "108" },
    { label: "Women Helpline", number: "181" },
    { label: "Chennai Corporation", number: "1913" },
  ]},
  { name: "Telangana", lines: [
    { label: "Dial 112", number: "112" },
    { label: "108 Ambulance", number: "108" },
    { label: "She Teams (Women)", number: "100" },
    { label: "Hawk Eye App Helpline", number: "9491011111" },
  ]},
  { name: "Tripura", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Uttar Pradesh", lines: [
    { label: "UP-112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Women Powerline 1090", number: "1090" },
  ]},
  { name: "Uttarakhand", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
    { label: "Disaster Helpline", number: "1070" },
  ]},
  { name: "West Bengal", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
    { label: "Kolkata Police", number: "100" },
    { label: "Women Helpline", number: "1091" },
  ]},
  // UTs
  { name: "Jammu & Kashmir (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Ladakh (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Chandigarh (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Puducherry (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Andaman & Nicobar (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
  { name: "Dadra & Nagar Haveli and Daman & Diu (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "108" },
  ]},
  { name: "Lakshadweep (UT)", lines: [
    { label: "Dial 112", number: "112" },
    { label: "Ambulance", number: "102" },
  ]},
];

export function SOSButton() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return STATES;
    return STATES.filter((s) => s.name.toLowerCase().includes(t));
  }, [q]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Emergency SOS"
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-destructive text-destructive-foreground shadow-lg shadow-destructive/40 flex items-center justify-center hover:scale-110 transition-transform animate-pulse"
      >
        <Phone className="h-6 w-6" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-destructive to-rose-600 text-white p-5">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-white text-2xl">Emergency Helplines — India</DialogTitle>
              <DialogDescription className="text-white/85">
                Tap any number to call instantly. Stay calm and describe your location clearly.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-5 space-y-4 max-h-[70vh] overflow-hidden flex flex-col">
            <a
              href="tel:112"
              className="flex items-center justify-between rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 hover:bg-destructive/15 transition"
            >
              <div>
                <div className="text-xs font-semibold text-destructive">PAN-INDIA EMERGENCY</div>
                <div className="text-foreground font-bold">All Services · Police · Fire · Medical</div>
              </div>
              <Badge className="bg-destructive text-destructive-foreground text-base px-3 py-1">
                112
              </Badge>
            </a>

            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">National helplines</h3>
              <div className="grid grid-cols-2 gap-2">
                {NATIONAL.map((h) => (
                  <a
                    key={h.label}
                    href={`tel:${h.number}`}
                    className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 hover:border-primary/40 hover:bg-primary/5 transition"
                  >
                    <span className="text-xs text-muted-foreground truncate pr-2">{h.label}</span>
                    <span className="text-sm font-bold text-primary">{h.number}</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">By state / UT</h3>
                <div className="relative w-44">
                  <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search state…"
                    className="pl-7 h-8 text-xs"
                  />
                </div>
              </div>
              <ScrollArea className="h-[260px] rounded-lg border border-border">
                <div className="divide-y divide-border">
                  {filtered.map((s) => (
                    <details key={s.name} className="group">
                      <summary className="cursor-pointer list-none px-3 py-2 flex items-center justify-between hover:bg-muted/40">
                        <span className="text-sm font-medium text-foreground">{s.name}</span>
                        <span className="text-xs text-muted-foreground group-open:rotate-90 transition">▸</span>
                      </summary>
                      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
                        {s.lines.map((h) => (
                          <a
                            key={h.label + h.number}
                            href={`tel:${h.number}`}
                            className="flex items-center justify-between rounded-md bg-muted/30 px-2 py-1.5 hover:bg-primary/10"
                          >
                            <span className="text-[11px] text-muted-foreground truncate pr-2">
                              {h.label}
                            </span>
                            <span className="text-xs font-semibold text-primary">{h.number}</span>
                          </a>
                        ))}
                      </div>
                    </details>
                  ))}
                  {filtered.length === 0 && (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      No matches.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
