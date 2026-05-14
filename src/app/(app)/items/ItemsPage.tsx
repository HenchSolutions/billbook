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
import PageHeader from "@/components/PageHeader";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ItemDetailSkeleton from "@/components/skeletons/ItemDetailSkeleton";
import ItemDialog from "@/components/dialogs/ItemDialog";
import { ItemsTable } from "@/components/items/ItemsTable";
import { ItemDetailView } from "@/components/items/ItemDetailView";
import { useItems, useCategories } from "@/hooks/use-items";
import { useDebounce } from "@/hooks/use-debounce";
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
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [includeInactive, setIncludeInactive] = useState(true);
  const debouncedSearch = useDebounce(search, 300);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const formSectionRef = useRef<HTMLDivElement | null>(null);

  const {
    data: itemsData,
    isPending: itemsPending,
    error: itemsError,
  } = useItems({
    search: debouncedSearch || undefined,
    categoryId,
    limit: 100,
    includeInactive,
  });
  const { data: categoriesData } = useCategories();
  const categories = Array.isArray(categoriesData) ? categoriesData : [];

  const filteredItems = itemsData?.items ?? [];
  const isEditing = !!selectedItem;

  useEffect(() => {
    if (formOpen) {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search items..."
          className="w-full sm:max-w-xs"
        />
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 px-3 py-1.5">
          <Switch
            checked={includeInactive}
            onCheckedChange={setIncludeInactive}
            aria-label="Show inactive items"
          />
          <span className="text-sm text-muted-foreground">Show inactive</span>
        </div>
        <Select
          value={categoryId != null ? String(categoryId) : "all"}
          onValueChange={(v) => setCategoryId(v === "all" ? undefined : Number(v))}
        >
          <SelectTrigger className="h-9 w-full min-w-[180px] sm:w-[200px]">
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

      <ErrorBanner error={itemsError} fallbackMessage="Failed to load items" />

      {itemsPending ? (
        <TableSkeleton rows={4} />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="h-5 w-5" />}
          title="No items found"
          action={
            canCreateItem && !formOpen ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ItemsTable
          items={filteredItems}
          onEdit={openEdit}
          {...(canStockLedger
            ? { onViewLedger: (id: number) => router.push(`/items/${id}#stock-ledger`) }
            : {})}
        />
      )}
    </div>
  );
}
