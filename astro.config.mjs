import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://gplay-newsletter.vercel.app",
  trailingSlash: "ignore",
  build: {
    format: "directory",
  },
});
