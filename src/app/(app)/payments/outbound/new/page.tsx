"use client";

import PageHeader from "@/components/PageHeader";
import { OutboundPaymentCreateForm } from "@/components/outbound-payments/OutboundPaymentCreateForm";

export default function NewOutboundPaymentPage() {
  return (
    <div className="page-container max-w-3xl animate-fade-in">
      <PageHeader
        title="New outbound payment"
        description="Refund a sale return, pay a party, or log an expense."
        backHref="/payments/outbound"
        backLabel="Back to list"
      />
      <OutboundPaymentCreateForm />
    </div>
  );
}
