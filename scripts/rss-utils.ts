import type Parser from "rss-parser";

/** Limite extra por feed; retencao no acervo e bem menor (20/categoria). */
export const MAX_ITENS_POR_FEED = 50;

export const FEED_PARSE_TIMEOUT_MS = 30_000;

export async function parseFeedUrl(
  parser: Parser,
  url: string,
  maxItens = MAX_ITENS_POR_FEED,
): Promise<{ feed: Parser.Output; totalNoFeed: number }> {
  const feed = await Promise.race([
    parser.parseURL(url),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`timeout apos ${FEED_PARSE_TIMEOUT_MS}ms`)),
        FEED_PARSE_TIMEOUT_MS,
      ),
    ),
  ]);

  const totalNoFeed = feed.items?.length ?? 0;
  if (feed.items && totalNoFeed > maxItens) {
    feed.items = feed.items.slice(0, maxItens);
  }

  return { feed, totalNoFeed };
}
