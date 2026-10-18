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
      <div className="space-y-5">
        <p className="font-pixel text-sm text-haze">Pick the one you would do:</p>
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => choose(o.id)}
            className="pixel-box flex w-full items-start gap-3 bg-dusk p-4 text-left transition-colors hover:bg-twilight hover:[--pixel-border:var(--color-ember)]"
          >
            <span className="font-mono font-semibold text-sun">{o.id}</span>
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-haze">
          You picked <strong className="text-cream">{pick}</strong>. Here is what each option
          costs.
        </p>
        <button onClick={() => choose(null)} className="text-sm text-ember underline-offset-4 hover:text-sun hover:underline">
          Change my pick
        </button>
      </div>

      {flip && (
        <label className="pixel-box flex cursor-pointer items-center gap-3 bg-twilight p-4 [--pixel-border:var(--color-sun)]">
          <input type="checkbox" checked={flipped} onChange={(e) => setFlipped(e.target.checked)} className="size-4 accent-sun" />
          <span>
            <span className="font-pixel text-sun">Flip the context:</span> what if it were <em>{flip.context}</em>?
          </span>
        </label>
      )}

      <div className="grid gap-6">
        {options.map((o) => (
          <article
            key={o.id}
            className={`pixel-box bg-dusk p-5 ${o.id === pick ? '[--pixel-border:var(--color-ember)]' : ''}`}
          >
            <header className="mb-3 flex items-start gap-3">
              <span className="font-mono font-semibold text-sun">{o.id}</span>
              <h3 className="font-sans font-semibold">{o.label}</h3>
              {o.id === pick && (
                <span className="ml-auto shrink-0 bg-ember px-2 py-0.5 font-pixel text-xs text-night">
                  Your pick
                </span>
              )}
            </header>

            {flipped && flip?.notes[o.id] ? (
              <p className="border-l-4 border-sun bg-twilight p-3 text-sm">{flip.notes[o.id]}</p>
            ) : (
              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <List title="You gain" items={o.gains} />
                <List title="You pay" items={o.costs} />
                <div>
                  <p className="font-medium text-sun">Fits when</p>
                  <p>{o.fitsWhen}</p>
                </div>
                <div>
                  <p className="font-medium text-sun">Costly when</p>
                  <p>{o.breaksWhen}</p>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="bg-twilight p-5">
        <p className="font-pixel text-sun">It depends on…</p>
        <p>{itDependsOn}</p>
      </div>

      <p className="text-center italic text-haze">{reflection}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-medium text-sun">{title}</p>
      <ul className="list-disc pl-5 marker:text-haze">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
