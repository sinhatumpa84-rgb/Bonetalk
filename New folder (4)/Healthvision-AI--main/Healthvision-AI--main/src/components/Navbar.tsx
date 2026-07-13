import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useI18n } from "@/contexts/i18n";
import { useTheme } from "@/contexts/theme";
import { Moon, Sun, Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [signedIn, setSignedIn] = useState(false);
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const navItems = [
    { to: "/", label: t("nav.home") },
    { to: "/symptom-checker", label: t("nav.symptoms") },
    { to: "/medical-analysis", label: t("nav.analysis") },
    { to: "/scans", label: t("nav.scans") },
    { to: "/vitals", label: t("nav.vitals") },
    { to: "/consult", label: t("nav.consult") },
    { to: "/chatbot", label: t("nav.chat") },
    { to: "/emergency", label: "Emergency" },
    { to: "/nearby", label: "Nearby" },
    { to: "/dashboard", label: t("nav.dashboard") },
  ] as const;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        <Link to="/" className="flex items-center">
          <Logo size="sm" />
        </Link>
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Language">
                <Languages className="h-4 w-4" />
                <span className="ml-1 text-xs font-semibold uppercase">{lang}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setLang("en")}>English</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setLang("bn")}>বাংলা (Bengali)</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          {signedIn ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                await supabase.auth.signOut();
              }}
            >
              {t("nav.signout")}
            </Button>
          ) : (
            <Link to="/auth">
              <Button size="sm" className="bg-gradient-brand text-primary-foreground hover:opacity-90">
                {t("nav.signin")}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
