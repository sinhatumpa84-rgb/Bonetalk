import { Activity } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const dims = {
    sm: { box: "h-8 w-8", icon: "h-5 w-5", text: "text-lg" },
    md: { box: "h-10 w-10", icon: "h-6 w-6", text: "text-2xl" },
    lg: { box: "h-14 w-14", icon: "h-8 w-8", text: "text-3xl" },
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${dims.box} rounded-xl bg-gradient-brand flex items-center justify-center shadow-glow`}
      >
        <Activity className={`${dims.icon} text-primary-foreground`} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`${dims.text} font-bold tracking-tight text-foreground`}>
          HealthVision <span className="text-gradient-brand">AI</span>
        </span>
      )}
    </div>
  );
}
