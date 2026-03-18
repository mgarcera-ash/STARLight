// HIDDEN: Bottom navigation hidden while focusing on Get Help flow.
// Tabs: Browse (/browse), Search (/search), Submit (/submit), Review (/review)
// Restore by uncommenting the full component below.

/*
import { Link, useLocation } from "react-router-dom";
import { Compass, LayoutGrid, Search, PlusCircle, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: Compass, label: "Get Help" },
  { to: "/browse", icon: LayoutGrid, label: "Browse" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/submit", icon: PlusCircle, label: "Submit" },
  { to: "/review", icon: ClipboardCheck, label: "Review" },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="no-print fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
*/

export default function BottomNav() {
  return null;
}
