"use client";

import { useEffect, useState, type Ref } from "react";

import { PixelIcon } from "@/components/pixel/pixel";
import { CATEGORY_META, CHOICES } from "@/components/quotes/categories";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import type { CategoryChoice, Quote } from "@/data/quotes";
import { typingMs } from "@/lib/typewriter";
import { cn } from "@/lib/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Types the quote out character by character with a blinking cursor.
 * The full text is laid out from the start (untyped part invisible) so nothing reflows,
 * and the author line fades in once typing finishes.
 */
function TypedQuote({ quote, color }: { quote: Quote; color: string }) {
  const text = quote.text;
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0));
  const done = count >= text.length;

  useEffect(() => {
    if (done) return;
    const total = typingMs(text.length);
    const start = performance.now();
    const id = setInterval(() => {
      const next = Math.min(
        text.length,
        Math.ceil(((performance.now() - start) / total) * text.length),
      );
      setCount(next);
      if (next >= text.length) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [text, done]);

  return (
    <blockquote className="flex flex-col gap-4">
      <p className="glow-text text-[1.5rem] leading-[1.22] font-medium text-balance text-phosphor sm:text-[2rem]">
        <span style={{ color }}>“</span>
        {text.slice(0, count)}
        {!done && (
          // Zero-width anchor so the cursor never pushes the text around.
          <span className="relative inline-block w-0" aria-hidden="true">
            <span className="animate-blink absolute bottom-[0.12em] left-0.5" style={{ color }}>
              ▌
            </span>
          </span>
        )}
        <span className="invisible" aria-hidden="true">
          {text.slice(count)}
        </span>
        <span style={{ color, opacity: done ? 1 : 0 }}>”</span>
      </p>
      <footer
        className="flex flex-col gap-2 transition-opacity duration-500"
        style={{ opacity: done ? 1 : 0 }}
      >
        <cite
          className="retro text-[9px] leading-relaxed not-italic sm:text-[10px]"
          style={{ color }}
        >
          — {quote.author}
        </cite>
        {quote.source && (
          <span className="text-base leading-tight text-foreground/55">{quote.source}</span>
        )}
      </footer>
    </blockquote>
  );
}

type Props = {
  quote: Quote | null;
  channel: CategoryChoice;
  number?: number;
  total: number;
  liked: boolean;
  /** Changes every time a new quote is shown, to replay the reveal. */
  revealKey: number;
  glitching: boolean;
  /** Content is hidden while it flies away or lies in pieces. */
  hidden: boolean;
  /** TV static between channels. */
  noise: boolean;
  contentRef?: Ref<HTMLDivElement>;
  /** Controls rendered on the monitor's lower bezel (Like / Next / Trash). */
  actions?: React.ReactNode;
  /** Copies the current quote to the clipboard. */
  onCopy?: () => void;
  /** True for a moment after a successful copy. */
  copied?: boolean;
};

/** A retro monitor built on the 8bitcn Card. The screen never moves; only its content changes. */
export function DisplayScreen({
  quote,
  channel,
  number,
  total,
  liked,
  revealKey,
  glitching,
  hidden,
  noise,
  contentRef,
  actions,
  onCopy,
  copied = false,
}: Props) {
  const meta = quote ? CATEGORY_META[quote.category] : CATEGORY_META[channel];
  const channelNo = String(CHOICES.indexOf(channel) + 1).padStart(2, "0");

  return (
    <div className="relative">
      {/* Ambient light the screen casts on its surroundings. One radial gradient that
          fades to nothing well before its own edges, so it blends into the background. */}
      <div
        className="screen-glow pointer-events-none absolute -inset-x-[45%] -inset-y-[55%]"
        style={{ "--glow-color": meta.color } as React.CSSProperties}
        aria-hidden="true"
      />
      <Card font="normal" className="bg-bezel [--card-spacing:0px]">
        <CardContent font="normal" className="flex flex-col gap-2.5 p-2.5 sm:p-5">
          {/* Top bezel */}
          <div className="flex items-center justify-between gap-4 px-1">
            <span className="retro text-[8px] tracking-widest text-muted-foreground sm:text-[9px]">
              PQ-8000 <span className="hidden text-foreground/60 sm:inline">· QUOTE DISPLAY</span>
            </span>
            <span className="flex items-center gap-2.5" aria-hidden="true">
              <span className="size-2 bg-rel shadow-[0_0_6px_var(--rel)]" />
              <span
                className="animate-blink size-2"
                style={{ backgroundColor: meta.color, boxShadow: `0 0 6px ${meta.color}` }}
              />
            </span>
          </div>

          {/* Glass */}
          <div
            className="crt relative overflow-hidden border-4 border-ink shadow-[inset_0_0_0_2px_rgb(255_255_255/0.06)]"
            style={{ "--glow": meta.color } as React.CSSProperties}
          >
            {/* Status bar */}
            <div className="relative z-10 flex items-center justify-between gap-3 border-b-2 border-dashed border-white/10 px-4 py-1.5 sm:px-6">
              <span className="retro flex items-center gap-2 text-[8px] sm:text-[9px]">
                <span className="animate-blink text-pink">●</span>
                {/* On very narrow screens only the blinking dot stays, so the channel fits on one line. */}
                <span className="text-foreground/70 max-[359px]:hidden">LIVE</span>
                <span className="text-foreground/30 max-[359px]:hidden" aria-hidden="true">
                  |
                </span>
                <span className="whitespace-nowrap" style={{ color: CATEGORY_META[channel].color }}>
                  CH-{channelNo} {CATEGORY_META[channel].label.toUpperCase()}
                </span>
              </span>
              <span className="retro text-[8px] text-foreground/50 tabular-nums sm:text-[9px]">
                {quote ? `No.${String(number ?? 0).padStart(2, "0")}/${total}` : "--/--"}
              </span>
            </div>

            {/* Content */}
            <div
              ref={contentRef}
              className={cn(
                // Tall enough for the longest quote, so the screen never changes size.
                "relative z-0 flex min-h-[390px] flex-col justify-center gap-4 px-5 py-7 sm:min-h-[340px] sm:px-12 sm:py-8",
                hidden && "invisible",
              )}
            >
              {quote ? (
                <div
                  key={revealKey}
                  className={cn(
                    "flex flex-col gap-4",
                    glitching ? "animate-glitch" : "animate-crt-reveal",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge
                      className={cn("gap-1.5 px-2 py-1 text-[8px] text-ink sm:text-[9px]", meta.bg)}
                    >
                      <PixelIcon name={meta.icon} className="h-2.5" />
                      {meta.label}
                    </Badge>
                    <div className="flex items-center gap-3 sm:gap-4">
                      {liked && (
                        <span className="retro flex items-center gap-1.5 text-[8px] text-pink sm:text-[9px]">
                          <PixelIcon name="heart" className="h-2.5" />
                          <span className="hidden min-[400px]:inline">In library</span>
                        </span>
                      )}
                      {onCopy && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onCopy}
                          aria-label={copied ? "Quote copied" : "Copy quote"}
                          className={cn(
                            "h-7 gap-1.5 px-2 text-[8px] transition-colors sm:text-[9px]",
                            copied
                              ? "text-rel hover:bg-transparent hover:text-rel"
                              : "text-foreground/75 hover:bg-white/10 hover:text-foreground",
                          )}
                        >
                          <PixelIcon name={copied ? "check" : "copy"} className="size-auto h-3" />
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      )}
                    </div>
                  </div>
                  <TypedQuote quote={quote} color={meta.color} />
                </div>
              ) : (
                <p className="retro text-center text-[10px] leading-loose text-cyan">
                  BOOTING<span className="animate-blink">_</span>
                </p>
              )}
            </div>

            {/* Channel-change static */}
            {noise && (
              <div
                className="static-noise pointer-events-none absolute inset-0 z-20 opacity-70"
                aria-hidden="true"
              />
            )}

            {/* Power-on line, plays once on load */}
            <div
              className="pointer-events-none absolute inset-0 z-30 bg-phosphor motion-safe:animate-[power-on_0.6s_steps(12)_both] motion-reduce:hidden"
              style={{ opacity: 0 }}
              aria-hidden="true"
            />
          </div>

          {/* Lower bezel: the controls */}
          {actions && <div className="pt-1 pb-0.5 sm:pt-1.5">{actions}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
