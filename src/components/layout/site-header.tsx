import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            FS
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">
              Football Stake Tracker
            </p>
            <p className="text-xs text-muted-foreground">FIFA WC 2026</p>
          </div>
        </div>
        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          {[
            ["Dashboard", "/dashboard"],
            ["Matches", "/matches"],
            ["Bets", "/bets"],
            ["Activity", "/activity"],
            ["Admin", "/admin"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={cn(
                "transition-colors hover:text-foreground",
                href === "/" && "text-foreground",
              )}
            >
              {label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
