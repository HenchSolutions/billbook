export type TutorialMedia =
  | { kind: "iframe"; src: string }
  | { kind: "video"; src: string }
  | { kind: "external" };

const VIDEO_FILE = /\.(mp4|webm|ogg)(\?|$)/i;

export function resolveTutorialMedia(watchUrl: string): TutorialMedia {
  const trimmed = watchUrl.trim();
  if (!trimmed) return { kind: "external" };

  if (VIDEO_FILE.test(trimmed)) {
    return { kind: "video", src: trimmed };
  }

  try {
    const u = new URL(trimmed);

    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0]?.split("?")[0];
      if (id) return { kind: "iframe", src: `https://www.youtube.com/embed/${id}` };
    }

    if (
      u.hostname === "youtube.com" ||
      u.hostname === "www.youtube.com" ||
      u.hostname === "m.youtube.com"
    ) {
      if (u.pathname.startsWith("/embed/")) {
        return { kind: "iframe", src: `${u.origin}${u.pathname}${u.search}` };
      }
      const v = u.searchParams.get("v");
      if (v) return { kind: "iframe", src: `https://www.youtube.com/embed/${v}` };
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts?.[1]) return { kind: "iframe", src: `https://www.youtube.com/embed/${shorts[1]}` };
    }

    if (u.hostname.endsWith("vimeo.com")) {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m?.[1]) return { kind: "iframe", src: `https://player.vimeo.com/video/${m[1]}` };
    }

    if (u.hostname.endsWith("loom.com")) {
      const m = u.pathname.match(/\/(?:share|embed)\/([^/?]+)/);
      if (m?.[1]) return { kind: "iframe", src: `https://www.loom.com/embed/${m[1]}` };
    }
  } catch {
    return { kind: "external" };
  }

  return { kind: "external" };
}
