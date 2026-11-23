import type { Ref } from "react";

import { CATEGORY_META } from "@/components/quotes/categories";
import { Button } from "@/components/ui/8bit/button";
import { QUOTES_BY_ID } from "@/data/quotes";
import { cn } from "@/lib/utils";

const PER_SHELF = 6;

function bookHeight(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 6 + (h % 3); // 6-8 px tall
}

type Props = {
  ids: string[];
  /** Changes each time a quote lands, to replay the bump. */
  pulse: number;
  onOpen: () => void;
  ref?: Ref<HTMLButtonElement>;
};

/** "My Library" nav button: a tiny pixel bookcase that fills up as you save quotes. */
export function LibraryShelf({ ids, pulse, onOpen, ref }: Props) {
  // Newest books on the top shelf.
  const visible = ids.slice(0, PER_SHELF * 2);
  const shelves = [visible.slice(0, PER_SHELF), visible.slice(PER_SHELF)];

  return (
    <Button
      ref={ref}
      variant="outline"
      onClick={onOpen}
      className="h-9 shrink-0 gap-2.5 bg-card px-3 text-[9px] text-foreground transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-secondary sm:h-10 sm:gap-3 sm:px-4 sm:text-[10px]"
      aria-label={`My library, ${ids.length} saved ${ids.length === 1 ? "quote" : "quotes"}`}
    >
      <span key={pulse} className={cn("relative block", pulse > 0 && "animate-shelf-bump")}>
        <svg
          viewBox="0 0 30 26"
          shapeRendering="crispEdges"
          // "size-auto" opts out of the Button's default 16px icon sizing.
          className="size-auto h-[22px] w-auto sm:h-[24px]"
          aria-hidden="true"
        >
          <rect x="0" y="0" width="30" height="26" fill="var(--foreground)" />
          <rect x="1" y="1" width="28" height="24" fill="#b5713f" />
          <rect x="3" y="3" width="24" height="8" fill="#2a1a12" />
          <rect x="3" y="14" width="24" height="8" fill="#2a1a12" />
          <rect x="1" y="11" width="28" height="2" fill="#8a5530" />
          <rect x="1" y="22" width="28" height="2" fill="#8a5530" />
          {shelves.map((books, s) =>
            books.map((id, i) => {
              const quote = QUOTES_BY_ID.get(id);
              if (!quote) return null;
              const h = bookHeight(id);
              const floor = s === 0 ? 11 : 22;
              const isNewest = s === 0 && i === 0;
              return (
                <g
                  key={isNewest ? `${id}-${pulse}` : id}
                  className={isNewest && pulse > 0 ? "animate-book-drop" : undefined}
                >
                  <rect
                    x={3 + i * 4}
                    y={floor - h}
                    width={3}
                    height={h}
                    style={{ fill: CATEGORY_META[quote.category].color }}
                  />
                  <rect x={3 + i * 4} y={floor - h + 1} width={3} height={1} fill="rgb(255 255 255 / 0.55)" />
                </g>
              );
            })
          )}
        </svg>
      </span>
      <span className="hidden min-[400px]:inline">My Library</span>
      <span
        key={`n-${pulse}`}
        className={cn(
          "retro min-w-6 border-2 border-ink px-1 py-0.5 text-center text-[8px]",
          ids.length > 0 ? "bg-pink text-white" : "bg-secondary text-muted-foreground",
          pulse > 0 && "animate-pop-in"
        )}
      >
        {ids.length}
      </span>
    </Button>
  );
}
