import { useEffect, useState } from 'react';
import { loadProgress, type Progress } from '../lib/progress';

type Stop = { id: string; title: string; href: string };
type Chapter = { id: string; title: string; summary: string; questions: Stop[] };

// Progress is shown as places visited, not as a score.
export default function JourneyMap({ chapters }: { chapters: Chapter[] }) {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => setProgress(loadProgress()), []);

  const all = chapters.flatMap((c) => c.questions);
  const next = all.find((q) => !progress[q.id]) ?? all[0];
  const started = all.some((q) => progress[q.id]);

  return (
    <div className="space-y-10">
      {next && (
        <a
          href={next.href}
          className="inline-block rounded-full bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          {started ? 'Continue the journey' : 'Start the journey'} →
        </a>
      )}

      {chapters.map((chapter, i) => (
        <section key={chapter.id}>
          <p className="text-sm uppercase tracking-wide text-stone-500 dark:text-stone-400">Chapter {i + 1}</p>
          <h2 className="text-xl font-semibold">{chapter.title}</h2>
          <p className="mb-4 text-stone-600 dark:text-stone-300">{chapter.summary}</p>
          <ol className="relative space-y-3 border-l-2 border-stone-300 pl-6 dark:border-stone-700">
            {chapter.questions.map((q) => {
              const visited = Boolean(progress[q.id]);
              return (
                <li key={q.id} className="relative">
                  <span
                    className={`absolute -left-[33px] top-1.5 size-4 rounded-full border-2 ${
                      visited
                        ? 'border-indigo-600 bg-indigo-600'
                        : 'border-stone-400 bg-white dark:border-stone-500 dark:bg-stone-950'
                    }`}
                    aria-hidden
                  />
                  <a href={q.href} className="hover:text-indigo-600 hover:underline dark:hover:text-indigo-400">
                    {q.title}
                  </a>
                  {visited && <span className="ml-2 text-sm text-stone-500">· visited</span>}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
