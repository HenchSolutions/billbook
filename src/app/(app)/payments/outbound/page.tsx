"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, ArrowDownLeft, BarChart3, FileSpreadsheet } from "lucide-react";
import { PageSearchActions, PageSearchCard } from "@/components/PageSearchSection";
import { useAppliedFilters } from "@/hooks/use-applied-filters";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import ErrorBanner from "@/components/ErrorBanner";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import EmptyState from "@/components/EmptyState";
import { OutboundPaymentsTable } from "@/components/outbound-payments/OutboundPaymentsTable";
import { useOutboundPayments } from "@/hooks/use-outbound-payments";
import { useParties } from "@/hooks/use-parties";
import { OUTBOUND_CATEGORY_OPTIONS } from "@/constants/outbound-payment";
import type { OutboundPayment, OutboundPaymentCategory } from "@/types/outbound-payment";
import { formatCurrency } from "@/lib/core/utils";

function sumOutboundAmounts(rows: OutboundPayment[]): number {
  return rows.reduce((acc, p) => {
    const n = parseFloat(String(p.amount ?? "0").replace(/,/g, ""));
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);
}

export default function OutboundPaymentsPage() {
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const {
    draft: searchDraft,
    applied: searchApplied,
    apply: applySearch,
    reset: resetSearch,
    patchDraft,
  } = useAppliedFilters<{
    category: OutboundPaymentCategory | "ALL";
    partyIdStr: string;
  }>({
    category: "ALL",
    partyIdStr: "all",
  });

  const appliedPartyId =
    searchApplied.partyIdStr === "all" ? undefined : parseInt(searchApplied.partyIdStr, 10);

  const { data, isPending, error, refetch, isRefetching } = useOutboundPayments({
    page,
    pageSize,
    category: searchApplied.category,
    partyId: Number.isFinite(appliedPartyId) ? appliedPartyId : undefined,
  });

  const { data: partiesData } = useParties({
    includeInactive: true,
    limit: 200,
  });
  const parties = useMemo(
    () => (partiesData?.parties ?? []).filter((p) => p.isActive),
    [partiesData?.parties],
  );
  const partyNamesById = useMemo(() => {
    const m = new Map<number, string>();
    for (const party of partiesData?.parties ?? []) {
      m.set(party.id, party.name);
    }
    return m;
  }, [partiesData?.parties]);

  const payments = data?.payments ?? [];
  const total = data?.count ?? payments.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = total === 0 ? 0 : Math.min(page * pageSize, total);

  const filtersActive = searchApplied.category !== "ALL" || searchApplied.partyIdStr !== "all";
  const pageTotalOutflow = sumOutboundAmounts(payments);

  const handleSearch = () => {
    applySearch();
    setPage(1);
  };

  const handleClear = () => {
    resetSearch();
    setPage(1);
  };

  return (
    <div className="page-container max-w-[96rem] animate-fade-in">
      <PageHeader
        title="Payments"
        action={
          <Button asChild className="shadow-sm">
            <Link href="/payments/outbound/new">
              <Plus className="mr-2 h-4 w-4" />
              Record payment
            </Link>
          </Button>
        }
      />

      <ErrorBanner
        error={error}
        fallbackMessage="Failed to load payments"
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />

      {!isPending && payments.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <BarChart3 className="h-3.5 w-3.5" aria-hidden />
              Matching payments
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-foreground">
              {total.toLocaleString()}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {filtersActive ? "With current filters" : "All vouchers"}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ArrowDownLeft className="h-3.5 w-3.5" aria-hidden />
              This page total
            </div>
            <p className="text-2xl font-semibold tabular-nums tracking-tight text-rose-700">
              {formatCurrency(pageTotalOutflow.toFixed(2))}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {payments.length} row{payments.length === 1 ? "" : "s"} on page {page}
            </p>
          </div>
          <div className="rounded-lg border border-border/60 bg-card p-4 shadow-sm sm:col-span-2 lg:col-span-1">
            <div className="mb-1 text-xs font-medium text-muted-foreground">Visible range</div>
            <p className="text-lg font-semibold tabular-nums text-foreground">
              {rangeStart}–{rangeEnd}
              <span className="text-sm font-normal text-muted-foreground"> of {total}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Row numbers in the table below</p>
          </div>
        </div>
      )}

      <PageSearchCard className="mb-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label
              htmlFor="payment-type-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Payment type
            </Label>
            <Select
              value={searchDraft.category}
              onValueChange={(v) => patchDraft({ category: v as OutboundPaymentCategory | "ALL" })}
            >
              <SelectTrigger id="payment-type-filter" className="h-9 bg-background">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All types</SelectItem>
                {OUTBOUND_CATEGORY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label
              htmlFor="payment-party-filter"
              className="text-xs font-medium text-muted-foreground"
            >
              Party
            </Label>
            <Select
              value={searchDraft.partyIdStr}
              onValueChange={(v) => patchDraft({ partyIdStr: v })}
            >
              <SelectTrigger id="payment-party-filter" className="h-9 bg-background">
                <SelectValue placeholder="All parties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All parties</SelectItem>
                {parties.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
          <Button variant="outline" size="sm" className="h-8 gap-1.5 px-3 text-xs" asChild>
            <Link href="/reports/payout-register" title="Payment register (reports)">
              <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span className="hidden sm:inline">Payment register</span>
              <span className="sm:hidden">Register</span>
            </Link>
          </Button>
          <PageSearchActions
            onSearch={handleSearch}
            onClear={handleClear}
            clearDisabled={!filtersActive}
            className="mt-0 border-0 pt-0"
          />
        </div>
      </PageSearchCard>

      {isPending ? (
        <TableSkeleton rows={8} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<ArrowDownLeft className="h-8 w-8" />}
          title={filtersActive ? "No matching payments" : "No payments yet"}
          action={
            filtersActive ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : (
              <Button asChild>
                <Link href="/payments/outbound/new">Record payment</Link>
              </Button>
            )
          }
        />
      ) : (
        <OutboundPaymentsTable
          payments={payments}
          page={page}
          pageSize={pageSize}
          total={total}
          totalPages={totalPages}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          onPageChange={setPage}
          partyNamesById={partyNamesById}
        />
      )}
    </div>
  );
}
