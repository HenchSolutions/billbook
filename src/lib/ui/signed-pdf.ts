import { api } from "@/api";
import { parseFilenameFromContentDisposition, triggerBlobDownload } from "@/api/report-download";
import { showErrorToast } from "@/lib/ui/toast-helpers";
import { openInvoiceHtmlForPrint } from "@/lib/ui/html-invoice-print";

type BodyKind = "pdf" | "html" | "other";

async function sniffBodyKind(
  blob: Blob,
  contentType: string | null,
  filename: string,
): Promise<BodyKind> {
  const ct = (contentType ?? "").toLowerCase();
  if (ct.includes("application/pdf")) return "pdf";
  if (ct.includes("text/html")) return "html";

  const prefix = await blob.slice(0, 1024).text();
  const t = prefix.trimStart();
  if (t.startsWith("%PDF")) return "pdf";
  if (/^<!DOCTYPE\s+html/i.test(t) || /^<html[\s>]/i.test(t) || /^<head[\s>]/i.test(t))
    return "html";
  if (t.startsWith("<")) return "html";

  if (/\.html?$/i.test(filename)) return "html";
  if (/\.pdf$/i.test(filename)) return "pdf";
  return "other";
}

function filenameStem(cdOrFallback: string, fallback: string): string {
  const base = cdOrFallback.trim() || fallback.trim() || "invoice";
  return base.replace(/\.[^/.]+$/, "").replace(/[/\\]/g, "_") || "invoice";
}

/**
 * HTML invoices: opens the browser print dialog (Save as PDF) via a hidden iframe.
 * Binary PDF: triggers a direct download.
 */
export async function downloadFileFromUrlAndOpenPdfPreview(
  url: string,
  fallbackFilename: string,
): Promise<void> {
  const res = await fetch(url, { credentials: "omit", mode: "cors" });
  if (!res.ok) throw new Error(`Download failed (${res.status})`);

  const name =
    parseFilenameFromContentDisposition(res.headers.get("content-disposition")) ?? fallbackFilename;
  const blob = await res.blob();
  const kind = await sniffBodyKind(blob, res.headers.get("content-type"), name);
  const stem = filenameStem(name, fallbackFilename);

  if (kind === "html") {
    await openInvoiceHtmlForPrint(blob, url, stem);
    return;
  }

  let out = blob;
  let filename = name;

  if (kind === "pdf") {
    try {
      const { normalizePdfBlobToA4 } = await import("@/lib/ui/pdf-a4-normalize");
      out = await normalizePdfBlobToA4(blob);
    } catch {
      /* keep original bytes */
    }
    if (!/\.pdf$/i.test(filename)) filename = `${stem}.pdf`;
  }

  triggerBlobDownload(out, filename);
}

export async function openSignedPdfFromApiPath(
  apiPath: string,
  messages: { unavailable: string; failed: string },
): Promise<void> {
  try {
    const res = await api.get<{ downloadUrl?: string | null }>(apiPath);
    const url = res.data?.downloadUrl;
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else showErrorToast(messages.unavailable);
  } catch (e) {
    showErrorToast(e, messages.failed);
  }
}
