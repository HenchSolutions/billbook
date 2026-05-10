const A4_W = 595.28;
const A4_H = 841.89;

function isNearlyA4(width: number, height: number): boolean {
  const tol = 4;
  const portrait = Math.abs(width - A4_W) < tol && Math.abs(height - A4_H) < tol;
  const landscape = Math.abs(width - A4_H) < tol && Math.abs(height - A4_W) < tol;
  return portrait || landscape;
}

export async function normalizePdfBlobToA4(blob: Blob): Promise<Blob> {
  const { PDFDocument } = await import("pdf-lib");
  const bytes = new Uint8Array(await blob.arrayBuffer());

  let src: Awaited<ReturnType<(typeof PDFDocument)["load"]>>;
  try {
    src = await PDFDocument.load(bytes, { ignoreEncryption: true });
  } catch {
    return blob;
  }

  const pageCount = src.getPageCount();
  if (pageCount === 0) return blob;

  const srcPages = src.getPages();
  const out = await PDFDocument.create();

  for (let i = 0; i < pageCount; i++) {
    const srcPage = srcPages[i]!;
    const sw = srcPage.getWidth();
    const sh = srcPage.getHeight();

    if (isNearlyA4(sw, sh)) {
      const [copied] = await out.copyPages(src, [i]);
      out.addPage(copied);
      continue;
    }

    const [embedded] = await out.embedPdf(src, [i]);
    const iw = embedded.width;
    const ih = embedded.height;
    const landscape = iw > ih;
    const boxW = landscape ? A4_H : A4_W;
    const boxH = landscape ? A4_W : A4_H;
    const scale = Math.min(boxW / iw, boxH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const x = (boxW - dw) / 2;
    const y = (boxH - dh) / 2;
    const page = out.addPage([boxW, boxH]);
    page.drawPage(embedded, { x, y, width: dw, height: dh });
  }

  const outBytes = await out.save();
  return new Blob([new Uint8Array(outBytes)], { type: "application/pdf" });
}
