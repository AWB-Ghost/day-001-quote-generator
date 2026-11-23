import { memo, type Ref } from "react";

import { PixelIcon } from "@/components/pixel/pixel";
import { CATEGORY_META } from "@/components/quotes/categories";
import { Button } from "@/components/ui/8bit/button";
import { Card, CardContent } from "@/components/ui/8bit/card";
import { Progress } from "@/components/ui/8bit/progress";
import { BIN_CAPACITY, type TrashItem } from "@/lib/trash";
import { cn } from "@/lib/utils";

/** Deterministic pseudo-random in [0, 1) so renders stay pure. */
function prand(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Each shredded quote leaves this many fragments in the bin. */
const PER_QUOTE = 14;
const BIN_COLUMNS = 36;

export type ShredderStatus = "ready" | "shredding" | "done";

type Props = {
  status: ShredderStatus;
  accent: string;
  items: TrashItem[];
  /** Id of the quote shredded most recently in this visit; its fragments drop in. */
  freshId?: string;
  emptying: boolean;
  /** True while the pile is flying out of the bin (the release animation draws it instead). */
  releasing: boolean;
  /** Briefly shows "TRASH EMPTIED" on the machine. */
  notice: boolean;
  /** Changes each time the full bin should flash a warning. */
  alert: number;
  /** False while another animation runs. */
  canEmpty: boolean;
  onEmpty: () => void;
  mouthRef?: Ref<HTMLDivElement>;
  binRef?: Ref<HTMLDivElement>;
};

/** The SHRED-O-MATIC 8, parked under the display. Shredded quotes pile up in its bin. */
export const Shredder = memo(function Shredder({
  status,
  accent,
  items,
  freshId,
  emptying,
  releasing,
  notice,
  alert,
  canEmpty,
  onEmpty,
  mouthRef,
  binRef,
}: Props) {
  const active = status === "shredding";
  const count = items.length;
  const full = count >= BIN_CAPACITY;
  // The lid swings open while scraps drop in and while the bin is being emptied.
  const lidOpen = emptying || active;

  // Lay every quote's fragments out in order; flex-wrap-reverse stacks them from the bottom up.
  const fragments = items.flatMap((item) =>
    Array.from({ length: PER_QUOTE }, (_, i) => {
      const r = prand(i, item.seed);
      return {
        key: `${item.id}-${i}`,
        // Only white and the shredded quote's category colour.
        color: r < 0.6 ? CATEGORY_META[item.category].color : "var(--phosphor)",
        fresh: item.id === freshId,
        i,
      };
    }),
  );

  return (
    <div className="relative mx-auto flex w-[80%] max-w-[392px] flex-col items-stretch sm:w-[60%]">
      <div aria-hidden="true">
        {/* Feed chute from the display */}
        <div className="mx-auto h-2 w-[70%] border-x-4 border-foreground/25 bg-gradient-to-b from-transparent to-ink/60" />

        {/* Intake mouth */}
        <div className="relative z-10 border-4 border-foreground bg-[#2a2e52] px-3 py-1.5">
          <div
            ref={mouthRef}
            className="h-2 border-2 border-black bg-black"
            style={active ? { animation: "mouth-glow 0.3s steps(2) infinite" } : undefined}
          />
        </div>

        {/* Body */}
        <div className={cn("relative", active && "animate-shake")}>
          {/* Temporary "TRASH EMPTIED" sign across the machine */}
          {notice && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
              <span className="retro animate-pop-in border-4 border-ink bg-rel px-3 py-2 text-[9px] whitespace-nowrap text-ink shadow-[0_0_0_4px_var(--rel),0_0_24px_var(--rel)] sm:text-[10px]">
                TRASH EMPTIED
              </span>
            </div>
          )}
          <Card font="normal" className="bg-[#1f2347] [--card-spacing:0px]">
            <CardContent font="normal" className="flex flex-col gap-2 p-2 sm:p-2.5">
              <div className="flex flex-col gap-1 border-4 border-ink bg-black p-1">
                <div className="rollers h-2" data-active={active} />
                <div className="rollers h-2" data-active={active} data-reverse="true" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <span className="retro text-[8px] leading-relaxed whitespace-nowrap text-foreground">
                  SHRED-O-MATIC <span style={{ color: accent }}>8</span>
                </span>
                <span
                  className={cn(
                    "retro order-last basis-full border-2 border-ink bg-screen px-2 py-1 text-center text-[7px] min-[440px]:order-none min-[440px]:basis-auto min-[440px]:min-w-[96px]",
                    active
                      ? "text-[#ff6b2d]"
                      : status === "done"
                        ? "text-rel"
                        : full
                          ? "text-destructive"
                          : "text-cyan",
                  )}
                >
                  {active ? (
                    <>
                      SHREDDING<span className="animate-blink">…</span>
                    </>
                  ) : emptying ? (
                    <>
                      RELEASING<span className="animate-blink">…</span>
                    </>
                  ) : notice ? (
                    "EMPTIED ✓"
                  ) : status === "done" ? (
                    "DELETED ✓"
                  ) : full ? (
                    "BIN FULL"
                  ) : (
                    "READY"
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-2.5 border-2 border-ink",
                      active || full ? "bg-[#ff4d4d]" : "bg-[#4d1420]",
                    )}
                    style={
                      active
                        ? {
                            animation: "blink 0.16s steps(1) infinite",
                            boxShadow: "0 0 8px #ff4d4d",
                          }
                        : undefined
                    }
                  />
                  <span
                    className={cn(
                      "size-2.5 border-2 border-ink",
                      active || full ? "bg-[#1a4d36]" : "bg-rel",
                    )}
                  />
                </span>
              </div>

              <div className="hazard h-1.5 border-2 border-ink" />
            </CardContent>
          </Card>
        </div>

        {/* Output slot */}
        <div className="relative mx-auto -mt-0.5 h-1.5 w-[64%] bg-black" />

        {/* Collection bin (its frame flashes red when it's full and you try to add more) */}
        <div
          className={cn(
            "relative mx-auto w-[84%] border-x-4 border-b-4 border-foreground/80 bg-ink/80 p-1 transition-shadow duration-300",
            lidOpen && "shadow-[inset_0_10px_18px_-6px_rgb(255_210_63_/_0.45)]",
          )}
        >
          {alert > 0 && full && (
            <span
              key={alert}
              className="bin-alert pointer-events-none absolute -inset-x-1 -top-1 -bottom-1 z-20 border-4 border-destructive"
            />
          )}
          {/* Lid: two sliding doors that part to open the bin */}
          <div className="pointer-events-none absolute inset-x-[-4px] -top-[6px] z-10 flex">
            <span
              className="block h-1.5 w-1/2 bg-foreground/80 transition-transform duration-300"
              style={{
                transform: lidOpen ? "translateX(-70%)" : undefined,
                transitionTimingFunction: "steps(5)",
              }}
            />
            <span
              className="block h-1.5 w-1/2 bg-foreground/80 transition-transform duration-300"
              style={{
                transform: lidOpen ? "translateX(70%)" : undefined,
                transitionTimingFunction: "steps(5)",
              }}
            />
          </div>
          <div
            ref={binRef}
            className={cn(
              "flex aspect-[36/4] flex-wrap-reverse content-start overflow-hidden",
              releasing && "invisible",
            )}
            style={{ ["--cols" as string]: BIN_COLUMNS }}
          >
            {fragments.map((f) => (
              <span
                key={f.key}
                className={cn(
                  "block aspect-square w-[calc(100%/var(--cols))] p-[1px]",
                  !emptying && f.fresh && "bin-drop",
                )}
                style={
                  {
                    animationDelay: f.fresh ? `${f.i * 28}ms` : undefined,
                  } as React.CSSProperties
                }
              >
                <span
                  data-frag
                  className="block size-full"
                  style={{ backgroundColor: f.color, boxShadow: `0 0 4px ${f.color}` }}
                />
              </span>
            ))}
          </div>
          {count === 0 && !releasing && (
            <span className="retro absolute inset-0 flex items-center justify-center text-[7px] text-foreground/50">
              EMPTY
            </span>
          )}
        </div>
      </div>

      <p className="sr-only" role="status">
        {notice ? "Trash emptied" : ""}
      </p>

      {/* Capacity + Empty Trash */}
      <div className="mx-auto mt-3 flex w-full flex-col items-stretch gap-2.5 px-1 min-[440px]:flex-row min-[440px]:items-center min-[440px]:gap-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <span className="retro text-[8px] text-muted-foreground">TRASH BIN</span>
            <span
              className={cn(
                "retro text-[8px] tabular-nums",
                full ? "animate-blink text-destructive" : "text-foreground",
              )}
            >
              {full ? "FULL " : ""}
              {String(count).padStart(2, "0")}/{BIN_CAPACITY}
            </span>
          </div>
          <Progress
            aria-label={`Trash bin ${count} of ${BIN_CAPACITY} full`}
            value={(count / BIN_CAPACITY) * 100}
            variant="retro"
            progressBg={
              full ? "bg-destructive" : count / BIN_CAPACITY >= 0.75 ? "bg-hap" : "bg-rel"
            }
            className="h-3"
          />
        </div>
        <Button
          variant="outline"
          onClick={onEmpty}
          disabled={count === 0 || emptying || !canEmpty}
          className="h-8 shrink-0 gap-2 bg-screen px-3 text-[8px] text-foreground transition-[background-color,color,transform] hover:-translate-y-0.5 hover:bg-foreground hover:text-ink"
        >
          <PixelIcon name="trash" className="h-3" />
          {emptying ? "Emptying…" : "Empty Trash"}
        </Button>
      </div>
    </div>
  );
});
