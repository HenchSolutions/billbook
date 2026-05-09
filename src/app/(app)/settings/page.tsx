"use client";

import { Building2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { DocumentNumberingCard } from "@/components/settings/SettingsSections";

export default function SettingsPage() {
  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Business settings" />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-10">
        <section aria-labelledby="org-settings-heading">
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md"
              aria-hidden
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2
                id="org-settings-heading"
                className="flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                Organization
                <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                  Business settings
                </span>
              </h2>
            </div>
          </div>

          <div className="rounded-lg border border-border/60 bg-card shadow-sm ring-1 ring-black/5 dark:ring-white/10">
            <div className="p-6 sm:p-8">
              <DocumentNumberingCard embedded />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
