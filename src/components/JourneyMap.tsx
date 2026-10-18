import { useEffect, useState, type CSSProperties } from 'react';
import { loadProgress, type Progress } from '../lib/progress';

type Stop = { id: string; title: string; href: string };
type Chapter = { id: string; title: string; summary: string; questions: Stop[] };
type StopState = 'visited' | 'next' | 'ahead';

// Progress is shown as places visited, not as a score.
export default function JourneyMap({ chapters }: { chapters: Chapter[] }) {
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => setProgress(loadProgress()), []);

  const all = chapters.flatMap((c) => c.questions);
  const next = all.find((q) => !progress[q.id]) ?? all[0];
  const started = all.some((q) => progress[q.id]);

  const stateOf = (q: Stop): StopState => (progress[q.id] ? 'visited' : q.id === next?.id ? 'next' : 'ahead');

  return (
    <div className="space-y-12">
      {next && (
        <a href={next.href} className="pixel-button px-5 py-2.5 text-lg">
          {started ? 'Continue the journey' : 'Start the journey'} →
        </a>
      )}

      {chapters.map((chapter, i) => {
        const states = chapter.questions.map(stateOf);
        return (
          <section key={chapter.id}>
            <p className="font-pixel text-sm tracking-wide text-rose">Chapter {i + 1}</p>
            <h2 className="text-2xl">{chapter.title}</h2>
            <p className="mb-6 text-haze">{chapter.summary}</p>

            <div className="pixel-box mb-8 bg-night">
              <Landscape stops={states} />
            </div>

            <ol className="space-y-4 border-l-4 border-dashed border-dusk pl-6">
              {chapter.questions.map((q, j) => (
                <li key={q.id} className="relative">
                  <Marker state={states[j]} />
                  <a href={q.href} className="text-cream underline-offset-4 hover:text-sun hover:underline">
                    {q.title}
                  </a>
                  {states[j] === 'visited' && <span className="ml-2 text-sm text-haze">· visited</span>}
                  {states[j] === 'next' && <span className="ml-2 text-sm text-haze">· next stop</span>}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function Marker({ state }: { state: StopState }) {
  const fill = {
    visited: 'bg-sun ring-night',
    next: 'bg-night ring-ember',
    ahead: 'bg-night ring-haze',
  }[state];
  const blink = state === 'next' ? 'animate-blink' : '';
  return <span className={`absolute top-1 -left-[35px] size-4 ring-4 ${fill} ${blink}`} aria-hidden />;
}

// ---------------------------------------------------------------------------
// Pixel landscape: a trail winding from the viewer toward the setting sun.
// Drawn on a 160×64 grid of whole-number rects so it scales up as crisp pixels.

const W = 160;
const HORIZON = 44;
const SUN_X = 80;

// Trail waypoints, nearest (bottom) first; the last one touches the horizon below the sun.
const TRAIL: [number, number][] = [
  [18, 63],
  [46, 57],
  [112, 52],
  [64, 47],
  [SUN_X, HORIZON],
];

const STARS: [number, number][] = [
  [12, 4], [31, 9], [52, 3], [97, 6], [121, 2], [140, 10], [150, 4], [70, 12],
];

const SKY = [
  { y: 0, h: 14, fill: 'var(--color-night)' },
  { y: 14, h: 10, fill: 'var(--color-twilight)' },
  { y: 24, h: 8, fill: 'var(--color-dusk)' },
  { y: 32, h: 6, fill: 'var(--color-plum)' },
  { y: 38, h: 6, fill: 'var(--color-magenta)' },
];

// Wider pixels near the viewer, thinner toward the horizon.
const sizeAt = (y: number) => (y > 57 ? 5 : y > 52 ? 4 : y > 48 ? 3 : 2);

function trailPoints(): [number, number][] {
  const seen = new Set<string>();
  const points: [number, number][] = [];
  for (let i = 0; i < TRAIL.length - 1; i++) {
    const [x0, y0] = TRAIL[i];
    const [x1, y1] = TRAIL[i + 1];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
    for (let s = 0; s <= steps; s++) {
      const x = Math.round(x0 + ((x1 - x0) * s) / steps);
      const y = Math.round(y0 + ((y1 - y0) * s) / steps);
      const key = `${x},${y}`;
      if (!seen.has(key)) {
        seen.add(key);
        points.push([x, y]);
      }
    }
  }
  return points;
}

const TRAIL_POINTS = trailPoints();

// Distant hills: deterministic bumps; the sun sinks behind them.
const HILLS = Array.from({ length: W / 4 }, (_, k) => {
  const x = k * 4;
  const top = Math.round(36 + 2 * Math.sin(x / 11) + 1.5 * Math.sin(x / 4.3));
  return { x, top };
});

function Landscape({ stops }: { stops: StopState[] }) {
  // Spread the stops along the trail, leaving the far end (the sun) as the destination.
  const placed = stops.map((state, i) => {
    const [x, y] = TRAIL_POINTS[Math.round(((i + 0.5) / stops.length) * 0.8 * (TRAIL_POINTS.length - 1))];
    return { x, y, state };
  });

  return (
    <svg
      viewBox={`0 0 ${W} 64`}
      className="block h-auto w-full"
      shapeRendering="crispEdges"
      aria-hidden
      focusable="false"
    >
      {SKY.map((band) => (
        <rect key={band.y} x={0} y={band.y} width={W} height={band.h} fill={band.fill} />
      ))}
      {STARS.map(([x, y], i) => (
        <rect
          key={`${x},${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill="var(--color-cream)"
          className={i % 2 ? 'animate-twinkle' : undefined}
          style={{ '--d': `${(i * 0.7) % 3}s` } as CSSProperties}
        />
      ))}

      {/* Setting sun, banded like a pixel-art sunset */}
      <rect x={SUN_X - 5} y={24} width={10} height={2} fill="var(--color-sun)" />
      <rect x={SUN_X - 7} y={26} width={14} height={2} fill="var(--color-sun)" />
      <rect x={SUN_X - 8} y={28} width={16} height={HORIZON - 28} fill="var(--color-ember)" />
      <rect x={SUN_X - 8} y={31} width={16} height={1} fill="var(--color-magenta)" />
      <rect x={SUN_X - 8} y={34} width={16} height={1} fill="var(--color-magenta)" />
      <rect x={SUN_X - 8} y={37} width={16} height={1} fill="var(--color-magenta)" />

      {HILLS.map(({ x, top }) => (
        <rect key={x} x={x} y={top} width={4} height={HORIZON - top} fill="var(--color-dusk)" />
      ))}
      <rect x={0} y={HORIZON} width={W} height={64 - HORIZON} fill="var(--color-twilight)" />

      {TRAIL_POINTS.map(([x, y]) => {
        const s = sizeAt(y);
        return <rect key={`${x},${y}`} x={x - Math.floor(s / 2)} y={y} width={s} height={Math.ceil(s / 2)} fill="var(--color-ember)" />;
      })}

      {placed.map(({ x, y, state }, i) => {
        const s = Math.max(3, sizeAt(y));
        const edge = state === 'visited' ? 'var(--color-night)' : state === 'next' ? 'var(--color-ember)' : 'var(--color-cream)';
        const fill = state === 'visited' ? 'var(--color-sun)' : 'var(--color-night)';
        return (
          <g key={i} className={state === 'next' ? 'animate-blink' : undefined}>
            <rect x={x - Math.floor(s / 2) - 1} y={y - s} width={s + 2} height={s + 2} fill={edge} />
            <rect x={x - Math.floor(s / 2)} y={y - s + 1} width={s} height={s} fill={fill} />
          </g>
        );
      })}
    </svg>
  );
}
