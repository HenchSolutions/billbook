const PRINT_FIX_CSS = `
<style type="text/css">
  *,*::before,*::after{
    -webkit-print-color-adjust:exact!important;
    print-color-adjust:exact!important;
    color-adjust:exact!important;
  }
</style>`;

function injectPrintFixCss(html: string): string {
  // Inject before closing </head> if present, otherwise before </body>, otherwise prepend
  if (/<\/head\s*>/i.test(html)) {
    return html.replace(/<\/head\s*>/i, `${PRINT_FIX_CSS}</head>`);
  }
  if (/<\/body\s*>/i.test(html)) {
    return html.replace(/<\/body\s*>/i, `${PRINT_FIX_CSS}</body>`);
  }
  return PRINT_FIX_CSS + html;
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

  // Compute all flags once to avoid re-testing the same string in each branch
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

  // Has <html> but no <head>
  return html.replace(
    /<html\b[^>]*>/i,
    (m) => `${m}<head><meta charset="utf-8">${basePart}${titlePart}</head>`,
  );
}

async function runPrintInWindow(w: Window): Promise<void> {
  const doc = w.document;
  try {
    await doc.fonts?.ready;
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
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  w.focus();
  w.print();
}

async function printHtmlViaIframe(html: string): Promise<void> {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  Object.assign(iframe.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "1px",
    height: "1px",
    opacity: "0",
    border: "none",
    pointerEvents: "none",
  });
  document.body.appendChild(iframe);

  try {
    // Use document.write (not a blob URL) so the iframe shares the parent
    // page's origin — external CSS/font URLs from the same CDN load without CORS errors.
    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();

    if (doc.readyState !== "complete") {
      await new Promise<void>((r) => iframe.addEventListener("load", () => r(), { once: true }));
    }

    const iw = iframe.contentWindow;
    if (!iw) throw new Error("Cannot access iframe window");

    await runPrintInWindow(iw);

    // Brief pause so the print dialog has time to open before we remove the iframe
    await new Promise<void>((r) => setTimeout(r, 500));
  } finally {
    try {
      document.body.removeChild(iframe);
    } catch {
      /* ignore */
    }
  }
}

export async function openInvoiceHtmlForPrint(
  htmlBlob: Blob,
  sourceUrl: string,
  documentTitle: string,
): Promise<void> {
  const rawHtml = await htmlBlob.text();
  const html = injectPrintFixCss(buildInvoiceDocumentHtml(rawHtml, sourceUrl, documentTitle));
  await printHtmlViaIframe(html);
}
