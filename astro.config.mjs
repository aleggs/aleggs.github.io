import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import lit from "@astrojs/lit";

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [lit()],
  site: "https://alex-xu.com",
  outDir: "./dist",
});
