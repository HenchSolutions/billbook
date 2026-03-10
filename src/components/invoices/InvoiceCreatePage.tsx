"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import ItemDialog from "@/components/dialogs/ItemDialog";
import PartyDialog from "@/components/dialogs/PartyDialog";
import { DateField } from "@/components/invoices/invoice-create/DateField";
import {
  createLine,
  formatQty,
  getCostFloorViolation,
  getEntryDateIso,
  getEntryTotalQty,
  getLineAmounts,
  getMaxAllowedDiscountPercent,
  toNum,
} from "@/lib/invoice-create";
import type { InvoiceLineDraft, StockChoice, StockLineIssue } from "@/types/invoice-create";
import { PartyAutocomplete } from "@/components/invoices/PartyAutocomplete";
import { useCreateInvoice } from "@/hooks/use-invoices";
import { getStockEntryById, useItems, useStockEntries } from "@/hooks/use-items";
import { useParties } from "@/hooks/use-parties";
import { useDebounce } from "@/hooks/use-debounce";
import { formatISODateDisplay } from "@/lib/date";
import { INVOICE_TYPE_OPTIONS, isSalesFamily } from "@/lib/invoice";
import { cn, formatCurrency } from "@/lib/utils";
import { showErrorToast, showSuccessToast } from "@/lib/toast-helpers";
import type { Item, StockEntry } from "@/types/item";
import type { Party } from "@/types/party";
import type { InvoiceType } from "@/types/invoice";

interface InvoiceCreatePageProps {
  initialType: InvoiceType;
}

