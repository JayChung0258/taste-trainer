import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

// A chapter is one stop on the journey: a short, ordered set of connected questions.
const chapters = defineCollection({
  loader: file('src/content/chapters.json'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    order: z.number().int().positive(),
  }),
});

const option = z.object({
  id: z.string().regex(/^[A-Z]$/, 'Option ids are single capital letters: A, B, C...'),
  label: z.string(),
  gains: z.array(z.string()).min(1),
  costs: z.array(z.string()).min(1),
  fitsWhen: z.string(),
  breaksWhen: z.string(),
});

const source = z.object({
  title: z.string(),
  author: z.string(),
  // Where in the book, e.g. "Chapter 11". Paraphrase, never quote long passages.
  location: z.string().optional(),
  url: z.url().optional(),
});

// The same question under a changed constraint. Notes are keyed by option id.
const flip = z.object({
  context: z.string(),
  notes: z.record(z.string(), z.string()),
});

// Questions are MDX files. Structured data lives in frontmatter so it can be validated;
// the MDX body holds the scenario narrative and code snippets.
const questions = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/questions' }),
  schema: z
    .object({
      title: z.string(),
      chapter: reference('chapters'),
      order: z.number().int().positive(),
      constraints: z.array(z.string()).min(1),
      options: z.array(option).min(2).max(5),
      itDependsOn: z.string(),
      flip: flip.optional(),
      sources: z.array(source).min(1),
      reflection: z.string().default('What would change your mind?'),
      mock: z.boolean().default(false),
    })
    .superRefine((q, ctx) => {
      const ids = q.options.map((o) => o.id);
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({ code: 'custom', path: ['options'], message: 'Option ids must be unique' });
      }
      if (q.flip) {
        for (const id of Object.keys(q.flip.notes)) {
          if (!ids.includes(id)) {
            ctx.addIssue({
              code: 'custom',
              path: ['flip', 'notes', id],
              message: `Flip note for unknown option "${id}"`,
            });
          }
        }
      }
    }),
});

export const collections = { chapters, questions };
