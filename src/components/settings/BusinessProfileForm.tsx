import { useRef, useState, useEffect, type ReactNode } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FieldError, Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, PenLine, Pencil, Upload, X } from "lucide-react";
import type { ProfileForm } from "@/components/settings/profileSchema";
import { MONTHS, REGISTRATION_TYPES, COUNTRIES } from "@/constants";
import { usePincodeAutofill } from "@/hooks/use-pincode-autofill";
import { showErrorToast } from "@/lib/ui/toast-helpers";
import { countryCodeToFlagEmoji } from "@/lib/india/country-flags";
import type { BusinessClassificationOption } from "@/types/auth";
import { SavedBankAccountsSection } from "@/components/settings/BusinessBankAccountsCard";
import { ApiClientError } from "@/api/error";
import { cn } from "@/lib/core/utils";
import { isValidGstin, isValidIndianPincode, isValidPan } from "@/lib/india/validators";
import {
  resolveClassificationFormValue,
  toClassificationLabel,
} from "@/lib/business/classification-label";

const LOGO_MAX_SIZE_MB = 5;

const SIGNATURE_MAX_SIZE_MB = 2;

interface BusinessProfileFormProps {
  form: UseFormReturn<ProfileForm>;
  onSubmit: (data: ProfileForm) => void | Promise<void>;
  isDirty: boolean;
  businessTypeOptions: BusinessClassificationOption[];
  industryTypeOptions: BusinessClassificationOption[];
  canManageTypeOptions: boolean;
  onCreateBusinessType?: (name: string) => Promise<void>;
  onCreateIndustryType?: (name: string) => Promise<void>;
  /** Upload logo file; returns URL to store. Backend receives only this link on profile save. */
  onLogoUpload?: (file: File) => Promise<string | null>;
  /** Upload signature file; returns URL to store. Backend receives only this link on profile save. */
  onSignatureUpload?: (file: File) => Promise<string | null>;
  /** When true, profile is view-only (STAFF — GET allowed, PUT blocked by API). */
  readOnly?: boolean;
  /** Saved bank accounts (CRUD) under Bank details. */
  canViewBankAccounts?: boolean;
  canEditBankAccounts?: boolean;
}

interface CreatableTypeInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: BusinessClassificationOption[];
  placeholder: string;
  emptyMessage: string;
  canManageTypeOptions: boolean;
  createLabel: string;
  isCreating: boolean;
  onCreate: (name: string) => Promise<void>;
}

