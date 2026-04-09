"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorBanner from "@/components/ErrorBanner";
import PageHeader from "@/components/PageHeader";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";
import { BusinessProfileForm, ProfileCompletionCard } from "@/components/settings/SettingsSections";
import { useBusinessProfile, useUpdateBusinessProfile } from "@/hooks/use-business";
import { fileToDataUrl } from "@/lib/file-to-url";
import { profileSchema, type ProfileForm } from "@/components/settings/profileSchema";
import { Button } from "@/components/ui/button";
import { showErrorToast, showSuccessToast } from "@/lib/toast-helpers";
import { getProfileFormValues } from "@/lib/profile-form-values";
import type { BusinessProfile, UpdateBusinessProfile } from "@/types/auth";

function trimOrNull(value: string | null | undefined): string | null {
  const t = (value ?? "").trim();
  return t === "" ? null : t;
}

function trimTaxId(value: string | null | undefined): string | null {
  const t = (value ?? "").trim().toUpperCase();
  return t === "" ? null : t;
}

/** Renders only after profile is loaded so `useForm` is never initialised with empty defaults (that makes the whole form "dirty"). */
function ProfileEditor({ business }: { business: BusinessProfile }) {
  const updateProfile = useUpdateBusinessProfile();

  const profileValues = useMemo(() => getProfileFormValues(business), [business]);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileValues,
    values: profileValues,
    resetOptions: { keepDirtyValues: true },
  });

  const {
    formState: { isSubmitting, isDirty },
    reset,
  } = form;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  const onSubmit = async (data: ProfileForm) => {
    if (!isDirty) {
      showErrorToast("No changes to save.");
      return;
    }
    try {
      const extraDetails = (data.extraDetails ?? [])
        .map((d) => ({
          key: (d.key ?? "").trim(),
          value: (d.value ?? "").trim(),
        }))
        .filter((d) => d.key !== "");
      const payload: UpdateBusinessProfile = {
        name: data.name.trim(),
        country: trimOrNull(data.country) ?? "India",
        phone: trimOrNull(data.phone),
        email: trimOrNull(data.email),
        businessType: trimOrNull(data.businessType),
        industryType: trimOrNull(data.industryType),
        registrationType: trimOrNull(data.registrationType),
        street: trimOrNull(data.street),
        area: trimOrNull(data.area),
        city: trimOrNull(data.city),
        state: trimOrNull(data.state),
        pincode: trimOrNull(data.pincode),
        gstin: trimTaxId(data.gstin),
        pan: trimTaxId(data.pan),
        financialYearStart: data.financialYearStart,
        extraDetails,
        taxType: data.taxType,
        logoUrl: data.logoUrl === "" || data.logoUrl == null ? null : data.logoUrl,
        signatureUrl:
          data.signatureUrl === "" || data.signatureUrl == null ? null : data.signatureUrl,
      };
      const updated = await updateProfile.mutateAsync(payload);
      reset(getProfileFormValues(updated));
      showSuccessToast("Business profile updated");
    } catch (err) {
      showErrorToast(err, "Failed to update");
    }
  };

  const handleLogoUpload = async (file: File): Promise<string | null> => {
    return fileToDataUrl(file);
  };

  const handleSignatureUpload = async (file: File): Promise<string | null> => {
    return fileToDataUrl(file);
  };

  const handleCancel = () => {
    reset(getProfileFormValues(business));
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        description="Manage your business settings and profile details"
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              form="profile-form"
              disabled={!isDirty || isSubmitting || updateProfile.isPending}
            >
              Save Changes
            </Button>
          </div>
        }
      />

      <div className="w-full space-y-6">
        {business.profileCompletion && (
          <ProfileCompletionCard profileCompletion={business.profileCompletion} />
        )}
        <BusinessProfileForm
          form={form}
          onSubmit={onSubmit}
          isDirty={isDirty}
          isSaving={updateProfile.isPending}
          onLogoUpload={handleLogoUpload}
          onSignatureUpload={handleSignatureUpload}
        />
      </div>
    </>
  );
}

export default function Profile() {
  const { data: business, isPending, error } = useBusinessProfile();

  if (isPending) {
    return <SettingsSkeleton variant="profile" />;
  }

  return (
    <div className="page-container animate-fade-in pb-10">
      <ErrorBanner error={error} fallbackMessage="Failed to load profile" />
      {business ? (
        <ProfileEditor business={business} />
      ) : (
        <PageHeader
          title="My Profile"
          description="Manage your business settings and profile details"
        />
      )}
    </div>
  );
}
