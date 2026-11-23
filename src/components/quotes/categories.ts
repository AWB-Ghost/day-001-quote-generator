import type { PixelIconName } from "@/components/pixel/pixel";
import type { CategoryChoice } from "@/data/quotes";

type Meta = {
  label: string;
  icon: PixelIconName;
  /** CSS colour (a theme variable) for inline styles and SVG fills. */
  color: string;
  /** Matching Tailwind background class (8bitcn badges read bg-* classes). */
  bg: string;
};

export const CATEGORY_META: Record<CategoryChoice, Meta> = {
  motivation: { label: "Motivation", icon: "motivation", color: "var(--mot)", bg: "bg-mot" },
  creativity: { label: "Creativity", icon: "creativity", color: "var(--cre)", bg: "bg-cre" },
  happiness: { label: "Happiness", icon: "happiness", color: "var(--hap)", bg: "bg-hap" },
  confidence: { label: "Confidence", icon: "confidence", color: "var(--con)", bg: "bg-con" },
  relaxation: { label: "Relaxation", icon: "relaxation", color: "var(--rel)", bg: "bg-rel" },
  humour: { label: "Humour", icon: "humour", color: "var(--hum)", bg: "bg-hum" },
  random: { label: "Random", icon: "random", color: "var(--pink)", bg: "bg-pink" },
};

export const CHOICES: CategoryChoice[] = [
  "motivation",
  "creativity",
  "happiness",
  "confidence",
  "relaxation",
  "humour",
  "random",
];
