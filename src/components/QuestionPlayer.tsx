import { useEffect, useState } from 'react';
import { loadProgress, savePick } from '../lib/progress';

type Option = {
  id: string;
  label: string;
  gains: string[];
  costs: string[];
  fitsWhen: string;
  breaksWhen: string;
};

type Props = {
  questionId: string;
  options: Option[];
  itDependsOn: string;
  flip?: { context: string; notes: Record<string, string> };
  reflection: string;
};

// No right/wrong: once you pick, every option's trade-offs are revealed side by side.
export default function QuestionPlayer({ questionId, options, itDependsOn, flip, reflection }: Props) {
  const [pick, setPick] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setPick(loadProgress()[questionId]?.pick ?? null);
  }, [questionId]);

  function choose(id: string | null) {
    setPick(id);
    setFlipped(false);
    savePick(questionId, id);
  }

  if (pick === null) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Pick the one you would do:</p>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(o.id)}
            className="flex w-full items-start gap-3 rounded-xl border border-stone-300 bg-white p-4 text-left transition hover:border-indigo-500 hover:shadow-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{o.id}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          You picked <strong className="text-stone-900 dark:text-stone-100">{pick}</strong>. Here is what each option
          costs.
        </p>
        <button onClick={() => choose(null)} className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
          Change my pick
        </button>
      </div>

      {flip && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/40">
          <input type="checkbox" checked={flipped} onChange={(e) => setFlipped(e.target.checked)} className="size-4" />
          <span>
            <span className="font-medium">Flip the context:</span> what if it were <em>{flip.context}</em>?
          </span>
        </label>
      )}

      <div className="grid gap-4">
        {options.map((o) => (
          <article
            key={o.id}
            className={`rounded-xl border p-5 ${
              o.id === pick
                ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/30'
                : 'border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-900'
            }`}
          >
            <header className="mb-3 flex items-start gap-3">
              <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{o.id}</span>
              <h3 className="font-semibold">{o.label}</h3>
              {o.id === pick && (
                <span className="ml-auto shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white">
                  Your pick
                </span>
              )}
            </header>

            {flipped && flip?.notes[o.id] ? (
              <p className="rounded-lg bg-amber-100/70 p-3 text-sm dark:bg-amber-900/40">{flip.notes[o.id]}</p>
            ) : (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <List title="You gain" items={o.gains} />
                <List title="You pay" items={o.costs} />
                <div>
                  <p className="font-medium">Fits when</p>
                  <p className="text-stone-600 dark:text-stone-300">{o.fitsWhen}</p>
                </div>
                <div>
                  <p className="font-medium">Costly when</p>
                  <p className="text-stone-600 dark:text-stone-300">{o.breaksWhen}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="rounded-xl bg-stone-100 p-5 dark:bg-stone-800">
        <p className="font-medium">It depends on…</p>
        <p className="text-stone-700 dark:text-stone-300">{itDependsOn}</p>
      </div>

      <p className="text-center italic text-stone-500 dark:text-stone-400">{reflection}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="list-disc pl-5 text-stone-600 dark:text-stone-300">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
