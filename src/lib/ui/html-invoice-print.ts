/**
 * HTML invoice → A4 PDF download (no browser print dialog).
 *
 * Browser print headers/footers cannot be disabled by a webpage, so we rasterize
 * the invoice into a real PDF instead.
 */

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { triggerBlobDownload } from "@/api/report-download";

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
/** ~96dpi CSS px for 210mm */
const A4_WIDTH_PX = 794;

/**
 * Capture layout:
 * - full A4 sheet, footer pinned to bottom
 * - kill opacity / blend / full-bleed pseudo overlays that html2canvas turns into
 *   a washed-out white veil
 */
const PDF_LAYOUT_CSS = `
<style type="text/css" data-billbook-pdf-layout>
  *,*::before,*::after{
    box-sizing: border-box !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    opacity: 1 !important;
    filter: none !important;
    -webkit-filter: none !important;
    mix-blend-mode: normal !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }
  /* Full-page translucent veils (common in uploaded templates) read as a white overlay in html2canvas */
  *::before, *::after {
    background-image: none !important;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: ${A4_WIDTH_PX}px !important;
    min-height: ${A4_HEIGHT_MM}mm !important;
    overflow: visible !important;
    color: #0f172a !important;
  }
  .bb-pdf-root {
    display: flex !important;
    flex-direction: column !important;
    width: ${A4_WIDTH_PX}px !important;
    min-height: ${A4_HEIGHT_MM}mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    opacity: 1 !important;
    position: relative !important;
  }
  .bb-pdf-root > .invoice-page,
  .bb-pdf-root > .invoice,
  .bb-pdf-root > .invoice-wrapper,
  .bb-pdf-root > .invoice-container,
  .bb-pdf-root > .invoice-document,
  .bb-pdf-root > .page,
  .bb-pdf-root > .sheet,
  .bb-pdf-root > .document,
  .bb-pdf-root > .container,
  .bb-pdf-root > main,
  .bb-pdf-root > div:first-child {
    flex: 1 1 auto !important;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: none !important;
    min-height: ${A4_HEIGHT_MM}mm !important;
    margin: 0 !important;
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    background: #ffffff !important;
    opacity: 1 !important;
    position: relative !important;
  }
  .bb-pdf-root > div:first-child > :last-child,
  .bb-pdf-root > .invoice-page > :last-child,
  .bb-pdf-root > .invoice > :last-child,
  .bb-pdf-root > .invoice-wrapper > :last-child,
  .bb-pdf-root > .invoice-container > :last-child,
  .bb-pdf-root > .container > :last-child,
  .bb-pdf-root > main > :last-child {
    margin-top: auto !important;
  }
</style>`;

function injectBeforeClose(html: string, tag: "head" | "body", snippet: string): string {
  const re = tag === "head" ? /<\/head\s*>/i : /<\/body\s*>/i;
  if (re.test(html)) return html.replace(re, `${snippet}</${tag}>`);
  return html + snippet;
}

