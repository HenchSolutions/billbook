"use client";

import { Suspense, useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EmptyState from "@/components/EmptyState";
import ErrorBanner from "@/components/ErrorBanner";
import SearchInput from "@/components/SearchInput";
import { PageSearchActions, PageSearchCard } from "@/components/PageSearchSection";
import { Label } from "@/components/ui/label";
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import TablePagination from "@/components/TablePagination";
import ItemDetailSkeleton from "@/components/skeletons/ItemDetailSkeleton";
import ItemDialog from "@/components/dialogs/ItemDialog";
import { ItemsTable } from "@/components/items/ItemsTable";
import { ItemDetailView } from "@/components/items/ItemDetailView";
import { useItems, useCategories } from "@/hooks/use-items";
import { useAppliedFilters } from "@/hooks/use-applied-filters";
import { usePagination } from "@/hooks/use-pagination";
import type { Item } from "@/types/item";
import { Switch } from "@/components/ui/switch";
import { usePermissions } from "@/hooks/use-permissions";
import { P } from "@/constants/permissions";
import { PAGE } from "@/constants/page-access";

export default function ItemsPage() {
  const { can } = usePermissions();
  const canCreateItem = can(P.item.create);
  const canStockLedger = can(PAGE.stock_ledger);
  const router = useRouter();
  const params = useParams<{ itemId?: string | string[] }>();
  const itemId = Array.isArray(params?.itemId) ? params.itemId[0] : params?.itemId;
  const {
    draft: searchDraft,
    applied: searchApplied,
    apply: applySearch,
    reset: resetSearch,
    patchDraft,
  } = useAppliedFilters({
    search: "",
    categoryId: undefined as number | undefined,
    includeInactive: true,
  });
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const formSectionRef = useRef<HTMLDivElement | null>(null);
  const { page, setPage, resetPage } = usePagination();
  const pageSize = 20;

  const {
    data: itemsData,
    isPending: itemsPending,
    error: itemsError,
    refetch: refetchItems,
    isRefetching: itemsRefetching,
  } = useItems({
    search: searchApplied.search || undefined,
    categoryId: searchApplied.categoryId,
    limit: pageSize,
    offset: (page - 1) * pageSize,
    includeInactive: searchApplied.includeInactive,
  });
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const filteredItems = itemsData?.items ?? [];
  const totalItemsCount = itemsData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItemsCount / pageSize));
  const itemFiltersActive =
    !!searchApplied.search || searchApplied.categoryId != null || !searchApplied.includeInactive;
  const isEditing = !!selectedItem;

  useEffect(() => {
    if (formOpen) {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [formOpen]);

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setSelectedItem(undefined);
  }, []);

  const openCreate = useCallback(() => {
    setSelectedItem(undefined);
    setFormOpen(true);
  }, []);

  const toggleForm = useCallback(() => {
    if (formOpen && !isEditing) {
      closeForm();
      return;
    }
    openCreate();
  }, [closeForm, formOpen, isEditing, openCreate]);

  const openEdit = useCallback((item: Item) => {
    setSelectedItem(item);
    setFormOpen(true);
  }, []);

  const handleFormOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        closeForm();
        return;
      }
      setFormOpen(true);
    },
    [closeForm],
  );

  if (itemId) {
    return (
      <Suspense fallback={<ItemDetailSkeleton />}>
        <ItemDetailView id={Number(itemId)} />
      </Suspense>
    );
  }

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Items"
        action={
          canCreateItem ? (
            <Button onClick={toggleForm} variant={formOpen && !isEditing ? "outline" : "default"}>
              {formOpen && !isEditing ? (
                <X className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {formOpen ? (isEditing ? "New Item" : "Close Form") : "Add Item"}
            </Button>
          ) : undefined
        }
      />

      {canCreateItem && formOpen ? (
        <div ref={formSectionRef} className="mb-6">
          <ItemDialog
            open={formOpen}
            onOpenChange={handleFormOpenChange}
            item={selectedItem}
            canManageUnits={can(P.item.unit.manage)}
            presentation="inline"
          />
        </div>
      ) : null}

      <PageSearchCard>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1 sm:col-span-2 lg:col-span-1">
            <Label className="text-xs font-medium text-muted-foreground">Item name</Label>
            <SearchInput
              value={searchDraft.search}
              onChange={(v) => patchDraft({ search: v })}
              placeholder="Search items..."
              className="max-w-none"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-medium text-muted-foreground">Category</Label>
            <Select
              value={searchDraft.categoryId != null ? String(searchDraft.categoryId) : "all"}
              onValueChange={(v) => patchDraft({ categoryId: v === "all" ? undefined : Number(v) })}
            >
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <div className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-muted/20 px-3">
              <Switch
                checked={searchDraft.includeInactive}
                onCheckedChange={(checked) => patchDraft({ includeInactive: checked })}
                aria-label="Show inactive items"
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
          clearDisabled={!itemFiltersActive}
        />
      </PageSearchCard>

      <ErrorBanner
        error={itemsError}
        fallbackMessage="Failed to load items"
        onRetry={() => void refetchItems()}
        retrying={itemsRefetching}
      />

      {itemsPending ? (
        <TableSkeleton rows={4} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title={itemFiltersActive ? "No matching items" : "No items found"}
          action={
            itemFiltersActive ? (
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
            ) : canCreateItem && !formOpen ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <ItemsTable
            items={filteredItems}
            onEdit={openEdit}
            {...(canStockLedger
              ? {
                  onViewLedger: (id: number) => router.push(`/items/${id}#stock-ledger`),
                }
              : {})}
          />
          <TablePagination
            page={page}
            pageSize={pageSize}
            total={totalItemsCount}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