function CreatableTypeInput({
  id,
  value,
  onChange,
  options,
  placeholder,
  emptyMessage,
  canManageTypeOptions,
  createLabel,
  isCreating,
  onCreate,
}: CreatableTypeInputProps) {
  const [open, setOpen] = useState(false);
  const normalizedInput = (value ?? "").trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedInput) return true;
    return option.name.toLowerCase().includes(normalizedInput);
  });
  const hasExactMatch = options.some(
    (option) => option.name.trim().toLowerCase() === normalizedInput,
  );
  const shouldShowCreate = Boolean(normalizedInput) && !hasExactMatch;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor asChild>
        <Input
          id={id}
          value={value ?? ""}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onBlur={() => {
            const aligned = resolveClassificationFormValue(value, options);
            if (aligned !== (value ?? "")) onChange(aligned);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          aria-expanded={open}
          aria-controls={`${id}-options`}
        />
      </PopoverAnchor>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] border-0 bg-transparent p-0 shadow-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command
          shouldFilter={false}
          className="overflow-hidden rounded-lg border border-border/80 bg-popover shadow-md"
        >
          <CommandList id={`${id}-options`} className="max-h-64">
            <CommandEmpty className="py-4 text-center text-sm text-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={`${id}-${option.id}-${option.name}`}
                  value={option.name}
                  onSelect={() => {
                    onChange(toClassificationLabel(option.name));
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  {toClassificationLabel(option.name)}
                </CommandItem>
              ))}

              {shouldShowCreate && (
                <CommandItem
                  value={`${id}-create-${normalizedInput}`}
                  disabled={isCreating}
                  onSelect={() => {
                    if (!canManageTypeOptions) {
                      setOpen(false);
                      return;
                    }
                    void onCreate((value ?? "").trim()).then(() => {
                      setOpen(false);
                    });
                  }}
                  className="cursor-pointer"
                >
                  {canManageTypeOptions
                    ? `${isCreating ? "Adding…" : createLabel} "${toClassificationLabel((value ?? "").trim())}"`
                    : `Use "${toClassificationLabel((value ?? "").trim())}"`}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function FormSection({
  title,
  children,
  contentClassName,
  headerRight,
}: {
  title: string;
  children: ReactNode;
  contentClassName?: string;
  headerRight?: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/40">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/45 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="h-6 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
          <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
        </div>
        {headerRight}
      </header>
      <div className={cn("bg-card px-4 py-4 sm:px-5 sm:py-5", contentClassName)}>{children}</div>
    </section>
  );
}

export function BusinessProfileForm({
  form,
  onSubmit,
  isDirty,
  businessTypeOptions,
  industryTypeOptions,
  canManageTypeOptions,
  onCreateBusinessType,
  onCreateIndustryType,
  onLogoUpload,
  onSignatureUpload,
  readOnly = false,
  canViewBankAccounts = false,
  canEditBankAccounts = false,
}: BusinessProfileFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = form;

  const [phoneCountryCode, setPhoneCountryCode] = useState("IN");
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingSignatureFile, setPendingSignatureFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [signaturePreviewUrl, setSignaturePreviewUrl] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingSignature, setIsUploadingSignature] = useState(false);
  const [isCreatingBusinessType, setIsCreatingBusinessType] = useState(false);
  const [isCreatingIndustryType, setIsCreatingIndustryType] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signatureInputRef = useRef<HTMLInputElement>(null);

  const logoUrl = watch("logoUrl");
  const signatureUrl = watch("signatureUrl");
  const pincode = watch("pincode");
  const countryName = watch("country");
  const city = watch("city");
  const state = watch("state");
  const gstin = watch("gstin");
  const pan = watch("pan");

  const pincodeDigits = (pincode ?? "").toString().replace(/\D/g, "");
  const normalizedPincode = (pincode ?? "").trim();
  const normalizedGstin = (gstin ?? "").trim();
  const normalizedPan = (pan ?? "").trim();
  const gstinFormatInvalid = normalizedGstin.length > 0 && !isValidGstin(normalizedGstin);
  const panFormatInvalid = normalizedPan.length > 0 && !isValidPan(normalizedPan);
  const pincodeFormatInvalid =
    normalizedPincode.length > 0 &&
    normalizedPincode.replace(/\D/g, "").length === 6 &&
    !isValidIndianPincode(normalizedPincode.replace(/\D/g, ""));
  const lockCityState = pincodeDigits.length === 6 && Boolean(city || state);
  const selectedPhoneCountry = COUNTRIES.find((c) => c.code === phoneCountryCode) ??
    COUNTRIES[0] ?? { code: "IN", dialCode: "+91", label: "India" };

  const normalizedCountryName = (countryName ?? "").toString().trim().toLowerCase();
  const countryFromName =
    COUNTRIES.find((c) => c.label.toLowerCase() === normalizedCountryName)?.code ?? null;
  const pincodeCountryCode =
    countryFromName ??
    (normalizedCountryName === "india" || !normalizedCountryName
      ? "IN"
      : selectedPhoneCountry.code);

  const displayLogoUrl = pendingLogoFile ? logoPreviewUrl : logoUrl || null;
  const displaySignatureUrl = pendingSignatureFile ? signaturePreviewUrl : signatureUrl || null;

  useEffect(() => {
    const label = (countryName ?? "").trim();
    if (!label) return;
    const match = COUNTRIES.find((c) => c.label.toLowerCase() === label.toLowerCase());
    if (match) setPhoneCountryCode(match.code);
  }, [countryName]);

  useEffect(() => {
    if (!pendingLogoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingLogoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingLogoFile]);

  useEffect(() => {
    if (!pendingSignatureFile) {
      setSignaturePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingSignatureFile);
    setSignaturePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingSignatureFile]);

  const handlePhoneCountryChange = (value: string) => {
    setPhoneCountryCode(value);
  };

  const handleLogoClick = () => logoInputRef.current?.click();
  const handleSignatureClick = () => signatureInputRef.current?.click();

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (file.size > LOGO_MAX_SIZE_MB * 1024 * 1024) {
      showErrorToast(`Logo must be under ${LOGO_MAX_SIZE_MB} MB`);
      return;
    }
    if (!onLogoUpload) return;
    setPendingLogoFile(file);
    setIsUploadingLogo(true);
    try {
      const url = await onLogoUpload(file);
      if (url) setValue("logoUrl", url, { shouldDirty: true });
      setPendingLogoFile(null);
    } catch {
      showErrorToast("Logo upload failed");
      setPendingLogoFile(null);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSignatureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;
    if (file.size > SIGNATURE_MAX_SIZE_MB * 1024 * 1024) {
      showErrorToast(`Signature image must be under ${SIGNATURE_MAX_SIZE_MB} MB`);
      return;
    }
    if (!onSignatureUpload) return;
    setPendingSignatureFile(file);
    setIsUploadingSignature(true);
    try {
      const url = await onSignatureUpload(file);
      if (url) setValue("signatureUrl", url, { shouldDirty: true });
      setPendingSignatureFile(null);
    } catch {
      showErrorToast("Signature upload failed");
      setPendingSignatureFile(null);
    } finally {
      setIsUploadingSignature(false);
    }
  };

  const handleRemoveLogo = () => {
    setPendingLogoFile(null);
    setValue("logoUrl", null, { shouldDirty: true });
  };

  const handleRemoveSignature = () => {
    setPendingSignatureFile(null);
    setValue("signatureUrl", null, { shouldDirty: true });
  };

  usePincodeAutofill(pincode, pincodeCountryCode, getValues, setValue);

  const handleCreateOption = async (
    kind: "business" | "industry",
    createFn: ((name: string) => Promise<void>) | undefined,
    formField: "businessType" | "industryType",
    rawName: string,
  ) => {
    if (!canManageTypeOptions || !createFn) return;

    const name = (rawName ?? "").trim();
    if (!name) return;

    if (kind === "business") {
      setIsCreatingBusinessType(true);
    } else {
      setIsCreatingIndustryType(true);
    }

    try {
      await createFn(name);
      setValue(formField, name, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        showErrorToast(`${kind === "business" ? "Business" : "Industry"} type already exists.`);
        return;
      }
      showErrorToast(error, `Couldn't add ${kind} type`);
    } finally {
      if (kind === "business") {
        setIsCreatingBusinessType(false);
      } else {
        setIsCreatingIndustryType(false);
      }
    }
  };

  return (
    <form
      id="profile-form"
      onSubmit={readOnly ? (e) => e.preventDefault() : handleSubmit(onSubmit)}
      className="flex w-full min-w-0 flex-col gap-6"
    >
      <fieldset disabled={readOnly} className="min-w-0 space-y-6 border-0 p-0">
        <div className="flex flex-col gap-6">
          <FormSection title="Business details" contentClassName="space-y-4">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6 lg:gap-8">
              <div className="flex shrink-0 justify-center sm:block sm:w-[152px]">
                <div className="rounded-lg border border-border bg-muted/25 p-3 text-center">
                  {displayLogoUrl ? (
                    <div className="relative mx-auto inline-block">
                      <img
                        src={displayLogoUrl}
                        alt="Business logo"
                        className="mx-auto h-24 w-24 rounded-lg border border-border bg-card object-contain"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="absolute bottom-0 right-0 h-6 w-6 rounded-full shadow-sm"
                        onClick={handleLogoClick}
                        disabled={isUploadingLogo}
                        aria-label="Edit logo"
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card text-foreground">
                        <Upload className="h-5 w-5" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Logo</p>
                      <p className="text-xs text-muted-foreground">
                        PNG/JPG, max {LOGO_MAX_SIZE_MB} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={handleLogoClick}
                        disabled={isUploadingLogo}
                      >
                        {isUploadingLogo ? "Uploading…" : "Choose file"}
                      </Button>
                    </>
                  )}
                  {displayLogoUrl ? (
                    <p className="mt-2 text-xs text-foreground">
                      <button
                        type="button"
                        className="underline hover:no-underline"
                        onClick={handleRemoveLogo}
                      >
                        Remove logo
                      </button>
                    </p>
                  ) : null}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name" required>
                      Business Name
                    </Label>
                    <Input
                      id="name"
                      {...register("name")}
                      aria-required="true"
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && <FieldError id="name-error">{errors.name.message}</FieldError>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Controller
                      name="country"
                      control={control}
                      render={({ field }) => {
                        const v = (field.value ?? "").trim();
                        const selected =
                          COUNTRIES.find((c) => c.label.toLowerCase() === v.toLowerCase()) ??
                          selectedPhoneCountry;
                        return (
                          <Select
                            value={selected.code}
                            onValueChange={(code) => {
                              const country = COUNTRIES.find((c) => c.code === code);
                              field.onChange(country?.label ?? "");
                              setPhoneCountryCode(code);
                            }}
                          >
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((item) => (
                                <SelectItem key={item.code} value={item.code}>
                                  <span className="flex items-center gap-2">
                                    <span aria-hidden className="text-base leading-none">
                                      {countryCodeToFlagEmoji(item.code)}
                                    </span>
                                    <span className="truncate">{item.label}</span>
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        );
                      }}
                    />
                  </div>
                  <div className="space-y-2 sm:min-w-0">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register("email")}
                      placeholder="billing@acme.com"
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                      <p id="email-error" className="text-xs text-destructive" role="alert">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="min-w-0 space-y-2">
                    <Label htmlFor="phone">Phone number</Label>
                    <div className="grid min-w-0 grid-cols-[minmax(0,6.75rem)_minmax(0,1fr)] gap-2 sm:grid-cols-[minmax(0,7.25rem)_minmax(0,1fr)]">
                      <Select value={phoneCountryCode} onValueChange={handlePhoneCountryChange}>
                        <SelectTrigger
                          id="phoneCountry"
                          aria-label="Phone country code"
                          className="h-10 min-w-0"
                        >
                          <span className="flex min-w-0 items-center gap-0.5">
                            <span aria-hidden className="shrink-0 text-base leading-none">
                              {countryCodeToFlagEmoji(selectedPhoneCountry.code)}
                            </span>
                            <span className="truncate pl-0.5 tabular-nums">
                              {selectedPhoneCountry.dialCode}
                            </span>
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {COUNTRIES.map((item) => (
                            <SelectItem key={item.code} value={item.code}>
                              <span className="flex items-center gap-3">
                                <span aria-hidden className="text-base leading-none">
                                  {countryCodeToFlagEmoji(item.code)}
                                </span>
                                <span className="truncate">{item.label}</span>
                                <span className="ml-auto tabular-nums">{item.dialCode}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        className="min-w-0"
                        placeholder="9876543210"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={10}
                        aria-invalid={!!errors.phone}
                        {...register("phone", {
                          onChange: (e) => {
                            e.target.value = String(e.target.value ?? "")
                              .replace(/\D/g, "")
                              .slice(0, 10);
                          },
                        })}
                      />
                    </div>
                    {errors.phone && <FieldError>{errors.phone.message}</FieldError>}
                  </div>
                  <div className="space-y-2 sm:min-w-0">
                    <Label htmlFor="businessType">
                      Business Type{" "}
                      <span className="text-xs font-normal text-foreground">(optional)</span>
                    </Label>
                    <Controller
                      name="businessType"
                      control={control}
                      render={({ field }) => (
                        <CreatableTypeInput
                          id="businessType"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={businessTypeOptions}
                          placeholder="e.g. Retail"
                          emptyMessage="No matching business types"
                          canManageTypeOptions={canManageTypeOptions}
                          createLabel="Add business type"
                          isCreating={isCreatingBusinessType}
                          onCreate={async (name) => {
                            await handleCreateOption(
                              "business",
                              onCreateBusinessType,
                              "businessType",
                              name,
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2 sm:min-w-0">
                    <Label htmlFor="industryType">
                      Industry Type{" "}
                      <span className="text-xs font-normal text-foreground">(optional)</span>
                    </Label>
                    <Controller
                      name="industryType"
                      control={control}
                      render={({ field }) => (
                        <CreatableTypeInput
                          id="industryType"
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          options={industryTypeOptions}
                          placeholder="e.g. IT Services"
                          emptyMessage="No matching industry types"
                          canManageTypeOptions={canManageTypeOptions}
                          createLabel="Add industry type"
                          isCreating={isCreatingIndustryType}
                          onCreate={async (name) => {
                            await handleCreateOption(
                              "industry",
                              onCreateIndustryType,
                              "industryType",
                              name,
                            );
                          }}
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Address" contentClassName="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="street">Address line 1</Label>
              <Textarea
                id="street"
                placeholder="123 Main Street"
                className="min-h-[88px]"
                aria-invalid={!!errors.street}
                aria-describedby={errors.street ? "street-error" : undefined}
                {...register("street")}
                maxLength={500}
              />
              {errors.street && <FieldError id="street-error">{errors.street.message}</FieldError>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  className="financial-id"
                  placeholder="560034"
                  {...register("pincode")}
                  maxLength={10}
                  inputMode="numeric"
                  aria-invalid={!!errors.pincode || pincodeFormatInvalid}
                />
                <p className="text-xs text-foreground">
                  Enter pincode to auto-fill city, state, and area
                </p>
                {pincodeFormatInvalid ? (
                  <p className="text-xs text-destructive" role="alert">
                    Enter a valid 6-digit Indian pincode.
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Area / Locality</Label>
                <Input id="area" {...register("area")} placeholder="Koramangala" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Bangalore"
                  disabled={lockCityState}
                />
                {lockCityState && (
                  <p className="text-xs text-foreground">Auto-filled from pincode</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Karnataka"
                  disabled={lockCityState}
                />
              </div>
            </div>
          </FormSection>

          {canViewBankAccounts ? (
            <FormSection title="Bank details">
              <SavedBankAccountsSection
                canView={canViewBankAccounts}
                canEdit={canEditBankAccounts}
              />
            </FormSection>
          ) : null}
        </div>
      </fieldset>

      <fieldset disabled={readOnly} className="min-w-0 space-y-6 border-0 p-0">
        <div className="flex flex-col gap-6">
          <FormSection title="Tax & compliance" contentClassName="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxType">Tax type</Label>
                <Controller
                  name="taxType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="taxType">
                        <SelectValue placeholder="Select tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GST">GST</SelectItem>
                        <SelectItem value="NON_GST">Non-GST</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="financialYearStart">Financial Year Start</Label>
                <Controller
                  name="financialYearStart"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                    >
                      <SelectTrigger id="financialYearStart">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((month, i) => (
                          <SelectItem key={month} value={String(i + 1)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (optional)</Label>
                <Input
                  id="gstin"
                  className="financial-id"
                  placeholder="29ABCDE1234F1Z5"
                  {...register("gstin", {
                    onChange: (e) => {
                      e.target.value = String(e.target.value ?? "")
                        .toUpperCase()
                        .replace(/\s+/g, "")
                        .slice(0, 15);
                    },
                  })}
                  maxLength={15}
                  aria-invalid={!!errors.gstin || gstinFormatInvalid}
                  aria-describedby={errors.gstin ? "gstin-error" : undefined}
                />
                {errors.gstin && (
                  <p id="gstin-error" className="text-xs text-destructive" role="alert">
                    {errors.gstin.message}
                  </p>
                )}
                {!errors.gstin && gstinFormatInvalid ? (
                  <p className="text-xs text-destructive" role="alert">
                    GSTIN must be 15 characters (e.g. 29ABCDE1234F1Z5).
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pan">PAN (optional)</Label>
                <Input
                  id="pan"
                  className="financial-id"
                  placeholder="ABCDE1234F"
                  {...register("pan", {
                    onChange: (e) => {
                      e.target.value = String(e.target.value ?? "")
                        .toUpperCase()
                        .replace(/\s+/g, "")
                        .slice(0, 10);
                    },
                  })}
                  maxLength={10}
                  aria-invalid={!!errors.pan || panFormatInvalid}
                  aria-describedby={errors.pan ? "pan-error" : undefined}
                />
                {errors.pan && (
                  <p id="pan-error" className="text-xs text-destructive" role="alert">
                    {errors.pan.message}
                  </p>
                )}
                {!errors.pan && panFormatInvalid ? (
                  <p className="text-xs text-destructive" role="alert">
                    PAN format should be 5 letters, 4 digits, 1 letter.
                  </p>
                ) : null}
              </div>
            </div>
          </FormSection>

          <FormSection title="Miscellaneous" contentClassName="space-y-6">
            <div className="grid w-full gap-4 sm:grid-cols-2 sm:items-stretch">
              <div className="flex min-w-0 flex-col rounded-xl border border-border/80 bg-muted/15 p-4 shadow-sm ring-1 ring-border/30 sm:p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                    <FileText className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <Label
                      htmlFor="registrationType"
                      className="text-sm font-semibold text-foreground"
                    >
                      Registration type
                    </Label>
                  </div>
                </div>
                <Controller
                  name="registrationType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value?.trim() ? field.value : undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="registrationType" className="w-full bg-background">
                        <SelectValue placeholder="Select registration" />
                      </SelectTrigger>
                      <SelectContent>
                        {REGISTRATION_TYPES.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex min-w-0 flex-col rounded-xl border border-border/80 bg-muted/15 p-4 shadow-sm ring-1 ring-border/30 sm:p-5">
                <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md border border-border/60 bg-background text-muted-foreground">
                    <PenLine className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-foreground">Signature</span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-center rounded-lg border border-dashed border-border/70 bg-background/80 px-3 py-4 text-center">
                  {displaySignatureUrl ? (
                    <div className="relative mx-auto inline-block">
                      <img
                        src={displaySignatureUrl}
                        alt="Signature"
                        className="max-h-20 w-auto max-w-[220px] object-contain"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -right-2 -top-2 h-6 w-6 rounded-full shadow-sm"
                        onClick={handleRemoveSignature}
                        aria-label="Remove signature"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <p className="mb-2 text-xs text-muted-foreground">No signature uploaded</p>
                  )}
                  <input
                    ref={signatureInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleSignatureChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mx-auto mt-1 gap-1.5"
                    onClick={handleSignatureClick}
                    disabled={isUploadingSignature}
                  >
                    <Upload className="h-3.5 w-3.5" aria-hidden />
                    {isUploadingSignature
                      ? "Uploading…"
                      : displaySignatureUrl
                        ? "Change signature"
                        : "Upload signature"}
                  </Button>
                </div>
              </div>
            </div>
          </FormSection>
        </div>

        {!readOnly && isDirty ? (
          <div className="mt-3 flex justify-end border-t border-foreground/10 pt-3">
            <span className="text-xs font-medium text-foreground">Unsaved changes</span>
          </div>
        ) : null}
      </fieldset>
    </form>
  );
}
