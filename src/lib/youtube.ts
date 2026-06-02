/** URL de thumbnail padrão do YouTube (hqdefault). */
export function thumbnailYoutube(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

/** Embed privacy-enhanced. */
export function embedYoutube(videoId: string): string {
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}