export function InvoiceCreatePage({ initialType }: InvoiceCreatePageProps) {
  const router = useRouter();
  const createInvoice = useCreateInvoice();

  const invoiceType: InvoiceType = initialType;
  const [party, setParty] = useState<Party | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [roundOffAmount, setRoundOffAmount] = useState("0");
  const [autoRoundOff, setAutoRoundOff] = useState(false);
  const [lines, setLines] = useState<InvoiceLineDraft[]>([createLine()]);

  const [addPartyDialogOpen, setAddPartyDialogOpen] = useState(false);
  const [pendingPartyName, setPendingPartyName] = useState("");
  const [stockSearchOpen, setStockSearchOpen] = useState(false);
  const [stockSearchText, setStockSearchText] = useState("");
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [pendingItemName, setPendingItemName] = useState("");
  const [qtyAutoAdjusted, setQtyAutoAdjusted] = useState(false);
  const [stockLineIssues, setStockLineIssues] = useState<Record<string, StockLineIssue>>({});
  const [focusedIssueLineId, setFocusedIssueLineId] = useState<string | null>(null);
  const debouncedStockSearch = useDebounce(stockSearchText, 300);

  useEffect(() => {
    if (!qtyAutoAdjusted) return;
    const timer = setTimeout(() => setQtyAutoAdjusted(false), 1200);
    return () => clearTimeout(timer);
  }, [qtyAutoAdjusted]);

  useEffect(() => {
    if (!focusedIssueLineId) return;
    const rowEl = document.getElementById(`added-line-${focusedIssueLineId}`);
    rowEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    if (rowEl instanceof HTMLElement) rowEl.focus();

    const timer = setTimeout(() => setFocusedIssueLineId(null), 1200);
    return () => clearTimeout(timer);
  }, [focusedIssueLineId]);

  const partyType = isSalesFamily(invoiceType) ? "CUSTOMER" : "SUPPLIER";
  const pageMeta =
    INVOICE_TYPE_OPTIONS.find((o) => o.type === invoiceType) ?? INVOICE_TYPE_OPTIONS[0];

  const { data: partiesData } = useParties({ type: partyType, includeInactive: false });
  const { data: itemsData } = useItems({
    includeInactive: false,
    search: debouncedStockSearch || undefined,
    limit: 100,
  });
  const { data: stockEntriesData, error: stockEntriesError } = useStockEntries({
    search: debouncedStockSearch || undefined,
    limit: 100,
  });

  const parties = useMemo(
    () => (partiesData?.parties ?? []).filter((p) => p.isActive),
    [partiesData],
  );
  const items = useMemo(() => (itemsData?.items ?? []).filter((i) => i.isActive), [itemsData]);
  const stockEntries = useMemo(() => stockEntriesData?.entries ?? [], [stockEntriesData]);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const draftLine = lines[0] ?? createLine();
  const addedLines = lines.slice(1);

  const usedQtyByEntryId = useMemo(() => {
    const map = new Map<number, number>();
    for (const line of addedLines) {
      if (line.stockEntryId == null) continue;
      const qty = Math.max(0, toNum(line.quantity));
      map.set(line.stockEntryId, (map.get(line.stockEntryId) ?? 0) + qty);
    }
    return map;
  }, [addedLines]);

  const stockChoices = useMemo(() => {
    const grouped = new Map<number, StockEntry[]>();
    for (const entry of stockEntries) {
      const item = itemMap.get(entry.itemId);
      if (!item || !item.isActive) continue;
      const list = grouped.get(entry.itemId) ?? [];
      list.push(entry);
      grouped.set(entry.itemId, list);
    }

    const result: StockChoice[] = [];
    for (const [itemId, entryList] of grouped.entries()) {
      const sorted = [...entryList].sort((a, b) => {
        const aTime = new Date(a.purchaseDate ?? a.createdAt).getTime();
        const bTime = new Date(b.purchaseDate ?? b.createdAt).getTime();
        // FIFO: consume oldest purchased stock first.
        return aTime - bTime;
      });
      const item = itemMap.get(itemId);
      if (!item) continue;
      const isService = item.type === "SERVICE";
      const firstAvailableIndex = sorted.findIndex((entry) => {
        if (isService) return true;
        const available = getEntryTotalQty(entry);
        const used = usedQtyByEntryId.get(entry.id) ?? 0;
        return available - used > 0;
      });

      for (let index = 0; index < sorted.length; index += 1) {
        const entry = sorted[index];
        const availableQty = getEntryTotalQty(entry);
        const usedQty = usedQtyByEntryId.get(entry.id) ?? 0;
        const remainingQty = Math.max(0, availableQty - usedQty);
        if (!isService && remainingQty <= 0) continue;
        const enabledForSelection =
          isService ||
          (firstAvailableIndex >= 0 && index === firstAvailableIndex && remainingQty > 0);

        result.push({
          entry,
          item,
          availableQty,
          usedQty,
          remainingQty,
          enabledForSelection,
        });
      }
    }

    result.sort((a, b) => {
      const itemCompare = a.item.name.localeCompare(b.item.name);
      if (itemCompare !== 0) return itemCompare;
      const aTime = new Date(a.entry.purchaseDate ?? a.entry.createdAt).getTime();
      const bTime = new Date(b.entry.purchaseDate ?? b.entry.createdAt).getTime();
      return aTime - bTime;
    });

    return result;
  }, [stockEntries, itemMap, usedQtyByEntryId]);

  const filteredStockChoices = useMemo(() => {
    const q = stockSearchText.trim().toLowerCase();
    if (!q) return stockChoices;
    return stockChoices.filter((choice) => {
      const text = [
        choice.item.name,
        String(choice.entry.id),
        choice.entry.supplierName ?? "",
        getEntryDateIso(choice.entry),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q);
    });
  }, [stockChoices, stockSearchText]);

  const itemsWithoutStockOptions = useMemo(() => {
    const itemIdsWithChoices = new Set(stockChoices.map((choice) => choice.item.id));
    const candidates = items.filter(
      (item) => item.type === "STOCK" && item.isActive && !itemIdsWithChoices.has(item.id),
    );

    const q = stockSearchText.trim().toLowerCase();
    if (!q) return candidates.slice(0, 20);
    return candidates.filter((item) => item.name.toLowerCase().includes(q)).slice(0, 20);
  }, [items, stockChoices, stockSearchText]);

  const exactItemMatch = useMemo(() => {
    const q = stockSearchText.trim().toLowerCase();
    if (!q) return false;
    return items.some((item) => item.name.trim().toLowerCase() === q);
  }, [items, stockSearchText]);

  const showAddItemOption =
    stockSearchText.trim().length > 0 &&
    !exactItemMatch &&
    filteredStockChoices.length === 0 &&
    itemsWithoutStockOptions.length === 0;

  const updateLine = (lineId: string, patch: Partial<InvoiceLineDraft>) => {
    setLines((prev) => prev.map((line) => (line.id === lineId ? { ...line, ...patch } : line)));
    setStockLineIssues((prev) => {
      if (!prev[lineId]) return prev;
      const next = { ...prev };
      delete next[lineId];
      return next;
    });
  };

  const handleStockChoiceSelect = (lineId: string, choice: StockChoice) => {
    if (!choice.enabledForSelection) return;
    updateLine(lineId, {
      item: choice.item,
      stockEntryId: choice.entry.id,
      unitPrice: choice.entry.sellingPrice ?? "",
      quantity: "1",
      discountPercent: "",
      cgstRate: choice.item.cgstRate ?? "0",
      sgstRate: choice.item.sgstRate ?? "0",
      igstRate: choice.item.igstRate ?? "0",
    });
    setStockSearchOpen(false);
    setStockSearchText("");
  };

  const handleAddStockForItem = (item: Item) => {
    const params = new URLSearchParams({ addItemId: String(item.id) });
    router.push(`/stock?${params.toString()}`);
  };

  const handleLineDiscountChange = (lineId: string, value: string) => {
    const line = lines.find((x) => x.id === lineId);
    if (!line) return;

    if (value.trim() === "") {
      updateLine(lineId, { discountPercent: "" });
      return;
    }

    const parsed = toNum(value);
    const safePercent = Math.min(100, Math.max(0, parsed));
    const maxAllowed = getMaxAllowedDiscountPercent(line, stockEntries);

    if (safePercent > maxAllowed) {
      updateLine(lineId, { discountPercent: maxAllowed.toFixed(2) });
      showErrorToast(
        null,
        "Discount cannot reduce selling price below cost price for this stock batch",
      );
      return;
    }

    updateLine(lineId, { discountPercent: value });
  };

  const addCurrentLine = async () => {
    if (!isLineValid(draftLine)) {
      showErrorToast(null, "Complete item entry before adding");
      return;
    }

    const selectedEntryId = draftLine.stockEntryId;
    const selectedEntry =
      selectedEntryId == null
        ? undefined
        : ((await getStockEntryById(selectedEntryId).catch(() => null)) ??
          stockEntries.find((entry) => entry.id === selectedEntryId));
    if (selectedEntry) {
      const available = getEntryTotalQty(selectedEntry);
      const used = usedQtyByEntryId.get(selectedEntry.id) ?? 0;
      const remaining = Math.max(0, available - used);
      const requested = Math.max(0, toNum(draftLine.quantity));
      if (requested > remaining) {
        if (remaining <= 0) {
          showErrorToast(
            null,
            "Selected batch is fully used. Please choose the next available batch.",
          );
          return;
        }

        updateLine(draftLine.id, { quantity: formatQty(remaining) });
        setQtyAutoAdjusted(true);
        showErrorToast(
          null,
          `Only ${formatQty(remaining)} available in this batch. Quantity updated to max available. Click Add again.`,
        );
        return;
      }
    } else {
      showErrorToast(null, "Unable to validate selected stock batch. Please reselect the batch.");
      return;
    }

    const costViolation = getCostFloorViolation(draftLine, stockEntries);
    if (costViolation) {
      showErrorToast(
        null,
        `Discount is too high. Net rate (${formatCurrency(costViolation.netUnitPrice)}) cannot be below cost (${formatCurrency(costViolation.costPrice)}).`,
      );
      return;
    }

    setLines((prev) => {
      const current = prev[0] ?? createLine();
      const normalizedCurrent = {
        ...current,
        discountPercent: current.discountPercent.trim() === "" ? "0" : current.discountPercent,
      };
      return [createLine(), normalizedCurrent, ...prev.slice(1)];
    });
    setStockLineIssues({});
  };

  const removeAddedLine = (lineId: string) => {
    setLines((prev) => [prev[0], ...prev.slice(1).filter((line) => line.id !== lineId)]);
    setStockLineIssues((prev) => {
      if (!prev[lineId]) return prev;
      const next = { ...prev };
      delete next[lineId];
      return next;
    });
  };

  const summary = useMemo(() => {
    const lineBreakup = addedLines.map((line) => getLineAmounts(line));
    const subTotal = lineBreakup.reduce((sum, x) => sum + x.gross, 0);
    const lineDiscountTotal = lineBreakup.reduce((sum, x) => sum + x.lineDiscount, 0);
    const taxableTotal = lineBreakup.reduce((sum, x) => sum + x.taxable, 0);
    const taxTotal = lineBreakup.reduce((sum, x) => sum + x.tax, 0);

    const invoiceDiscount = discountAmount.trim()
      ? Math.max(0, toNum(discountAmount))
      : (subTotal * Math.max(0, toNum(discountPercent))) / 100;

    const baseTotal = Math.max(0, taxableTotal + taxTotal - invoiceDiscount);
    const roundOff = autoRoundOff ? Math.round(baseTotal) - baseTotal : toNum(roundOffAmount);
    const grandTotal = Math.max(0, baseTotal + roundOff);

    return {
      subTotal,
      lineDiscountTotal,
      taxableTotal,
      invoiceDiscount,
      taxTotal,
      taxPercent: taxableTotal > 0 ? (taxTotal / taxableTotal) * 100 : 0,
      roundOff,
      grandTotal,
    };
  }, [addedLines, discountAmount, discountPercent, roundOffAmount, autoRoundOff]);

  const isLineValid = (line: InvoiceLineDraft) => {
    if (!line.item) return false;
    if (line.stockEntryId == null) return false;
    const qty = toNum(line.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return false;
    return true;
  };

  const canSubmit = party != null && addedLines.length > 0;

  const validateLiveStockForAddedLines = async (): Promise<StockLineIssue[]> => {
    const issues: StockLineIssue[] = [];
    const linesByEntryId = new Map<number, InvoiceLineDraft[]>();

    for (const line of addedLines) {
      if (line.stockEntryId == null) continue;
      const list = linesByEntryId.get(line.stockEntryId) ?? [];
      list.push(line);
      linesByEntryId.set(line.stockEntryId, list);
    }

    for (const [entryId, entryLines] of linesByEntryId.entries()) {
      const liveEntry = await getStockEntryById(entryId).catch(() => null);
      if (!liveEntry) {
        for (const line of entryLines) {
          issues.push({
            lineId: line.id,
            entryId,
            itemName: line.item?.name ?? "selected item",
            selectedQty: Math.max(0, toNum(line.quantity)),
            availableQty: 0,
            suggestedQty: 0,
            message: "Could not validate this batch. Please reselect batch.",
          });
        }
        continue;
      }

      let remaining = Math.max(0, getEntryTotalQty(liveEntry));
      for (const line of entryLines) {
        const selectedQty = Math.max(0, toNum(line.quantity));
        const allowedQty = Math.max(0, Math.min(selectedQty, remaining));

        if (selectedQty > allowedQty) {
          issues.push({
            lineId: line.id,
            entryId,
            itemName: line.item?.name ?? "selected item",
            selectedQty,
            availableQty: remaining,
            suggestedQty: allowedQty,
            message:
              remaining <= 0
                ? "This batch is fully consumed now. Select next batch."
                : `Only ${formatQty(remaining)} available. Use Fix qty.`,
          });
        }

        remaining = Math.max(0, remaining - allowedQty);
      }
    }

    return issues;
  };

  const applySuggestedQtyForLine = (lineId: string) => {
    const issue = stockLineIssues[lineId];
    if (!issue) return;

    if (issue.suggestedQty <= 0) {
      showErrorToast(null, "No stock left in this batch. Please select the next available batch.");
      return;
    }

    updateLine(lineId, { quantity: formatQty(issue.suggestedQty) });
    setQtyAutoAdjusted(true);
    showSuccessToast(`Quantity updated to ${formatQty(issue.suggestedQty)} for ${issue.itemName}.`);
  };

  const handleCreate = async () => {
    if (!party) {
      showErrorToast(null, "Please select a party");
      return;
    }

    if (addedLines.length === 0 || !addedLines.every(isLineValid)) {
      showErrorToast(null, "Add at least one valid item row");
      return;
    }

    const liveIssues = await validateLiveStockForAddedLines();
    if (liveIssues.length > 0) {
      const issueMap = Object.fromEntries(liveIssues.map((issue) => [issue.lineId, issue]));
      setStockLineIssues(issueMap);
      setFocusedIssueLineId(liveIssues[0]?.lineId ?? null);
      showErrorToast(
        null,
        `Stock changed for ${liveIssues.length} line(s). Use Fix qty or reselect batch.`,
      );
      return;
    }

    setStockLineIssues({});

    const invalidCostLine = addedLines.find((line) => getCostFloorViolation(line, stockEntries));
    if (invalidCostLine) {
      const violation = getCostFloorViolation(invalidCostLine, stockEntries);
      showErrorToast(
        null,
        `Discount is too high for ${invalidCostLine.item?.name ?? "selected item"}. Net rate (${formatCurrency(violation?.netUnitPrice ?? 0)}) cannot be below cost (${formatCurrency(violation?.costPrice ?? 0)}).`,
      );
      return;
    }

    try {
      await createInvoice.mutateAsync({
        partyId: party.id,
        invoiceType,
        invoiceDate,
        dueDate: dueDate || undefined,
        notes: notes || undefined,
        discountAmount: discountAmount || undefined,
        discountPercent: discountPercent || undefined,
        roundOffAmount: summary.roundOff.toFixed(2),
        items: addedLines.map((line) => ({
          stockEntryId: line.stockEntryId!,
          quantity: line.quantity,
          unitPrice: line.unitPrice || undefined,
          discountPercent: line.discountPercent.trim() === "" ? "0" : line.discountPercent,
        })),
      });

      showSuccessToast(`${pageMeta.label} created`);
      router.push(pageMeta.path);
    } catch (err) {
      showErrorToast(err, `Failed to create ${pageMeta.label.toLowerCase()}`);
    }
  };

  const roundOffInputValue = autoRoundOff ? summary.roundOff.toFixed(2) : roundOffAmount;

  return (
    <div className="page-container max-w-[96rem] animate-fade-in space-y-5">
      <PageHeader
        title={`Create ${pageMeta.label}`}
        description="Create invoices quickly with stock-aware item selection"
        action={
          <Button variant="outline" asChild>
            <Link href={pageMeta.path}>Back to List</Link>
          </Button>
        }
      />

      <ErrorBanner error={stockEntriesError} fallbackMessage="Failed to load stock entries" />

      <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Party Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>{partyType === "CUSTOMER" ? "Customer" : "Vendor"} *</Label>
              <PartyAutocomplete
                value={party}
                onValueChange={setParty}
                parties={parties}
                placeholder={`Search ${partyType === "CUSTOMER" ? "customer" : "vendor"}...`}
                addLabel={partyType === "CUSTOMER" ? "Add customer" : "Add vendor"}
                onAddParty={(_, draftName) => {
                  setPendingPartyName((draftName ?? "").trim());
                  setAddPartyDialogOpen(true);
                }}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bill Discount Amount</Label>
                <Input value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bill Discount %</Label>
                <Input
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <DateField label="Invoice Date" value={invoiceDate} onChange={setInvoiceDate} />
            <DateField label="Due Date" value={dueDate} onChange={setDueDate} />
            <div className="space-y-2 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Item Entry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 rounded-lg border p-3 xl:grid-cols-[2.2fr_.7fr_1fr_.9fr_1fr_1fr_1fr_.8fr] xl:items-end">
            <div>
              <Label className="mb-1.5 block text-xs">Batch *</Label>
              <Popover open={stockSearchOpen} onOpenChange={setStockSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-start text-left font-normal"
                  >
                    {draftLine.stockEntryId ? (
                      <span className="truncate">
                        {draftLine.item?.name ?? "Item"} | Batch{" "}
                        {formatISODateDisplay(
                          getEntryDateIso(
                            stockEntries.find((entry) => entry.id === draftLine.stockEntryId) ??
                              ({ purchaseDate: "", createdAt: "" } as StockEntry),
                          ),
                        ) || "No date"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Search stock batches</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-[min(38rem,calc(100vw-1rem))] p-0">
                  <Command shouldFilter={false}>
                    <div className="border-b p-2">
                      <Input
                        value={stockSearchText}
                        onChange={(e) => setStockSearchText(e.target.value)}
                        placeholder="Search by item, purchase date, or vendor"
                        className="h-8"
                      />
                    </div>
                    <CommandList className="max-h-[360px]">
                      <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                        No matching stock entries found.
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredStockChoices.map((choice) => {
                          const dateText = formatISODateDisplay(getEntryDateIso(choice.entry));
                          const isSelected = draftLine.stockEntryId === choice.entry.id;
                          const statusText = choice.enabledForSelection
                            ? choice.item.type === "SERVICE"
                              ? "Service item"
                              : `Available ${choice.remainingQty}`
                            : choice.remainingQty <= 0
                              ? "Used up"
                              : "Locked until older batch is used";

                          return (
                            <CommandItem
                              key={choice.entry.id}
                              value={`${choice.item.name}-${choice.entry.id}`}
                              onSelect={() => handleStockChoiceSelect(draftLine.id, choice)}
                              className={cn(
                                "items-start py-2 transition-colors",
                                choice.enabledForSelection
                                  ? "cursor-pointer text-foreground hover:bg-muted/50 data-[selected=true]:bg-primary/15 data-[selected=true]:text-foreground"
                                  : "cursor-not-allowed bg-muted/30 text-muted-foreground hover:bg-muted/50 data-[selected=true]:bg-muted/50 data-[selected=true]:text-muted-foreground",
                              )}
                            >
                              <div className="min-w-0 flex-1">
                                <div
                                  className={cn(
                                    "truncate text-sm",
                                    choice.enabledForSelection
                                      ? "font-medium text-foreground"
                                      : "font-normal text-muted-foreground",
                                  )}
                                >
                                  {choice.item.name}
                                </div>
                                <div
                                  className={cn(
                                    "mt-0.5 truncate text-xs",
                                    choice.enabledForSelection
                                      ? "text-muted-foreground"
                                      : "text-muted-foreground/80",
                                  )}
                                >
                                  Batch: {dateText || "No date"} | Price:{" "}
                                  {formatCurrency(choice.entry.sellingPrice)}
                                  {choice.item.hsnCode ? ` | HSN: ${choice.item.hsnCode}` : ""}
                                  {choice.item.type === "STOCK"
                                    ? ` | Remaining: ${choice.remainingQty}`
                                    : ""}
                                </div>
                                <div
                                  className={cn(
                                    "mt-0.5 text-[11px]",
                                    choice.enabledForSelection
                                      ? "text-emerald-600"
                                      : "text-muted-foreground/90",
                                  )}
                                >
                                  {statusText}
                                </div>
                              </div>
                              {isSelected && (
                                <span className="ml-2 text-xs text-primary">Selected</span>
                              )}
                            </CommandItem>
                          );
                        })}

                        {itemsWithoutStockOptions.map((item) => (
                          <CommandItem
                            key={`no-stock-${item.id}`}
                            value={`no-stock-${item.id}-${item.name}`}
                            onSelect={() => handleAddStockForItem(item)}
                            className="items-start py-2 text-foreground transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">{item.name}</div>
                              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                No stock available for this item.
                              </div>
                              <div className="mt-0.5 text-[11px] text-primary">
                                Add stock for this item
                              </div>
                            </div>
                          </CommandItem>
                        ))}

                        {showAddItemOption && (
                          <CommandItem
                            value={`add-item-${stockSearchText.trim().toLowerCase()}`}
                            onSelect={() => {
                              setPendingItemName(stockSearchText.trim());
                              setAddItemDialogOpen(true);
                            }}
                            className="items-start py-2 text-foreground transition-colors hover:bg-muted/50"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium">
                                Add new item "{stockSearchText.trim()}"
                              </div>
                              <div className="mt-0.5 truncate text-xs text-muted-foreground">
                                Item not found. Create it and then add stock.
                              </div>
                            </div>
                          </CommandItem>
                        )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Qty</Label>
              <Input
                value={draftLine.quantity}
                onChange={(e) => updateLine(draftLine.id, { quantity: e.target.value })}
                className={cn(
                  "text-right tabular-nums transition-colors",
                  qtyAutoAdjusted &&
                    "animate-pulse bg-amber-50 ring-2 ring-amber-300 focus-visible:ring-amber-400",
                )}
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Unit Price</Label>
              <Input value={draftLine.unitPrice} disabled className="text-right tabular-nums" />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Item Discount %</Label>
              <Input
                value={draftLine.discountPercent}
                onChange={(e) => handleLineDiscountChange(draftLine.id, e.target.value)}
                placeholder="0"
                className="text-right tabular-nums"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Taxable Amount</Label>
              <Input
                value={formatCurrency(getLineAmounts(draftLine).taxable)}
                disabled
                className="text-right"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Tax Amount</Label>
              <Input
                value={formatCurrency(getLineAmounts(draftLine).tax)}
                disabled
                className="text-right"
              />
            </div>

            <div>
              <Label className="mb-1.5 block text-xs">Net Amount</Label>
              <Input
                value={formatCurrency(getLineAmounts(draftLine).total)}
                disabled
                className="text-right"
              />
            </div>

            <div className="flex items-end justify-end">
              <Button type="button" onClick={addCurrentLine} className="w-full xl:w-auto">
                <Plus className="mr-1 h-3.5 w-3.5" />
                Add
              </Button>
            </div>
          </div>

          {addedLines.length > 0 && (
            <div className="data-table-container -mx-1 px-1 sm:mx-0 sm:px-0">
              <table className="w-full min-w-[960px] text-sm" aria-label="Added invoice items">
                <thead>
                  <tr className="border-b bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-left">HSN</th>
                    <th className="px-3 py-2 text-left">Stock Batch</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Unit Price</th>
                    <th className="px-3 py-2 text-right">Item Discount %</th>
                    <th className="px-3 py-2 text-right">Taxable Amount</th>
                    <th className="px-3 py-2 text-right">Tax Amount</th>
                    <th className="px-3 py-2 text-right">Net Amount</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addedLines.map((line) => {
                    const totals = getLineAmounts(line);
                    const lineEntry = stockEntries.find((entry) => entry.id === line.stockEntryId);
                    const lineIssue = stockLineIssues[line.id];
                    return (
                      <tr
                        key={line.id}
                        id={`added-line-${line.id}`}
                        tabIndex={-1}
                        className={cn(
                          "border-b outline-none last:border-0 hover:bg-muted/20",
                          lineIssue && "bg-amber-50/60",
                          focusedIssueLineId === line.id && "ring-2 ring-amber-300",
                        )}
                      >
                        <td className="px-3 py-2.5">
                          <div>{line.item?.name ?? "-"}</div>
                          {lineIssue && (
                            <div className="mt-1 inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[11px] text-amber-800">
                              {lineIssue.message}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-xs text-muted-foreground">
                          {line.item?.hsnCode ?? "-"}
                        </td>
                        <td className="px-3 py-2.5">
                          {lineEntry
                            ? formatISODateDisplay(getEntryDateIso(lineEntry)) || "No date"
                            : "-"}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">{line.quantity}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatCurrency(line.unitPrice)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {line.discountPercent.trim() === "" ? "0" : line.discountPercent}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatCurrency(totals.taxable)}
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums">
                          {formatCurrency(totals.tax)}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                          {formatCurrency(totals.total)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {lineIssue && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 px-2 text-xs"
                                onClick={() => applySuggestedQtyForLine(line.id)}
                              >
                                Fix qty
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => removeAddedLine(line.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <div className="w-full max-w-[360px] space-y-2">
          <div className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            GST note: tax is calculated line-wise on taxable amount after item discount.
          </div>
          <Card className="lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle className="text-base">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(summary.subTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Item Discount</span>
                <span>- {formatCurrency(summary.lineDiscountTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bill Discount</span>
                <span>- {formatCurrency(summary.invoiceDiscount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  Tax ({summary.taxPercent.toFixed(2)}%)
                </span>
                <span>{formatCurrency(summary.taxTotal)}</span>
              </div>
              <div className="space-y-2 rounded-md border bg-muted/20 p-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="autoRoundOff"
                    checked={autoRoundOff}
                    onCheckedChange={(v) => setAutoRoundOff(!!v)}
                  />
                  <Label htmlFor="autoRoundOff" className="cursor-pointer text-xs font-normal">
                    Auto round-off
                  </Label>
                </div>
                <div className="grid grid-cols-[1fr_120px] items-center gap-2">
                  <span className="text-muted-foreground">Round Off</span>
                  <Input
                    value={roundOffInputValue}
                    disabled={autoRoundOff}
                    onChange={(e) => setRoundOffAmount(e.target.value)}
                    className="h-8 text-right tabular-nums"
                  />
                </div>
              </div>
              <div className="my-2 border-t" />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total Amount</span>
                <span>{formatCurrency(summary.grandTotal)}</span>
              </div>
              <Button
                className="mt-3 w-full"
                disabled={!canSubmit || createInvoice.isPending}
                onClick={handleCreate}
              >
                {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create {pageMeta.shortLabel}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <PartyDialog
        open={addPartyDialogOpen}
        onOpenChange={(open) => {
          setAddPartyDialogOpen(open);
          if (!open) setPendingPartyName("");
        }}
        defaultType={partyType}
        typeLocked
        initialName={pendingPartyName}
        onSuccess={(createdParty) => {
          setParty(createdParty);
          setPendingPartyName("");
        }}
      />

      <ItemDialog
        open={addItemDialogOpen}
        onOpenChange={(open) => {
          setAddItemDialogOpen(open);
          if (!open) setPendingItemName("");
        }}
        initialName={pendingItemName}
        onSuccess={(createdItem) => {
          setStockSearchText(createdItem.name);
          setStockSearchOpen(true);
          showSuccessToast("Item created. Add stock to use it in invoice.");
        }}
      />
    </div>
  );
}
