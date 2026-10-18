import { useEffect, useRef, useState, type CSSProperties } from 'react';
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

// Stagger index for the animate-* utilities in global.css.
const order = (i: number) => ({ '--i': i }) as CSSProperties;

// Matches the longest exit in global.css (pixel-leave + the largest stagger delay).
const EXIT_MS = 320;

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Left: the options. Right: the full trade-offs of the option being viewed.
// No right/wrong: the first click is saved as your pick, then any option can be viewed to compare.
export default function QuestionPlayer({ questionId, options, itDependsOn, flip, reflection }: Props) {
  const [pick, setPick] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [flipped, setFlipped] = useState(false);
  // While true, the detail panel plays its exit animation before the pick is cleared.
  const [leaving, setLeaving] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const detail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = loadProgress()[questionId]?.pick ?? null;
    setPick(saved);
    setViewing(saved);
  }, [questionId]);

  function view(id: string) {
    if (leaving) return;
    if (pick === null) {
      setPick(id);
      savePick(questionId, id);
    }
    setViewing(id);
    // On narrow screens the panel sits below the list, so bring it into view.
    const panel = detail.current;
    if (panel && window.matchMedia('(max-width: 767px)').matches) {
      panel.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }

  function changePick() {
    if (leaving) return;
    const commit = () => {
      setLeaving(false);
      setPick(null);
      setViewing(null);
      setFlipped(false);
      savePick(questionId, null);
      if (root.current && root.current.getBoundingClientRect().top < 0) {
        root.current.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      }
    };
    if (prefersReducedMotion()) return commit();
    setLeaving(true);
    window.setTimeout(commit, EXIT_MS);
  }

  const shown = options.find((o) => o.id === viewing);

  return (
    <div ref={root} className="scroll-mt-6 space-y-8">
      <div className="grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left: options */}
        <div className="space-y-5">
          <div className="animate-rise flex min-h-6 flex-wrap items-center justify-between gap-3">
            <p className="font-pixel text-sm text-haze">
              {pick === null ? 'Pick the one you would do:' : 'Click any option to compare:'}
            </p>
            {pick !== null && (
              <button
                onClick={changePick}
                className="text-sm text-ember underline-offset-4 hover:text-sun hover:underline"
              >
                Change my pick
              </button>
            )}
          </div>

          {options.map((o, i) => {
            const isViewing = o.id === viewing;
            return (
              <button
                key={o.id}
                onClick={() => view(o.id)}
                aria-pressed={isViewing}
                style={order(i + 1)}
                className={`pixel-box animate-rise flex w-full items-start gap-3 p-4 text-left transition-[background-color,translate] duration-150 ease-[steps(2,end)] hover:-translate-y-0.5 active:translate-y-0.5 ${
                  isViewing
                    ? 'bg-twilight [--pixel-border:var(--color-ember)]'
                    : 'bg-dusk hover:bg-twilight hover:[--pixel-border:var(--color-ember)]'
                }`}
              >
                <span className="font-mono font-semibold text-sun">{o.id}</span>
                <span className="flex-1">{o.label}</span>
                {o.id === pick && (
                  <span className="animate-pop shrink-0 bg-ember px-2 py-0.5 font-pixel text-xs text-night">
                    Your pick
                  </span>
                )}
              </button>
            );
          })}

          {flip && pick !== null && (
            <button
              type="button"
              role="switch"
              aria-checked={flipped}
              onClick={() => setFlipped((f) => !f)}
              className={`pixel-box animate-rise flex w-full cursor-pointer items-center gap-4 p-4 text-left transition-colors duration-300 ease-[steps(3,end)] [--pixel-border:var(--color-sun)] ${
                flipped ? 'bg-plum' : 'bg-twilight'
              }`}
            >
              <span className="pixel-switch" data-on={flipped} aria-hidden />
              <span>
                <span className="font-pixel text-sun">Flip the context:</span> what if it were{' '}
                <em>{flip.context}</em>?
              </span>
            </button>
          )}
        </div>

        {/* Right: full trade-offs of the option being viewed */}
        <div ref={detail} className="scroll-mt-6 md:sticky md:top-6 md:self-start" aria-live="polite">
          <div className={leaving ? 'is-leaving' : ''}>
            {shown ? (
              <Detail
                // Keyed so the panel re-paints with a wipe whenever the option or the context changes.
                key={`${shown.id}-${flipped}`}
                option={shown}
                isPick={shown.id === pick}
                flipNote={flipped ? flip?.notes[shown.id] : undefined}
                flipContext={flipped ? flip?.context : undefined}
              />
            ) : (
              <Placeholder />
            )}
          </div>
        </div>
      </div>

      {pick !== null && (
        <div className={`space-y-6 ${leaving ? 'is-leaving' : ''}`}>
          <div className="animate-rise bg-twilight p-5" style={order(2)}>
            <p className="font-pixel text-sun">It depends on…</p>
            <p>{itDependsOn}</p>
          </div>
          <p className="animate-rise text-center italic text-haze" style={order(3)}>
            {reflection}
          </p>
        </div>
      )}
    </div>
  );
}

function Detail({
  option,
  isPick,
  flipNote,
  flipContext,
}: {
  option: Option;
  isPick: boolean;
  flipNote?: string;
  flipContext?: string;
}) {
  return (
    <article className={`pixel-box animate-wipe bg-dusk p-6 ${isPick ? '[--pixel-border:var(--color-ember)]' : ''}`}>
      <header className="mb-5 flex items-start gap-3">
        <span className="font-mono text-lg font-semibold text-sun">{option.id}</span>
        <h3 className="flex-1 font-sans text-lg font-semibold">{option.label}</h3>
        {isPick && <span className="shrink-0 bg-ember px-2 py-0.5 font-pixel text-xs text-night">Your pick</span>}
      </header>

      {flipNote && (
        <div className="mb-5 border-l-4 border-sun bg-twilight p-4">
          <p className="mb-1 font-pixel text-sm text-sun">If it were {flipContext}</p>
          <p>{flipNote}</p>
        </div>
      )}

      <div className={`grid gap-5 sm:grid-cols-2 ${flipNote ? 'opacity-70' : ''}`}>
        <List title="You gain" items={option.gains} />
        <List title="You pay" items={option.costs} />
        <div>
          <p className="font-medium text-sun">Fits when</p>
          <p>{option.fitsWhen}</p>
        </div>
        <div>
          <p className="font-medium text-sun">Costly when</p>
          <p>{option.breaksWhen}</p>
        </div>
      </div>
    </article>
  );
}

function Placeholder() {
  return (
    <div className="animate-rise flex min-h-48 flex-col items-center justify-center gap-4 border-4 border-dashed border-dusk p-6 text-center text-haze">
      <span className="flex flex-col items-center" aria-hidden>
        <span className="block h-1.5 w-6 bg-sun" />
        <span className="block h-1.5 w-9 bg-sun" />
        <span className="block h-3 w-10 bg-ember" />
      </span>
      <p className="font-pixel text-sm">Pick an option to see what it gains and what it costs.</p>
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