function wrapBodyInPdfRoot(html: string): string {
  if (/class=["'][^"']*\bbb-pdf-root\b/i.test(html)) return html;
  if (/<body\b[^>]*>/i.test(html) && /<\/body\s*>/i.test(html)) {
    return html
      .replace(/<body\b([^>]*)>/i, (_m, attrs: string) => `<body${attrs}><div class="bb-pdf-root">`)
      .replace(/<\/body\s*>/i, "</div></body>");
  }
  return `<div class="bb-pdf-root">${html}</div>`;
}

function injectPdfAssets(html: string): string {
  let out = wrapBodyInPdfRoot(html);
  if (/<\/head\s*>/i.test(out)) {
    out = injectBeforeClose(out, "head", PDF_LAYOUT_CSS);
  } else if (/<\/body\s*>/i.test(out)) {
    out = injectBeforeClose(out, "body", PDF_LAYOUT_CSS);
  } else {
    out = PDF_LAYOUT_CSS + out;
  }
  return out;
}

function buildInvoiceDocumentHtml(
  rawHtml: string,
  sourceUrl: string,
  documentTitle: string,
): string {
  let baseHref = "";
  try {
    const u = new URL(sourceUrl);
    baseHref = `${u.origin}${u.pathname.replace(/[^/]*$/, "")}`;
  } catch {
    /* keep empty */
  }
  const safeBase = baseHref.replace(/"/g, "&quot;");
  const safeTitle = (documentTitle.replace(/</g, "") || "Invoice").slice(0, 120);
  const titleTag = `<title>${safeTitle}</title>`;

  const html = rawHtml.trim();

  const hasHtmlTag = /<html[\s>]/i.test(html);
  const hasHeadTag = /<head\b[^>]*>/i.test(html);
  const basePart = baseHref && !/<base\s+[^>]*href=/i.test(html) ? `<base href="${safeBase}">` : "";
  const titlePart = !/<title\b[^>]*>/i.test(html) ? titleTag : "";

  if (!hasHtmlTag) {
    return `<!DOCTYPE html><html><head><meta charset="utf-8">${basePart}${titlePart}</head><body>${html}</body></html>`;
  }

  if (hasHeadTag) {
    const inject = basePart + titlePart;
    return inject ? html.replace(/<head\b[^>]*>/i, (m) => `${m}${inject}`) : html;
  }

  return html.replace(
    /<html\b[^>]*>/i,
    (m) => `${m}<head><meta charset="utf-8">${basePart}${titlePart}</head>`,
  );
}

async function waitForResources(doc: Document): Promise<void> {
  const w = doc.defaultView as (Window & { fonts?: FontFaceSet }) | null;
  try {
    await w?.fonts?.ready;
  } catch {
    /* ignore */
  }
  await Promise.race([
    Promise.all(
      [...doc.images].map((img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((r) => {
              img.addEventListener("load", () => r(), { once: true });
              img.addEventListener("error", () => r(), { once: true });
            }),
      ),
    ),
    new Promise<void>((r) => setTimeout(r, 8000)),
  ]);
  // Let layout/paint settle before rasterizing.
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await new Promise<void>((r) => setTimeout(r, 50));
}

/** Strip translucent veils html2canvas otherwise paints as a white wash. */
function sanitizeCloneForCapture(clonedDoc: Document, clonedRoot: HTMLElement): void {
  const killOverlay = (el: HTMLElement) => {
    el.style.setProperty("opacity", "1", "important");
    el.style.setProperty("filter", "none", "important");
    el.style.setProperty("-webkit-filter", "none", "important");
    el.style.setProperty("mix-blend-mode", "normal", "important");
    el.style.setProperty("backdrop-filter", "none", "important");
    el.style.setProperty("-webkit-backdrop-filter", "none", "important");

    const cls = `${el.className?.toString?.() ?? ""} ${el.id ?? ""}`.toLowerCase();
    if (/(overlay|backdrop|veil|wash|scrim|frost)/.test(cls)) {
      el.style.setProperty("display", "none", "important");
      return;
    }

    const bg = (el.style.backgroundColor || "").toLowerCase();
    if (/rgba?\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.\d+\s*\)/.test(bg)) {
      el.style.setProperty("background-color", "transparent", "important");
    }
  };

  const walk = (node: Element) => {
    if (node instanceof HTMLElement) killOverlay(node);
    for (const child of node.children) walk(child);
  };

  walk(clonedRoot);
  if (clonedDoc.body && clonedDoc.body !== clonedRoot) walk(clonedDoc.body);

  // Absolute full-bleed layers that only exist to dim the page.
  clonedDoc.querySelectorAll("div, section, span").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    const style = clonedDoc.defaultView?.getComputedStyle(node);
    if (!style) return;
    const pos = style.position;
    if (pos !== "absolute" && pos !== "fixed") return;
    const opacity = Number.parseFloat(style.opacity || "1");
    const bg = style.backgroundColor || "";
    const covers =
      (style.inset === "0px" || (style.top === "0px" && style.left === "0px")) &&
      (style.width === "100%" || node.offsetWidth >= A4_WIDTH_PX * 0.9);
    const whiteish = /rgba\(\s*255,\s*255,\s*255,\s*0?\.[1-9]/.test(bg) || opacity < 0.95;
    if (covers && whiteish && !node.innerText.trim()) {
      node.style.setProperty("display", "none", "important");
    }
  });
}

function canvasToA4Pdf(canvas: HTMLCanvasElement): Blob {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  // PNG keeps solid brand colors; JPEG was washing blues toward white.
  const imgData = canvas.toDataURL("image/png");
  const imgWidth = A4_WIDTH_MM;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= A4_HEIGHT_MM;

  while (heightLeft > 1) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= A4_HEIGHT_MM;
  }

  return pdf.output("blob");
}

async function renderHtmlToPdfBlob(html: string): Promise<Blob> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("title", "Invoice PDF render");
  // Keep in the viewport (not opacity:0 / off-screen) — off-screen capture often
  // composites as a faded white overlay in Chromium.
  Object.assign(iframe.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: `${A4_WIDTH_PX}px`,
    height: `${Math.round((A4_HEIGHT_MM / A4_WIDTH_MM) * A4_WIDTH_PX)}px`,
    border: "none",
    margin: "0",
    padding: "0",
    background: "#ffffff",
    opacity: "1",
    pointerEvents: "none",
    zIndex: "-1",
  });
  document.body.appendChild(iframe);

  try {
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    if (doc.readyState !== "complete") {
      await new Promise<void>((r) => iframe.addEventListener("load", () => r(), { once: true }));
    }

    await waitForResources(doc);

    const root = (doc.querySelector(".bb-pdf-root") as HTMLElement | null) ?? doc.body;

    const canvas = await html2canvas(root, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 15000,
      width: A4_WIDTH_PX,
      windowWidth: A4_WIDTH_PX,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc, clonedEl) => {
        sanitizeCloneForCapture(clonedDoc, clonedEl);
      },
    });

    return canvasToA4Pdf(canvas);
  } finally {
    try {
      document.body.removeChild(iframe);
    } catch {
      /* ignore */
    }
  }
}

/** Convert invoice HTML to an A4 PDF and download it (no print dialog). */
export async function openInvoiceHtmlForPrint(
  htmlBlob: Blob,
  sourceUrl: string,
  documentTitle: string,
): Promise<void> {
  const rawHtml = await htmlBlob.text();
  const html = injectPdfAssets(buildInvoiceDocumentHtml(rawHtml, sourceUrl, documentTitle));
  const pdfBlob = await renderHtmlToPdfBlob(html);
  const filename = `${(documentTitle || "invoice").replace(/[/\\?%*:|"<>]/g, "-")}.pdf`;
  triggerBlobDownload(pdfBlob, filename);
}
