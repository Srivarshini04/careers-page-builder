import { toEmbedUrl } from "@/lib/utils/video";

/** Embeds the recruiter's culture video. Renders nothing if the URL isn't embeddable. */
export function CultureVideo({
  url,
  companyName,
}: {
  url: string | null;
  companyName: string;
}) {
  const embedUrl = toEmbedUrl(url);
  if (!embedUrl) return null;

  return (
    <div className="mt-10 overflow-hidden rounded-2xl border border-ink-200 bg-ink-900 shadow-sm">
      <div className="relative aspect-video">
        <iframe
          src={embedUrl}
          title={`Life at ${companyName} — culture video`}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
