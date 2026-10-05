export function YoutubePlayer({
  url,
  startSeconds,
  endSeconds,
}: {
  url: string;
  startSeconds?: number | null;
  endSeconds?: number | null;
}) {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  const params = new URLSearchParams();
  if (startSeconds !== null && startSeconds !== undefined) {
    params.set("start", String(startSeconds));
  }
  if (endSeconds !== null && endSeconds !== undefined) {
    params.set("end", String(endSeconds));
  }
  const query = params.toString();
  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube.com/embed/${videoId}${query ? `?${query}` : ""}`}
        title="Instructional video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

function getYoutubeVideoId(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") return parsed.pathname.slice(1);
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/")[2];
    }
  } catch {
    return null;
  }
  return null;
}
