"use client";

import Link from "next/link";
import type { Ref } from "react";

import { PixelGrid, PixelIcon } from "@/components/pixel/pixel";
import { LibraryShelf } from "@/components/quotes/library-shelf";
import { Label } from "@/components/ui/8bit/label";
import { Separator } from "@/components/ui/8bit/separator";
import { Switch } from "@/components/ui/8bit/switch";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sound";
import { cn } from "@/lib/utils";

// A tiny CRT monitor with a quote mark on it.
const LOGO = [
  "##########",
  "#ssssssss#",
  "#scc.ccss#",
  "#scc.ccss#",
  "#s.c..css#",
  "#ssssssss#",
  "##########",
  "....##....",
  "..######..",
];
const LOGO_PALETTE = { "#": "var(--foreground)", s: "#0b1a26", c: "var(--cyan)" };

type Props = {
  libraryIds: string[];
  pulse: number;
  onOpenLibrary: () => void;
  shelfRef?: Ref<HTMLButtonElement>;
};

/** Full-width sticky top bar: logo on the left, My Library on the right, a pixel-dashed edge below. */
export function NavBar({ libraryIds, pulse, onOpenLibrary, shelfRef }: Props) {
  return (
    <nav aria-label="Main" className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-3 px-4 min-[360px]:gap-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
          aria-label="Pixel Quotes, home"
        >
          <PixelGrid
            rows={LOGO}
            palette={LOGO_PALETTE}
            className="h-5 w-auto shrink-0 transition-transform group-hover:-translate-y-0.5 min-[360px]:h-6 sm:h-7"
          />
          <span className="retro truncate text-[8px] leading-none text-foreground min-[360px]:text-[9px] min-[400px]:text-[10px] sm:text-[11px]">
            PIXEL <span className="text-cyan">QUOTES</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-3 min-[360px]:gap-3.5 sm:gap-7">
          <SoundToggle />
          <LibraryShelf ref={shelfRef} ids={libraryIds} pulse={pulse} onOpen={onOpenLibrary} />
        </div>
      </div>
      <Separator className="opacity-25" />
    </nav>
  );
}

/** Small SFX on/off switch. Off by default; the choice is remembered in this browser. */
function SoundToggle() {
  const on = useSoundEnabled();
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <Label
        htmlFor="sound-toggle"
        className={cn(
          // The speaker icon hides below 360px so the logo fits; the switch keeps its own label.
          "flex cursor-pointer items-center gap-2 text-[8px] transition-colors max-[359px]:hidden",
          on ? "text-cyan" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <PixelIcon name={on ? "sound" : "mute"} className="h-3.5" />
        <span className="hidden sm:inline">SFX</span>
      </Label>
      <Switch
        id="sound-toggle"
        // The knob is always the bright part, so its slide reads clearly:
        // off = grey knob on the left of a dark track; on = glowing white knob on the right
        // of a dimmed cyan track.
        className="data-[state=checked]:bg-cyan/35 data-[state=unchecked]:bg-screen [&>[data-slot=switch-thumb][data-state=checked]]:bg-foreground [&>[data-slot=switch-thumb][data-state=checked]]:shadow-[0_0_8px_var(--cyan)] [&>[data-slot=switch-thumb][data-state=unchecked]]:bg-muted-foreground"
        checked={on}
        onCheckedChange={setSoundEnabled}
        aria-label="Sound effects"
      />
    </div>
  );
}
