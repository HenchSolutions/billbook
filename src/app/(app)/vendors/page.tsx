"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import SearchInput from "@/components/SearchInput";
import { PageSearchActions, PageSearchCard } from "@/components/PageSearchSection";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import TablePagination from "@/components/TablePagination";
import PartyDialog from "@/components/dialogs/PartyDialog";
import { PartiesTable } from "@/components/parties/PartySections";
import { Switch } from "@/components/ui/switch";
import { useParties } from "@/hooks/use-parties";
import { useAppliedFilters } from "@/hooks/use-applied-filters";
import { usePagination } from "@/hooks/use-pagination";
import type { Party } from "@/types/party";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";

const PARTY_TYPE = "SUPPLIER" as const;

export default function Vendors() {
  const { can } = usePermissions();
  const canVendorLedger = can(PAGE.vendors_ledger);
  const router = useRouter();
  const {
    draft: searchDraft,
    applied: searchApplied,
    apply: applySearch,
    reset: resetSearch,
    patchDraft,
  } = useAppliedFilters({ search: "", includeInactive: true });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState<Party | undefined>();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const { page, setPage, resetPage } = usePagination();
  const pageSize = 20;

  const { data, isPending, error, refetch, isRefetching } = useParties({
    type: PARTY_TYPE,
    includeInactive: searchApplied.includeInactive,
    search: searchApplied.search || undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  const parties = data?.parties ?? [];
  const totalParties = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalParties / pageSize));
  const isEditing = !!selectedParty;
  const partyFiltersActive = !!searchApplied.search || !searchApplied.includeInactive;

  useEffect(() => {
    if (formOpen) {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [formOpen]);

  const closeForm = () => {
    setFormOpen(false);
    setSelectedParty(undefined);
  };

  const openCreate = () => {
    setSelectedParty(undefined);
    setFormOpen(true);
  };

  const toggleForm = () => {
    if (formOpen && !isEditing) {
      closeForm();
      return;
    }
    openCreate();
  };

  const openEdit = (p: Party) => {
    setSelectedParty(p);
    setFormOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    if (!open) {
      closeForm();
      return;
    }
    setFormOpen(true);
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Vendor"
        action={
          <Button onClick={toggleForm} variant={formOpen && !isEditing ? "outline" : "default"}>
            {formOpen && !isEditing ? (
              <X className="mr-2 h-4 w-4" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {formOpen ? (isEditing ? "New Vendor" : "Close Form") : "Add Vendor"}
          </Button>
        }
      />

      {formOpen ? (
        <div ref={formSectionRef} className="mb-6">
          <PartyDialog
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            party={selectedParty}
            defaultType={PARTY_TYPE}
            typeLocked
            presentation="inline"
          />
        </div>
      ) : null}

      <PageSearchCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Vendor name</Label>
            <SearchInput
              value={searchDraft.search}
              onChange={(v) => patchDraft({ search: v })}
              placeholder="Search vendors..."
              className="max-w-none"
            />
          </div>
          <div className="flex items-end">
            <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 sm:max-w-xs">
              <Switch
                checked={searchDraft.includeInactive}
                onCheckedChange={(checked) => patchDraft({ includeInactive: checked })}
                aria-label="Show inactive vendors"
              />
              <span className="text-sm text-muted-foreground">Show inactive</span>
            </div>
          </div>
        </div>
        <PageSearchActions
          onSearch={() => {
            applySearch();
            resetPage();
          }}
          onClear={() => {
            resetSearch();
            resetPage();
          }}
          clearDisabled={!searchApplied.search && searchApplied.includeInactive}
        />
      </PageSearchCard>

      <ErrorBanner
        error={error}
        fallbackMessage="Failed to load vendors"
        onRetry={() => void refetch()}
        retrying={isRefetching}
      />

      {isPending ? (
        <TableSkeleton rows={3} />
      ) : parties.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-5 w-5" />}
          title={partyFiltersActive ? "No matching vendors" : "No vendors found"}
          action={
            partyFiltersActive ? (
              <button
                type="button"
                onClick={() => {
                  resetSearch();
                  resetPage();
                }}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            ) : !formOpen ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vendor
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <PartiesTable
            parties={parties}
            onEdit={openEdit}
            onLedger={(partyId) => router.push(`/vendors/${partyId}/ledger`)}
            showLedger={canVendorLedger}
          />
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={totalParties}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
