import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProfileCompletion, ProfileCompletionSection } from "@/types/auth";
import type { BusinessBankAccount } from "@/types/bank-account";
import { CheckCircle2, CircleDashed } from "lucide-react";
import { INVOICE_PROFILE_MIN_PERCENT } from "@/lib/business/business-document-gate";

interface ProfileCompletionCardProps {
  profileCompletion: ProfileCompletion;
  business?: {
    name?: string | null;
    country?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    /** Saved bank accounts from GET /business/profile */
    bankAccounts?: BusinessBankAccount[];
  };
}

function isFilled(value: string | null | undefined) {
  return (value ?? "").trim() !== "";
}

function sectionComplete(
  section: ProfileCompletionSection | undefined,
  fieldFallback: boolean,
): boolean {
  if (section) return section.complete;
  return fieldFallback;
}

function missingOrHint(missing: string[], hint: string) {
  return missing.length > 0 ? missing : [hint];
}

function ChecklistRow({
  complete,
  label,
  missing,
}: {
  complete: boolean;
  label: string;
  missing: string[];
}) {
  return (
    <li className="text-sm">
      <div className="flex items-start gap-2">
        {complete ? (
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
        ) : (
          <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-foreground">{label}</p>
          {!complete && missing.length > 0 ? (
            <p className="text-xs text-foreground">{missing.join(" · ")}</p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export function ProfileCompletionCard({ profileCompletion, business }: ProfileCompletionCardProps) {
  const { percentage, canCreateInvoice, breakdown = {} } = profileCompletion;

  const registrationMissing: string[] = [];
  if (!isFilled(business?.name)) registrationMissing.push("Business name");
  if (!isFilled(business?.country)) registrationMissing.push("Country");

  const addressMissing: string[] = [];
  if (!isFilled(business?.street)) addressMissing.push("Street");
  if (!isFilled(business?.city)) addressMissing.push("City");
  if (!isFilled(business?.state)) addressMissing.push("State");
  if (!isFilled(business?.pincode)) addressMissing.push("Pincode");

  const bankMissing: string[] = [];
  const hasCompleteAccount = (business?.bankAccounts ?? []).some(
    (acc) =>
      isFilled(acc.accountHolderName) &&
      isFilled(acc.bankAccountNumber) &&
      isFilled(acc.bankName) &&
      isFilled(acc.branchName) &&
      isFilled(acc.ifscCode) &&
      isFilled(acc.bankCity) &&
      isFilled(acc.bankState),
  );
  if (!hasCompleteAccount) bankMissing.push("Add at least one complete bank account");

  const weightedOk = percentage >= INVOICE_PROFILE_MIN_PERCENT;
  const regComplete = sectionComplete(breakdown.registration, registrationMissing.length === 0);
  const addrComplete = sectionComplete(breakdown.address, addressMissing.length === 0);
  const bankComplete = sectionComplete(breakdown.bank, bankMissing.length === 0);

  const gateRows = [
    {
      label: `Overall score (at least ${INVOICE_PROFILE_MIN_PERCENT}%)`,
      complete: weightedOk,
      missing: weightedOk ? [] : [`Currently ${percentage}%`],
    },
    {
      label: "Business name and country",
      complete: regComplete,
      missing: regComplete ? [] : missingOrHint(registrationMissing, "Review name and country"),
    },
    {
      label: "Address — Street · City · State · Pincode (Area optional)",
      complete: addrComplete,
      missing: addrComplete ? [] : missingOrHint(addressMissing, "Review address"),
    },
    {
      label: "Bank — at least one saved account with all required fields",
      complete: bankComplete,
      missing: bankComplete ? [] : missingOrHint(bankMissing, "Add a bank account in Bank details"),
    },
  ] as const;

  return (
    <Card className="w-full border-border bg-card shadow-sm ring-1 ring-border/40">
      <CardHeader className="border-b border-border bg-muted/45 pb-3 pt-4">
        <CardTitle className="text-base font-semibold tracking-tight text-foreground">
          Invoices and your profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 bg-card pt-4">
        <div className="flex items-center gap-3">
          <Progress
            value={percentage}
            className="h-2 flex-1 rounded-full border border-border bg-muted/30 [&>div]:!bg-foreground"
          />
          <span className="text-sm font-semibold tabular-nums text-foreground">{percentage}%</span>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/25 px-3 py-2.5">
          {canCreateInvoice ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          )}
          <div>
            <p className="text-sm font-semibold text-foreground">
              {canCreateInvoice ? "You can create invoices" : "You cannot create invoices yet"}
            </p>
          </div>
        </div>

        <div className="border-foreground/12 rounded-lg border bg-background p-3">
          <p className="mb-2 text-sm font-semibold text-foreground">Checklist</p>
          <ul className="space-y-2">
            {gateRows.map((item) => (
              <ChecklistRow key={item.label} {...item} />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
