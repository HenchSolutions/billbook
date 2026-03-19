"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import ItemDialog from "@/components/dialogs/ItemDialog";
import PartyDialog from "@/components/dialogs/PartyDialog";
import { useInvoiceCreateState } from "@/hooks/invoices/useInvoiceCreateState";
import { PartyAndDatesCards } from "@/components/invoices/invoice-create/PartyAndDatesCards";
import { LineEditorSection } from "@/components/invoices/invoice-create/LineEditorSection";
import { InvoiceTotalsSummary } from "@/components/invoices/invoice-create/InvoiceTotalsSummary";
import type { InvoiceType } from "@/types/invoice";

interface InvoiceCreatePageProps {
  initialType: InvoiceType;
}

export function InvoiceCreatePage({ initialType }: InvoiceCreatePageProps) {
  const state = useInvoiceCreateState(initialType);
  const copy = state.createCopy;

  return (
    <div className="page-container max-w-[96rem] animate-fade-in space-y-5">
      <PageHeader
        title={`Create ${state.pageMeta.label}`}
        description={copy.pageDescription}
        action={
          <Button variant="outline" asChild>
            <Link href={state.pageMeta.path}>Back to List</Link>
          </Button>
        }
      />

      <ErrorBanner error={state.stockEntriesError} fallbackMessage={copy.loadErrorMessage} />

      <PartyAndDatesCards
        invoiceType={initialType}
        party={state.party}
        onPartyChange={state.setParty}
        parties={state.parties}
        onAddParty={state.handleOpenAddParty}
        invoiceDate={state.invoiceDate}
        onInvoiceDateChange={state.setInvoiceDate}
        dueDate={state.dueDate}
        onDueDateChange={state.setDueDate}
      />

      <LineEditorSection
        invoiceType={initialType}
        draftLine={state.draftLine}
        addedLines={state.addedLines}
        stockSearchOpen={state.stockSearchOpen}
        setStockSearchOpen={state.setStockSearchOpen}
        stockSearchText={state.stockSearchText}
        setStockSearchText={state.setStockSearchText}
        stockEntries={state.stockEntries}
        filteredStockChoices={state.filteredStockChoices}
        itemsWithoutStockOptions={state.itemsWithoutStockOptions}
        showAddItemOption={state.showAddItemOption}
        onSelectChoice={state.handleStockChoiceSelect}
        onAddStockForItem={state.handleAddStockForItem}
        onAddNewItem={state.handleAddItemClick}
        updateLine={state.updateLine}
        onLineDiscountChange={state.handleLineDiscountChange}
        onLineDiscountAmountChange={state.handleLineDiscountAmountChange}
        addCurrentLine={state.addCurrentLine}
        removeAddedLine={state.removeAddedLine}
        applySuggestedQtyForLine={state.applySuggestedQtyForLine}
        stockLineIssues={state.stockLineIssues}
        focusedIssueLineId={state.focusedIssueLineId}
        qtyAutoAdjusted={state.qtyAutoAdjusted}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-xs">
                Notes (optional)
              </Label>
              <Textarea
                id="notes"
                value={state.notes}
                onChange={(e) => state.setNotes(e.target.value)}
                rows={8}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <InvoiceTotalsSummary
          summaryTitle={copy.summaryTitle}
          summary={state.summary}
          autoRoundOff={state.autoRoundOff}
          onAutoRoundOffChange={(checked) => {
            state.setAutoRoundOff(checked);
            if (!checked && state.roundOffAmount.trim() === "0") {
              state.setRoundOffAmount("");
            }
          }}
          roundOffInputValue={state.roundOffInputValue}
          onRoundOffAmountChange={state.setRoundOffAmount}
          canSubmit={state.canSubmit}
          isPending={state.createInvoice.isPending}
          onCreate={state.handleCreate}
          shortLabel={state.pageMeta.shortLabel}
        />
      </div>

      <PartyDialog
        open={state.addPartyDialogOpen}
        onOpenChange={(open) => {
          state.setAddPartyDialogOpen(open);
          if (!open) state.setPendingPartyName("");
        }}
        defaultType={state.partyType}
        typeLocked
        initialName={state.pendingPartyName}
        onSuccess={state.handlePartyCreated}
      />

      <ItemDialog
        open={state.addItemDialogOpen}
        onOpenChange={(open) => {
          state.setAddItemDialogOpen(open);
          if (!open) state.setPendingItemName("");
        }}
        initialName={state.pendingItemName}
        onSuccess={state.handleItemCreated}
      />
    </div>
  );
}
