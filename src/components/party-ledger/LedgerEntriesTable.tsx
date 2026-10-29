import { Receipt } from "lucide-react";
import type { LedgerEntry } from "@/lib/party/party-ledger";
import { PartyLedgerEntriesTable } from "@/components/party-ledger/PartyLedgerEntriesTable";
import EmptyState from "@/components/EmptyState";
import TableSkeleton from "@/components/skeletons/TableSkeleton";

interface LedgerEntriesTableProps {
  isPending: boolean;
  entries?: LedgerEntry[];
}

export function LedgerEntriesTable({ isPending, entries }: LedgerEntriesTableProps) {
  if (isPending) {
    return <TableSkeleton rows={5} variant="invoices" />;
  }

  if (!entries?.length) {
    return (
      <EmptyState
        icon={<Receipt className="h-6 w-6" />}
        title="No transactions yet"
        description="Invoices, receipts and payments for this account will show up here."
      />
    );
  }

  return <PartyLedgerEntriesTable entries={entries} variant="ledger" />;
}
