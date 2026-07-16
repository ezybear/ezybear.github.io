import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      client: z.string(),
      type: z.string(),
      stack: z.string(),
      year: z.number().int().positive(),
      summary: z.string(),
      description: z.string().optional(),
      link: z.string().optional(),
      repo: z.string().optional(),
      images: z.array(image()).min(1),
      order: z.number().int().nonnegative().default(999),
      featured: z.boolean().default(false),
    }),
});

export const collections = { projects };
