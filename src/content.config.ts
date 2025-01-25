import { defineCollection, z } from "astro:content";

// 2. Import loader(s)
import { glob, file } from "astro/loaders";

// 3. Define your collection(s)
const bookshelf = defineCollection({
  loader: glob({
    pattern: "**/*.md",
    base: "src/content/bookshelf",
  }),
  schema: z.object({
    title: z.string(),
    // author: z.string(),
    date: z.coerce.date(),
  }),
  /* ... */
});

// 4. Export a single `collections` object to register your collection(s)
export const collections = { bookshelf };
