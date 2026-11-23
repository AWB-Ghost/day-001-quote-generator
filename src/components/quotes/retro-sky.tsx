import { PixelGrid } from "@/components/pixel/pixel";

/** Deterministic pseudo-random in [0, 1), so server and client render the same sky. */
function prand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 46 }, (_, i) => ({
  left: `${(prand(i, 1) * 100).toFixed(2)}%`,
  top: `${(prand(i, 2) * 100).toFixed(2)}%`,
  size: prand(i, 3) > 0.85 ? 2 : 1,
  opacity: 0.25 + prand(i, 4) * 0.35,
}));

const SNOW_COLORS = ["#e8ecff", "#e8ecff", "#bdf6ff", "#2ee6ff", "#ffd8ee"];

/** Slow pixel snow: each flake falls the full height on a long, staggered loop. */
const SNOW = Array.from({ length: 30 }, (_, i) => {
  const duration = 18 + prand(i, 6) * 18; // 18–36s per fall
  return {
    left: `${(prand(i, 5) * 100).toFixed(2)}%`,
    size: prand(i, 7) > 0.75 ? 3 : 2,
    color: SNOW_COLORS[i % SNOW_COLORS.length],
    drift: `${Math.round((prand(i, 8) - 0.5) * 80)}px`,
    duration: `${duration.toFixed(1)}s`,
    // Negative delay so flakes are already spread out on first paint.
    delay: `-${(prand(i, 9) * duration).toFixed(1)}s`,
    opacity: 0.3 + prand(i, 10) * 0.4,
  };
});

/** Two small constellations, drawn in a 100×100 box: [x, y] points joined in order. */
const CONSTELLATIONS = [
  {
    className: "left-[3%] top-[7%] w-40",
    points: [
      [6, 70],
      [24, 48],
      [46, 56],
      [62, 28],
      [88, 18],
    ],
  },
  {
    className: "right-[5%] top-[22%] w-32",
    points: [
      [10, 20],
      [34, 34],
      [30, 66],
      [62, 78],
      [90, 58],
    ],
  },
];

const MOON = [
  "...####...",
  ".##oooo##.",
  "#oocoooooo",
  "#oooooco.#",
  "#ooooooo.#",
  "#ococoo..#",
  ".#ooooo.#.",
  "..######..",
];
const MOON_PALETTE = { "#": "#6f78a8", o: "#dfe4ff", c: "#a9b2e0", ".": "transparent" };

const PLANET = [
  "....####....",
  "..#oooooo#..",
  "rr#oosooo#rr",
  ".rrrrrrrrrr.",
  "..#oooooo#..",
  "....####....",
];
const PLANET_PALETTE = { "#": "#5b46a8", o: "#9a7bff", s: "#c7b4ff", r: "#ffd23f" };

/** Circuit-board traces for the side of the screen (drawn for the left; mirrored for the right). */
const TRACES = [
  "M0 40 H50 L70 60 V140 H120",
  "M0 110 H24 V250 L44 270 H96",
  "M0 330 H70 L90 310 V220 H150",
  "M0 400 H40 V440 H110",
  "M12 0 V18 H92 L108 2 H150",
];
const NODES: [number, number][] = [
  [120, 140],
  [96, 270],
  [150, 220],
  [110, 440],
  [150, 2],
];
/** Which traces carry a travelling data pulse, and how fast. */
const PULSES = [
  { trace: 0, color: "var(--cyan)", dur: "7s", delay: "0s" },
  { trace: 2, color: "var(--pink)", dur: "9s", delay: "-3s" },
  { trace: 3, color: "var(--cyan)", dur: "6s", delay: "-1.5s" },
];

