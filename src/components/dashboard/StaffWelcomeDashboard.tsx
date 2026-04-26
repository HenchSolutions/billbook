"use client";

import { useMemo, useState, type ElementType } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CirclePlay,
  FileText,
  GraduationCap,
  Package,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShoppingCart,
  Users,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/core/utils";
import { PAGE } from "@/constants/page-access";

type ModuleTutorial = {
  id: string;
  label: string;
  keywords: string[];
  icon: ElementType;
  href: string;
  pageKey: string;
};

const MODULES: ModuleTutorial[] = [
  {
    id: "sales",
    label: "Sales",
    keywords: ["invoice", "sales", "billing"],
    icon: FileText,
    href: "/invoices/sales",
    pageKey: PAGE.invoices_sales,
  },
  {
    id: "items",
    label: "Items",
    keywords: ["product", "sku", "inventory"],
    icon: Package,
    href: "/items",
    pageKey: PAGE.items,
  },
  {
    id: "customers",
    label: "Customers",
    keywords: ["party", "client", "ledger"],
    icon: Users,
    href: "/parties",
    pageKey: PAGE.parties,
  },
  {
    id: "payments",
    label: "Payments",
    keywords: ["pay", "outbound", "vendor"],
    icon: Wallet,
    href: "/payments/outbound",
    pageKey: PAGE.payments_outbound,
  },
  {
    id: "purchase",
    label: "Purchase",
    keywords: ["purchase", "vendor bill"],
    icon: ShoppingCart,
    href: "/invoices/purchases",
    pageKey: PAGE.invoices_purchases,
  },
  {
    id: "returns",
    label: "Returns",
    keywords: ["return", "credit", "debit"],
    icon: RotateCcw,
    href: "/invoices/sales-return",
    pageKey: PAGE.invoices_sales_return,
  },
  {
    id: "reports",
    label: "Reports",
    keywords: ["register", "gst", "analytics"],
    icon: BarChart3,
    href: "/reports",
    pageKey: PAGE.reports,
  },
  {
    id: "settings",
    label: "Settings",
    keywords: ["business", "profile", "team", "roles"],
    icon: Settings,
    href: "/settings",
    pageKey: PAGE.settings,
  },
];

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

  const greeting = user ? displayNameFromUser(user) : "there";

  const visibleModules = useMemo(() => MODULES.filter((m) => can(m.pageKey)), [can]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visibleModules;
    return visibleModules.filter((m) => {
      const hay = [m.label, ...m.keywords].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, visibleModules]);

  const onWatchVideo = (moduleLabel: string) => {
    toast.info("Videos coming soon", {
      description: `${moduleLabel} tutorials will appear here. For now, open the module from the sidebar or use the link below.`,
    });
  };

  return (
    <div className="flex w-full flex-col gap-7 px-4 py-6 md:px-6 md:py-8">
      <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-r from-primary/10 via-background to-background p-5 md:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl" />
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CirclePlay className="h-3.5 w-3.5" />
          Staff workspace onboarding
        </p>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Welcome, {greeting}{" "}
          <span className="font-normal" aria-hidden>
            👋
          </span>
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground">
          Get started quickly with module tutorials and shortcuts. We are keeping videos as
          placeholders for now, while keeping direct access to every workflow.
        </p>
        {(can(PAGE.invoices_sales) || can(PAGE.reports)) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {can(PAGE.invoices_sales) && (
              <Link
                href="/invoices/sales"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
              >
                Start with Sales
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
            {can(PAGE.reports) && (
              <Link
                href="/reports"
                className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                View reports
              </Link>
            )}
          </div>
        )}
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
              <h2 className="text-xl font-semibold">Help &amp; Tutorials</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Learn how to use each module</p>
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
              placeholder="Search module..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-10 pl-9"
              aria-label="Search modules"
            />
          </div>

          {visibleModules.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              You currently do not have access to tutorial modules. Please contact your owner to
              update role permissions.
            </p>
          ) : filtered.length === 0 ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              No modules match &quot;{query}&quot;. Try another keyword.
            </p>
          ) : (
            <ul className={cn("grid gap-4", "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4")}>
              {filtered.map((m) => (
                <li key={m.id}>
                  <article className="flex h-full flex-col rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
                    <div className="flex flex-1 flex-col items-center gap-3 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <m.icon className="h-6 w-6 text-foreground" aria-hidden />
                      </div>
                      <h3 className="text-sm font-semibold">{m.label}</h3>
                      <Button
                        type="button"
                        className="w-full gap-2 font-medium"
                        onClick={() => onWatchVideo(m.label)}
                      >
                        <Play className="h-4 w-4 fill-current" aria-hidden />
                        Watch Video
                      </Button>
                      <Link
                        href={m.href}
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Open {m.label}
                      </Link>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}

          <p className="flex items-start gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-foreground/70" aria-hidden />
            <span>
              Tip: Use the sidebar for full workflows. This grid is a quick map — we will wire each
              &quot;Watch Video&quot; to hosted guides when content is ready.
            </span>
          </p>
        </div>
      </section>
    </div>
  );
}
