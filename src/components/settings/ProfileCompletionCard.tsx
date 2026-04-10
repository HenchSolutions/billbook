import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProfileCompletion } from "@/types/auth";
import { CheckCircle2, CircleDashed } from "lucide-react";

const PROFILE_REQUIRED_FOR_INVOICE = 75;

interface ProfileCompletionCardProps {
  profileCompletion: ProfileCompletion;
  business?: {
    name?: string | null;
    country?: string | null;
    street?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    accountHolderName?: string | null;
    bankAccountNumber?: string | null;
    bankName?: string | null;
    branchName?: string | null;
    ifscCode?: string | null;
    bankCity?: string | null;
    bankState?: string | null;
  };
}

function isFilled(value: string | null | undefined) {
  return (value ?? "").trim() !== "";
}

export function ProfileCompletionCard({ profileCompletion, business }: ProfileCompletionCardProps) {
  const { percentage, canCreateInvoice } = profileCompletion;
  const registrationMissing: string[] = [];
  const addressMissing: string[] = [];
  const bankMissing: string[] = [];

  if (!isFilled(business?.name)) registrationMissing.push("Business name");
  if (!isFilled(business?.country)) registrationMissing.push("Country");

  if (!isFilled(business?.street)) addressMissing.push("Address line 1");
  if (!isFilled(business?.city)) addressMissing.push("City");
  if (!isFilled(business?.state)) addressMissing.push("State");
  if (!isFilled(business?.pincode)) addressMissing.push("Pincode");

  if (!isFilled(business?.accountHolderName)) bankMissing.push("Account holder name");
  if (!isFilled(business?.bankAccountNumber)) bankMissing.push("Bank account number");
  if (!isFilled(business?.bankName)) bankMissing.push("Bank name");
  if (!isFilled(business?.branchName)) bankMissing.push("Branch name");
  if (!isFilled(business?.ifscCode)) bankMissing.push("IFSC code");
  if (!isFilled(business?.bankCity)) bankMissing.push("Bank city");
  if (!isFilled(business?.bankState)) bankMissing.push("Bank state");

  const checklist = [
    {
      label: `Profile completion is at least ${PROFILE_REQUIRED_FOR_INVOICE}%`,
      complete: percentage >= PROFILE_REQUIRED_FOR_INVOICE,
      missing: percentage >= PROFILE_REQUIRED_FOR_INVOICE ? [] : [`Current: ${percentage}%`],
    },
    {
      label:
        registrationMissing.length === 0
          ? "Registration basics are complete"
          : "Complete registration basics",
      complete: registrationMissing.length === 0,
      missing: registrationMissing,
    },
    {
      label:
        addressMissing.length === 0 ? "Address section is complete" : "Complete address section",
      complete: addressMissing.length === 0,
      missing: addressMissing,
    },
    {
      label: bankMissing.length === 0 ? "Bank section is complete" : "Complete bank section",
      complete: bankMissing.length === 0,
      missing: bankMissing,
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Profile completeness</CardTitle>
        <CardDescription>
          At least {PROFILE_REQUIRED_FOR_INVOICE}% required to create invoices.
          {canCreateInvoice
            ? " Your profile meets this requirement."
            : " Complete the details below to unlock invoice creation."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center gap-4">
          <Progress value={percentage} className="h-2 flex-1" />
          <span className="text-sm font-medium tabular-nums">{percentage}%</span>
        </div>
        <div className="rounded-md border bg-muted/30 p-3">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Invoice creation checklist
          </p>
          <ul className="space-y-2">
            {checklist.map((item) => (
              <li key={item.label} className="text-sm">
                <div className="flex items-start gap-2">
                  {item.complete ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                  ) : (
                    <CircleDashed className="mt-0.5 h-4 w-4 text-amber-600" />
                  )}
                  <div>
                    <p className="font-medium">{item.label}</p>
                    {!item.complete && item.missing.length > 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Missing: {item.missing.join(", ")}
                      </p>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
