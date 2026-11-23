"use client";

import { useEffect, useRef, useState } from "react";

import { PixelIcon } from "@/components/pixel/pixel";
import { CATEGORY_META } from "@/components/quotes/categories";
import { Badge } from "@/components/ui/8bit/badge";
import { Button } from "@/components/ui/8bit/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/8bit/empty";
import { ScrollArea } from "@/components/ui/8bit/scroll-area";
import { toast } from "@/components/ui/8bit/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/8bit/sheet";
import { QUOTES_BY_ID } from "@/data/quotes";
import { quoteToText, writeClipboard } from "@/lib/clipboard";
import { removeFromLibrary } from "@/lib/library";
import { sfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ids: string[];
};

export function LibrarySheet({ open, onOpenChange, ids }: Props) {
  const items = ids.map((id) => QUOTES_BY_ID.get(id)).filter((q) => q !== undefined);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy(id: string) {
    const q = QUOTES_BY_ID.get(id);
    if (!q) return;
    if (await writeClipboard(quoteToText(q))) {
      sfx.copy();
      setCopiedId(id);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopiedId(null), 1600);
    } else {
      toast("Couldn't copy. Your browser blocked the clipboard.");
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-[94vw] flex-col gap-0 bg-background p-0 sm:max-w-lg"
      >
        <SheetHeader className="gap-3 border-b-4 border-foreground bg-card p-6 pr-14">
          <SheetTitle className="retro text-sm text-foreground">My Library</SheetTitle>
          <SheetDescription className="font-sans text-lg leading-tight">
            {items.length === 0
              ? "No quotes saved yet."
              : `${items.length} saved ${items.length === 1 ? "quote" : "quotes"}, newest first. Saved in this browser.`}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <Empty className="flex-1 border-0 p-8">
            <EmptyHeader>
              <EmptyMedia>
                <PixelIcon name="heart" className="h-10 text-pink" />
              </EmptyMedia>
              <EmptyTitle className="retro text-xs text-foreground">Shelves are empty</EmptyTitle>
              <EmptyDescription className="font-sans text-lg">
                Press LIKE on a quote and it will beam onto your shelf.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
            <ul className="flex flex-col gap-7 p-6">
              {items.map((q) => {
                const meta = CATEGORY_META[q.category];
                return (
                  <li
                    key={q.id}
                    className="crt relative border-4 border-border p-5 pl-7 shadow-[6px_6px_0_0_rgb(0_0_0_/_0.45)] transition-colors hover:border-foreground/60"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-2.5"
                      style={{ backgroundColor: meta.color }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10 mb-3 flex items-center justify-between gap-3">
                      <Badge className={cn("gap-1.5 px-2 py-1 text-[8px] text-ink", meta.bg)}>
                        <PixelIcon name={meta.icon} className="h-2.5" />
                        {meta.label}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => void copy(q.id)}
                          className={cn(
                            "h-7 gap-1.5 px-2 text-[8px]",
                            copiedId === q.id
                              ? "text-rel hover:bg-transparent hover:text-rel"
                              : "text-foreground/75 hover:bg-white/10 hover:text-foreground",
                          )}
                          aria-label={
                            copiedId === q.id
                              ? "Quote copied"
                              : `Copy "${q.text.slice(0, 48)}" by ${q.author}`
                          }
                        >
                          <PixelIcon
                            name={copiedId === q.id ? "check" : "copy"}
                            className="size-auto h-3"
                          />
                          {copiedId === q.id ? "Copied" : "Copy"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromLibrary(q.id)}
                          className="size-7 p-0 text-destructive hover:bg-destructive hover:text-white"
                          aria-label={`Remove "${q.text.slice(0, 48)}" by ${q.author}`}
                          title="Remove from library"
                        >
                          <PixelIcon name="trash" className="size-auto h-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="glow-text relative z-10 font-sans text-xl leading-snug text-phosphor">
                      “{q.text}”
                    </p>
                    <p
                      className="retro relative z-10 mt-3 text-[8px] leading-relaxed"
                      style={{ color: meta.color }}
                    >
                      — {q.author}
                    </p>
                    {q.source && (
                      <p className="relative z-10 mt-1 font-sans text-base text-muted-foreground">
                        {q.source}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
