# Design Taste Trainer

Practice software design decisions and see the trade-offs behind every option. There is no single right answer.

## Run it

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # also validates every question
npm run check    # type check
```

## Add a question

1. Create `src/content/questions/<chapter>/<nn-slug>.mdx` (copy an existing one).
2. Fill in the frontmatter: `constraints`, `options` (each with `gains`, `costs`, `fitsWhen`, `breaksWhen`), `itDependsOn`, `sources`, and optionally `flip`.
3. Write the scenario and code in the body. `<Aside>` is available for side notes.
4. Run `npm run build`. If a field is missing or wrong, the build tells you which one.

New chapters go in `src/content/chapters.json`.
