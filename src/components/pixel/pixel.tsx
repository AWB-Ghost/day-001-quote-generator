import { cn } from "@/lib/utils";

type Palette = Record<string, string>;

/** Renders rows of characters as crisp SVG pixels. "." is transparent. */
export function PixelGrid({
  rows,
  palette,
  className,
  style,
}: {
  rows: readonly string[];
  palette: Palette;
  className?: string;
  style?: React.CSSProperties;
}) {
  const width = Math.max(...rows.map((r) => r.length));
  const rects: React.ReactNode[] = [];
  rows.forEach((row, y) => {
    let x = 0;
    while (x < row.length) {
      const key = row[x];
      let end = x + 1;
      while (end < row.length && row[end] === key) end++;
      if (key !== "." && palette[key]) {
        rects.push(
          <rect key={`${x}-${y}`} x={x} y={y} width={end - x} height={1} fill={palette[key]} />,
        );
      }
      x = end;
    }
  });
  return (
    <svg
      viewBox={`0 0 ${width} ${rows.length}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      className={className}
      style={style}
    >
      {rects}
    </svg>
  );
}

const ICONS = {
  heart: [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
  trash: ["..###..", "#######", ".......", ".#####.", ".#.#.#.", ".#.#.#.", ".#####."],
  next: ["#...#...", "##..##..", "###.###.", "########", "###.###.", "##..##..", "#...#..."],
  play: ["#....", "##...", "###..", "####.", "###..", "##...", "#...."],
  close: ["#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
  copy: ["####...", "#..#...", "#..####", "#..#..#", "####..#", "...#..#", "...####"],
  check: [".......#", "......##", "#....##.", "##..##..", ".####...", "..##...."],
  sound: [
    "...#.....",
    "..##...#.",
    "####.#..#",
    "####.#..#",
    "####.#..#",
    "..##...#.",
    "...#.....",
  ],
  mute: ["...#.....", "..##.....", "####.#.#.", "####..#..", "####.#.#.", "..##.....", "...#....."],
  // Categories
  motivation: [
    "...#...",
    "...##..",
    "..###..",
    ".####.#",
    ".######",
    "###.###",
    "##...##",
    ".#####.",
  ],
  creativity: ["......#", ".....##", "....##.", "...##..", ".###...", "####...", "##....."],
  happiness: ["#..#..#", ".#...#.", "..###..", "#.###.#", "..###..", ".#...#.", "#..#..#"],
  confidence: ["...#...", "..###..", "#######", ".#####.", "..###..", ".##.##.", "##...##"],
  relaxation: ["....###", "..#####", ".####.#", ".###.##", ".#.####", "#.####.", "#......"],
  random: ["#######", "#.....#", "#.#.#.#", "#.....#", "#.#.#.#", "#.....#", "#######"],
  humour: [
    "..#####..",
    ".#.....#.",
    "#..#.#..#",
    "#.......#",
    "#.#...#.#",
    "#..###..#",
    ".#.....#.",
    "..#####..",
  ],
  sparkle: ["..#..", "..#..", "##.##", "..#..", "..#.."],
} as const;

export type PixelIconName = keyof typeof ICONS;

export function PixelIcon({ name, className }: { name: PixelIconName; className?: string }) {
  return (
    <PixelGrid
      rows={ICONS[name]}
      palette={{ "#": "currentColor" }}
      className={cn("h-[1em] w-auto shrink-0", className)}
    />
  );
}
