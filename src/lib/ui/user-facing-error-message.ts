import { ApiClientError } from "@/api/error";

/** Remove request-id noise some APIs append to the human-readable `error` string. */
function stripRequestIdFromMessage(message: string): string {
  let m = message.replace(/\s*\(?request[_\s-]?id\s*:\s*[^\s)]+(?:\s*\)?)?\s*$/i, "");
  m = m.replace(/\s*\(?req\.?\s*id\s*:\s*[^\s)]+(?:\s*\)?)?\s*$/i, "");
  const lines = m.split("\n").filter((line) => {
    const t = line.trim();
    if (!t) return true;
    if (/^support reference\s*:/i.test(t)) return false;
    if (/^request[_\s-]?id\s*:/i.test(t)) return false;
    if (/^req\.?\s*id\s*:/i.test(t)) return false;
    return true;
  });
  return lines.join("\n").trim();
}

/** Turn generic HTTP fallbacks into clearer language; keep real API messages as-is. */
export function normalizeUserFacingErrorMessage(message: string, _status?: number): string {
  const m = stripRequestIdFromMessage(message.trim());
  if (!m) return "Something went wrong. Please try again.";

  const generic = /^Request failed \((\d+)\)$/i.exec(m);
  if (generic) {
    const code = Number(generic[1]);
    if (code === 404)
      return "We couldn’t find that. It may have been removed or you may not have access.";
    if (code === 403) return "You don’t have permission to do that.";
    if (code === 401) return "Your session has expired. Please sign in again.";
    if (code === 503 || code === 502)
      return "The service is temporarily unavailable. Please try again in a moment.";
    if (code === 429) return "Too many attempts. Please wait a moment and try again.";
    if (code >= 500) return "Something went wrong on our side. Please try again later.";
    return "Something went wrong. Please try again.";
  }

  if (m === "Unexpected API response") {
    return "We couldn’t read the server response. Please try again.";
  }

  return m;
}

/** Single place for banners, inline alerts, etc. (toasts use this via `resolveMessage`). */
export function getUserFacingErrorMessage(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiClientError) {
    if (error.status === 401) return "Your session expired. Please sign in again.";
    return normalizeUserFacingErrorMessage(error.message, error.status);
  }
  if (error instanceof Error && error.message) {
    return normalizeUserFacingErrorMessage(error.message);
  }
  return fallbackMessage;
}
