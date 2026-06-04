import type Parser from "rss-parser";

import { MAX_NOTICIAS_POR_CATEGORIA } from "../src/lib/noticias-limites.ts";

/** Máximo de itens lidos por feed RSS (alinhado à retenção por categoria). */
export const MAX_ITENS_POR_FEED = MAX_NOTICIAS_POR_CATEGORIA;

export const FEED_PARSE_TIMEOUT_MS = 30_000;

export async function parseFeedUrl(
  parser: Parser,
  url: string,
  maxItens = MAX_ITENS_POR_FEED,
): Promise<{ feed: Parser.Output; totalNoFeed: number }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const feed = await Promise.race([
      parser.parseURL(url),
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`timeout apos ${FEED_PARSE_TIMEOUT_MS}ms`)),
          FEED_PARSE_TIMEOUT_MS,
        );
      }),
    ]);

    const totalNoFeed = feed.items?.length ?? 0;
    if (feed.items && totalNoFeed > maxItens) {
      feed.items = feed.items.slice(0, maxItens);
    }

    return { feed, totalNoFeed };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
