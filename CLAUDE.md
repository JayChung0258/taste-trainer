@AGENTS.md

# Design Taste Trainer

An interactive site where entry-level engineers practice design decisions and see the trade-offs behind each option, instead of a single "correct" answer. Learners move through a journey of connected questions, not a quiz.

Product thinking lives in the Notion page "Design Taste Trainer: Brainstorm"; engineering decisions live in its child page "Tech Stack". Update "Tech Stack" when an engineering decision changes.

## Stack

- TypeScript (strict), Astro 7 as a static site
- React for interactive islands only (`src/components/*.tsx`)
- Questions as MDX, validated by Zod schemas in `src/content.config.ts`
- Tailwind CSS v4 (+ typography plugin for MDX prose)
- Hosting: Vercel

## Content model

- `src/content/chapters.json`: chapters (journey stops), ordered by `order`
- `src/content/questions/<chapter>/<nn-slug>.mdx`: one question per file
  - Frontmatter holds structured data: constraints, options (gains, costs, fitsWhen, breaksWhen), itDependsOn, optional flip, sources
  - Body holds the scenario narrative and code snippets; `<Aside>` is available without import
- Never hard-code question content in components or pages
- Sources are books only for the MVP; paraphrase, never copy long passages
- Current questions are mock content (`mock: true`)

## Product rules that affect code

- No right/wrong UI: no red/green, no scores, streaks or leaderboards. Use "fits when" / "costly when"
- Progress is stored in the browser only (`src/lib/progress.ts`); no accounts or backend in the MVP

## Commands

- `npm run dev`: dev server (see AGENTS.md for background mode)
- `npm run build`: production build; also validates every question against the schema
