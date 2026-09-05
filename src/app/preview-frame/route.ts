/**
 * An empty, same-origin HTML document used as the src of the builder's preview iframe.
 *
 * The preview used to run on `about:blank`. That document has no URL, so anything it
 * embeds sends no Referer — and YouTube refuses to play, showing "Video player
 * configuration error (153)". Pointing the iframe at a real route on this origin gives
 * the nested player a referrer, and keeps the document same-origin so React can still
 * portal into its body.
 */
export function GET() {
  return new Response(
    '<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"></head><body></body></html>',
    {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
      },
    },
  );
}
