"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CirclePlay, GraduationCap, Play, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/core/utils";
import { resolveTutorialMedia } from "@/lib/staff-tutorial-video-embed";
import {
  getStaffTutorialWatchUrl,
  STAFF_PRIMARY_CTA_PRIORITY,
  STAFF_WELCOME_MODULES,
  type StaffWelcomeModuleId,
} from "@/constants/staff-welcome-dashboard";

function displayNameFromUser(user: {
  firstName: string | null;
  lastName: string | null;
  email: string;
}): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  const local = user.email.split("@")[0];
  return local || "there";
}

export default function StaffWelcomeDashboard() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const [query, setQuery] = useState("");
  const [player, setPlayer] = useState<{ title: string; watchUrl: string } | null>(null);

  const greeting = user ? displayNameFromUser(user) : "there";

  const playerMedia = useMemo(
    () => (player ? resolveTutorialMedia(player.watchUrl) : null),
    [player],
  );

  const primaryCta = useMemo(
    () => STAFF_PRIMARY_CTA_PRIORITY.find((c) => can(c.pageKey)) ?? null,
    [can],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STAFF_WELCOME_MODULES;
    return STAFF_WELCOME_MODULES.filter((m) => {
      const hay = [m.label, ...m.keywords].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  return (
    <div className="flex w-full flex-col gap-7 px-4 py-6 md:px-6 md:py-8">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-background p-5 md:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CirclePlay className="h-3.5 w-3.5" />
          Quick guides
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome back, {greeting}
          <span className="font-normal" aria-hidden>
            {" "}
            👋
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Start from the shortcut below, then pick a topic for a short walkthrough. When your team
          has added a link, <span className="font-medium text-foreground/90">Watch video</span>{" "}
          plays it here when we can embed it; otherwise use{" "}
          <span className="font-medium text-foreground/90">Open in new tab</span> in the player.
        </p>
        {primaryCta ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
            >
              {primaryCta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : null}
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-lg"
              aria-hidden
            >
              🎓
            </span>
            <div>
              <h2 className="text-xl font-semibold">Help &amp; tutorials</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Videos and shortcuts for sales, stock, parties, payments, and more
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-5">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              type="search"
              placeholder="Search by module or topic…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
              aria-label="Search modules and topics"
            />
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No modules match &quot;{query}&quot;. Try another keyword.
            </p>
          ) : (
            <ul
              className={cn(
                "grid gap-4",
                "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
              )}
            >
              {filtered.map((m) => (
                <li key={m.id}>
                  <ModuleTutorialCard
                    moduleId={m.id}
                    label={m.label}
                    href={m.href}
                    Icon={m.icon}
                    onOpenPlayer={setPlayer}
                  />
                </li>
              ))}
            </ul>
          )}

          <p className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
            <span>
              Every tile is here so you can learn what each area does.{" "}
              <span className="font-medium text-foreground/85">Open …</span> uses your real
              permissions in Billbook. Videos that cannot play inline open cleanly from{" "}
              <span className="font-medium text-foreground/85">Open in new tab</span> in the player.
            </span>
          </p>
        </div>
      </section>

      <Dialog open={player != null} onOpenChange={(open) => !open && setPlayer(null)}>
        <DialogContent
          className={cn(
            "max-h-[90vh] max-w-[calc(100vw-1.5rem)] gap-3 overflow-y-auto p-4 sm:max-w-4xl sm:p-6",
          )}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {player ? (
            <>
              <DialogHeader>
                <DialogTitle>{player.title}</DialogTitle>
                <DialogDescription>
                  {playerMedia?.kind === "external"
                    ? "We could not embed this link here—use Open in new tab to watch in your browser."
                    : "Playing in this window. Prefer the host site? Use Open in new tab below."}
                </DialogDescription>
              </DialogHeader>

              {playerMedia?.kind === "iframe" ? (
                <div className="aspect-video w-full overflow-hidden rounded-md border bg-black shadow-inner">
                  <iframe
                    title={player.title}
                    src={playerMedia.src}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              ) : null}

              {playerMedia?.kind === "video" ? (
                <video
                  controls
                  playsInline
                  className="max-h-[70vh] w-full rounded-md border bg-black"
                  src={playerMedia.src}
                />
              ) : null}

              {playerMedia?.kind === "external" ? (
                <p className="text-sm text-muted-foreground">
                  This link is not shown inline here. Use Open in new tab to watch in your browser.
                </p>
              ) : null}

              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="outline" onClick={() => setPlayer(null)}>
                  Close
                </Button>
                <Button asChild>
                  <a href={player.watchUrl} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                  </a>
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ModuleTutorialCard({
  moduleId,
  label,
  href,
  Icon,
  onOpenPlayer,
}: {
  moduleId: StaffWelcomeModuleId;
  label: string;
  href: string;
  Icon: LucideIcon;
  onOpenPlayer: (payload: { title: string; watchUrl: string }) => void;
}) {
  const watchUrl = getStaffTutorialWatchUrl(moduleId);

  return (
    <article className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-1 flex-col items-center gap-3 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Icon className="h-6 w-6 text-foreground" aria-hidden />
        </div>
        <h3 className="text-sm font-semibold">{label}</h3>
        {watchUrl ? (
          <Button
            type="button"
            className="w-full gap-2 font-medium"
            onClick={() => onOpenPlayer({ title: `${label} tutorial`, watchUrl })}
          >
            <Play className="h-4 w-4 fill-current" aria-hidden />
            Watch video
          </Button>
        ) : (
          <Button
            type="button"
            variant="secondary"
            className="w-full gap-2 font-medium"
            disabled
            aria-label={`${label} tutorial video not available yet`}
          >
            <Play className="h-4 w-4 fill-current opacity-60" aria-hidden />
            Watch video
          </Button>
        )}
        <Link
          href={href}
          className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Open {label}
        </Link>
      </div>
    </article>
  );
}
