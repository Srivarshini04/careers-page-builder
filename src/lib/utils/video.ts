/**
 * Recruiters paste whatever URL they have (watch link, share link, embed link).
 * We normalise the common YouTube/Vimeo shapes into an embeddable URL and return
 * null for anything we can't safely put in an iframe.
 */
export function toEmbedUrl(rawUrl: string | null | undefined): string | null {
  if (!rawUrl) return null;

  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${url.pathname}`;
    }
    if (url.pathname.startsWith("/shorts/")) {
      return `https://www.youtube.com/embed/${url.pathname.split("/")[2]}`;
    }
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return /^\d+$/.test(id ?? "") ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host === "player.vimeo.com") return url.toString();

  return null;
}