function Circuit({ side }: { side: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 170 460"
      shapeRendering="crispEdges"
      className={`absolute top-[30%] hidden h-[46vh] w-auto lg:block ${side === "left" ? "left-0" : "right-0 -scale-x-100"}`}
    >
      {TRACES.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="rgb(46 230 255 / 0.16)" strokeWidth="2" />
      ))}
      {NODES.map(([x, y], i) => (
        <g key={`n${i}`}>
          <rect
            x={x - 4}
            y={y - 4}
            width="8"
            height="8"
            fill="var(--background)"
            stroke="rgb(46 230 255 / 0.32)"
            strokeWidth="2"
          />
          <rect x={x - 1} y={y - 1} width="2" height="2" fill="rgb(46 230 255 / 0.55)" />
        </g>
      ))}
      {PULSES.map((p, i) => (
        <path
          key={`p${i}`}
          d={TRACES[p.trace]}
          pathLength={100}
          fill="none"
          stroke={p.color}
          strokeWidth="2"
          strokeDasharray="4 96"
          className="circuit-pulse"
          style={
            {
              "--dur": p.dur,
              animationDelay: p.delay,
              filter: `drop-shadow(0 0 3px ${p.color})`,
            } as React.CSSProperties
          }
        />
      ))}
    </svg>
  );
}

/** Small HUD-style corner brackets framing the play area. */
function Corner({ className }: { className: string }) {
  return <span className={`absolute hidden size-5 border-cyan/35 sm:block ${className}`} />;
}

/** Fixed decorative backdrop: dotted grid, circuits, HUD corners, stars, constellations,
    a moon and planet, slow snow, a satellite and horizontal floor lines. */
export function RetroSky() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="dot-grid" />
      <Circuit side="left" />
      <Circuit side="right" />
      <Corner className="top-[84px] left-4 border-t-[3px] border-l-[3px] lg:left-6" />
      <Corner className="top-[84px] right-4 border-t-[3px] border-r-[3px] lg:right-6" />
      <Corner className="bottom-4 left-4 border-b-[3px] border-l-[3px] lg:left-6" />
      <Corner className="right-4 bottom-4 border-r-[3px] border-b-[3px] lg:right-6" />

      {STARS.map((s, i) => (
        <span
          key={`star${i}`}
          className="absolute bg-foreground"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size, opacity: s.opacity }}
        />
      ))}

      {/* Constellations */}
      {CONSTELLATIONS.map((c, i) => (
        <svg
          key={`con${i}`}
          viewBox="0 0 100 100"
          shapeRendering="crispEdges"
          className={`absolute hidden h-auto opacity-60 md:block ${c.className}`}
        >
          <polyline
            points={c.points.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="none"
            stroke="rgb(189 246 255 / 0.28)"
            strokeWidth="0.8"
            strokeDasharray="2 2.5"
          />
          {c.points.map(([x, y], j) => (
            <rect
              key={j}
              x={x - 1.5}
              y={y - 1.5}
              width="3"
              height="3"
              fill={j === 2 ? "var(--cyan)" : "#e8ecff"}
              style={{ animation: `twinkle ${3 + j * 0.7}s steps(2) ${j * 0.4}s infinite` }}
            />
          ))}
        </svg>
      ))}

      {/* Moon and ringed planet */}
      <PixelGrid
        rows={MOON}
        palette={MOON_PALETTE}
        className="absolute top-[11%] right-[7%] h-auto w-10 opacity-60 drop-shadow-[0_0_14px_rgb(223_228_255_/_0.45)] sm:w-14"
      />
      <PixelGrid
        rows={PLANET}
        palette={PLANET_PALETTE}
        className="absolute bottom-[26%] right-[7%] hidden h-auto w-14 opacity-45 md:block lg:right-[13%]"
      />

      {/* Snow */}
      {SNOW.map((f, i) => (
        <span
          key={`snow${i}`}
          className="snowflake"
          style={
            {
              left: f.left,
              width: f.size,
              height: f.size,
              backgroundColor: f.color,
              boxShadow: `0 0 6px ${f.color}`,
              opacity: f.opacity,
              "--drift": f.drift,
              animationDuration: f.duration,
              animationDelay: f.delay,
            } as React.CSSProperties
          }
        />
      ))}

      {/* A satellite drifts across now and then */}
      <span className="satellite top-[22%] left-0" style={{ animationDelay: "-20s" }} />

      {/* Horizontal floor lines, spaced wider toward the viewer */}
      <div className="floor-lines" />
    </div>
  );
}
