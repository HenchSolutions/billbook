"use client";

import type { ReactNode } from "react";
import { toast } from "sonner";
import { ApiClientError } from "@/api/error";
import { REFRESH_PERMISSIONS_EVENT } from "@/constants/access-events";
import { isInactiveRoleGroupAccessMessage } from "@/lib/access/rbac-access";
import { normalizeUserFacingErrorMessage } from "@/lib/ui/user-facing-error-message";

function resolveMessage(errorOrMessage: unknown): { text: string; status?: number } {
  if (errorOrMessage === null || errorOrMessage === undefined) {
    return { text: "" };
  }
  if (typeof errorOrMessage === "string") {
    return { text: errorOrMessage };
  }
  if (errorOrMessage instanceof ApiClientError) {
    return {
      text: normalizeUserFacingErrorMessage(errorOrMessage.message, errorOrMessage.status),
      status: errorOrMessage.status,
    };
  }
  if (errorOrMessage instanceof Error) {
    return { text: normalizeUserFacingErrorMessage(errorOrMessage.message) };
  }
  return { text: "Something went wrong. Please try again." };
}

function ErrorToastDescription({ message }: { message: string }): ReactNode {
  return (
    <p className="whitespace-pre-line text-left text-sm leading-snug text-foreground">{message}</p>
  );
}

/**
 * Show a standardized error toast.
 * - showErrorToast(error, title): short title + message body
 * - showErrorToast(message): message as the main toast body
 */
export function showErrorToast(errorOrMessage: unknown, title?: string) {
  if (
    errorOrMessage instanceof ApiClientError &&
    errorOrMessage.status === 403 &&
    typeof window !== "undefined" &&
    !isInactiveRoleGroupAccessMessage(errorOrMessage.message)
  ) {
    window.dispatchEvent(new Event(REFRESH_PERMISSIONS_EVENT));
  }

  /** `showErrorToast(null, "…")` — only the second string is shown (validation-style messages). */
  if ((errorOrMessage === null || errorOrMessage === undefined) && title !== undefined) {
    toast.error(title);
    return;
  }

  const { text } = resolveMessage(errorOrMessage);

  if (title !== undefined) {
    toast.error(title, {
      description: <ErrorToastDescription message={text} />,
      classNames: {
        description: "!items-start !text-left !text-foreground",
      },
    });
    return;
  }

  toast.error(text);
}

/**
 * Show a success toast. Optional `description` appears as secondary line (keep both short).
 */
export function showSuccessToast(message: string, description?: string) {
  if (description) {
    toast.success(message, { description });
    return;
  }
  toast.success(message);
}
