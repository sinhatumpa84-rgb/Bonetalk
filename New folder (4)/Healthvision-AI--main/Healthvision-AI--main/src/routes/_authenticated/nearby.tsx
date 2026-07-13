import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Cross, Pill, Loader2, Navigation, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/nearby")({
  head: () => ({
    meta: [
      { title: "Nearby Services — HealthVision AI" },
      { name: "description", content: "Find the nearest hospitals and pharmacies." },
    ],
  }),
  component: NearbyPage,
});

type Place = {
  id: number;
  name: string;
  lat: number;
  lon: number;
  type: "hospital" | "pharmacy";
  distanceKm: number;
  phone?: string;
  address?: string;
};

type Filter = "all" | "hospital" | "pharmacy";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function NearbyPage() {
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const locate = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => {
        setLoading(false);
        toast.error("Location denied", { description: err.message });
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  useEffect(() => {
    locate();
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!coords || !mapRef.current || leafletMapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      const map = L.map(mapRef.current!).setView([coords.lat, coords.lon], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      L.circleMarker([coords.lat, coords.lon], {
        radius: 8,
        color: "#0ea5e9",
        fillColor: "#0ea5e9",
        fillOpacity: 0.8,
      })
        .addTo(map)
        .bindPopup("You are here");

      leafletMapRef.current = map;
    })();
  }, [coords]);

  // Fetch nearby places via Overpass
  useEffect(() => {
    if (!coords) return;
    const radius = 3000; // 3km
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${coords.lat},${coords.lon});
        node["amenity"="clinic"](around:${radius},${coords.lat},${coords.lon});
        node["amenity"="pharmacy"](around:${radius},${coords.lat},${coords.lon});
      );
      out body 80;
    `;
    setLoading(true);
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: query,
    })
      .then((r) => r.json())
      .then((data) => {
        const list: Place[] = (data.elements || [])
          .map((el: any) => {
            const amenity = el.tags?.amenity;
            const type: "hospital" | "pharmacy" =
              amenity === "pharmacy" ? "pharmacy" : "hospital";
            return {
              id: el.id,
              name: el.tags?.name || (type === "pharmacy" ? "Pharmacy" : "Hospital / Clinic"),
              lat: el.lat,
              lon: el.lon,
              type,
              phone: el.tags?.phone || el.tags?.["contact:phone"],
              address:
                [el.tags?.["addr:street"], el.tags?.["addr:city"]].filter(Boolean).join(", ") ||
                undefined,
              distanceKm: haversineKm(coords.lat, coords.lon, el.lat, el.lon),
            };
          })
          .sort((a: Place, b: Place) => a.distanceKm - b.distanceKm)
          .slice(0, 40);
        setPlaces(list);
      })
      .catch(() => toast.error("Could not load nearby places. Try again."))
      .finally(() => setLoading(false));
  }, [coords]);

  // Render markers when places/filter change
  useEffect(() => {
    if (!leafletMapRef.current) return;
    (async () => {
      const L = (await import("leaflet")).default;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      const visible = places.filter((p) => filter === "all" || p.type === filter);
      visible.forEach((p) => {
        const color = p.type === "hospital" ? "#ef4444" : "#10b981";
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: 7,
          color,
          fillColor: color,
          fillOpacity: 0.85,
        })
          .addTo(leafletMapRef.current)
          .bindPopup(
            `<strong>${p.name}</strong><br/>${p.type} · ${p.distanceKm.toFixed(2)} km${
              p.phone ? `<br/><a href="tel:${p.phone}">${p.phone}</a>` : ""
            }`
          );
        markersRef.current.push(marker);
      });
    })();
  }, [places, filter]);

  const visible = places.filter((p) => filter === "all" || p.type === filter);

  return (
    <div className="container mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Nearby Services
          </h1>
          <p className="mt-1 text-muted-foreground">
            Hospitals, clinics and pharmacies near your current location.
          </p>
        </div>
        <Button onClick={locate} variant="outline" className="gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
          Refresh location
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-2">
        <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label="All" />
        <FilterChip
          active={filter === "hospital"}
          onClick={() => setFilter("hospital")}
          label="Hospitals & Clinics"
          icon={<Cross className="h-3.5 w-3.5" />}
        />
        <FilterChip
          active={filter === "pharmacy"}
          onClick={() => setFilter("pharmacy")}
          label="Pharmacies"
          icon={<Pill className="h-3.5 w-3.5" />}
        />
      </div>

      {/* Map */}
      <Card className="mt-4 overflow-hidden border-border">
        <div ref={mapRef} className="h-[380px] w-full bg-muted" />
      </Card>

      {/* List */}
      <h2 className="mt-8 text-lg font-semibold text-foreground">
        {visible.length} {filter === "all" ? "places" : filter + "s"} nearby
      </h2>
      {loading && places.length === 0 && (
        <div className="mt-6 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Searching nearby services…
        </div>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <Card key={p.id} className="p-4 bg-card/60 border-border">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {p.type === "hospital" ? (
                    <Cross className="h-4 w-4 text-rose-500" />
                  ) : (
                    <Pill className="h-4 w-4 text-emerald-500" />
                  )}
                  <h3 className="font-semibold text-foreground truncate">{p.name}</h3>
                </div>
                {p.address && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">{p.address}</p>
                )}
                <p className="mt-1 text-xs text-primary font-medium">
                  {p.distanceKm.toFixed(2)} km away
                </p>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              {p.phone && (
                <a href={`tel:${p.phone}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    Call
                  </Button>
                </a>
              )}
              <a
                href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=18/${p.lat}/${p.lon}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1"
              >
                <Button size="sm" className="w-full bg-gradient-brand text-primary-foreground gap-1">
                  Directions <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
