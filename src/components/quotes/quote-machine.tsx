"use client";

import { useEffect, useEffectEvent, useRef, useState } from "react";

import { PixelIcon } from "@/components/pixel/pixel";
import { CATEGORY_META, CHOICES } from "@/components/quotes/categories";
import { DisplayScreen } from "@/components/quotes/display-screen";
import { LibrarySheet } from "@/components/quotes/library-sheet";
import { NavBar } from "@/components/quotes/nav-bar";
import { Shredder, type ShredderStatus } from "@/components/quotes/shredder";
import { Button } from "@/components/ui/8bit/button";
import { Label } from "@/components/ui/8bit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/8bit/select";
import { toast } from "@/components/ui/8bit/toast";
import {
  CATEGORIES,
  QUOTES,
  QUOTES_BY_ID,
  quotesFor,
  type CategoryChoice,
  type Quote,
} from "@/data/quotes";
import { addToLibrary, removeFromLibrary, useLibrary } from "@/lib/library";
import { quoteToText, writeClipboard } from "@/lib/clipboard";
import { sfx } from "@/lib/sound";
import { typingMs } from "@/lib/typewriter";
import { addToTrash, BIN_CAPACITY, emptyTrash, useTrash } from "@/lib/trash";
import { cn } from "@/lib/utils";

type Fragment = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  jx: number;
  rot: number;
  delay: number;
  duration: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dx: number;
  dy: number;
  jx: number;
  delay: number;
  duration: number;
  /** Length of the glowing trail; 0 for none. Sparks have no trail and twinkle instead. */
  trail: number;
  spark: boolean;
};

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = (ms: number) => new Promise((r) => setTimeout(r, reducedMotion() ? 0 : ms));

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Sends a small glowing "data packet" from the screen to the library button. */
function beamToShelf(from: DOMRect, to: DOMRect, color: string): Promise<void> {
  if (reducedMotion()) return Promise.resolve();
  const w = Math.min(from.width * 0.5, 260);
  const h = Math.min(from.height * 0.45, 104);
  const x = from.left + from.width / 2 - w / 2;
  const y = from.top + from.height / 2 - h / 2;

  const el = document.createElement("div");
  Object.assign(el.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: `${w}px`,
    height: `${h}px`,
    zIndex: "60",
    pointerEvents: "none",
    background: "var(--screen)",
    border: `4px solid ${color}`,
    boxShadow: `0 0 0 4px var(--ink), 0 0 24px ${color}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: "10px",
    padding: "16px",
  });
  for (const width of ["92%", "78%", "40%"]) {
    const line = document.createElement("span");
    Object.assign(line.style, {
      display: "block",
      height: "8px",
      width,
      background: width === "40%" ? color : "var(--phosphor)",
    });
    el.appendChild(line);
  }
  document.body.appendChild(el);

  const dx = to.left + to.width / 2 - (x + w / 2);
  const dy = to.top + to.height / 2 - (y + h / 2);
  const scale = Math.max(0.08, (to.height * 0.6) / h);
  return el
    .animate(
      [
        { transform: "none", opacity: 1 },
        {
          transform: `translate(${dx * 0.1}px, -24px) scale(0.9) rotate(-4deg)`,
          opacity: 1,
          offset: 0.25,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale}) rotate(10deg)`, opacity: 0.3 },
      ],
      { duration: 620, easing: "cubic-bezier(0.55, 0, 0.75, 0.25)", fill: "forwards" },
    )
    .finished.catch(() => undefined)
    .then(() => el.remove());
}

export function QuoteMachine() {
  const library = useLibrary();
  const trash = useTrash();

  const [category, setCategory] = useState<CategoryChoice>("random");
  const [current, setCurrent] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(true); // until the first quote boots up
  const [revealKey, setRevealKey] = useState(0);
  const [glitching, setGlitching] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [noise, setNoise] = useState(false);
  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [shredStatus, setShredStatus] = useState<ShredderStatus>("ready");
  const [shredding, setShredding] = useState(false);
  const [freshTrashId, setFreshTrashId] = useState<string>();
  const [emptying, setEmptying] = useState(false);
  const [released, setReleased] = useState<Particle[]>([]);
  const [hearts, setHearts] = useState(0);
  const [pulse, setPulse] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [emptiedNotice, setEmptiedNotice] = useState(false);
  const [binAlert, setBinAlert] = useState(0);
  const [copied, setCopied] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mouthRef = useRef<HTMLDivElement>(null);
  const binRef = useRef<HTMLDivElement>(null);
  const shelfRef = useRef<HTMLButtonElement>(null);
  const statusTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Synchronous lock: state updates are async, so rapid double clicks could otherwise slip through.
  const lock = useRef(true);
  // One shuffled deck per category, so quotes don't repeat until the deck runs out.
  const decks = useRef(new Map<CategoryChoice, string[]>());
  // Shredded quotes stay out of rotation for this visit.
  const shredded = useRef(new Set<string>());

  const liked = current ? library.includes(current.id) : false;
  const binFull = trash.length >= BIN_CAPACITY;
  const number = current ? QUOTES.indexOf(current) + 1 : undefined;
  const accent = current ? CATEGORY_META[current.category].color : "var(--cyan)";

  function acquire() {
    if (lock.current) return false;
    lock.current = true;
    setBusy(true);
    return true;
  }
  function release() {
    lock.current = false;
    setBusy(false);
  }

  function draw(choice: CategoryChoice, avoidId?: string): Quote {
    let pool = quotesFor(choice).filter((q) => !shredded.current.has(q.id));
    if (pool.length === 0) {
      // Everything in this category was shredded: start fresh.
      for (const q of quotesFor(choice)) shredded.current.delete(q.id);
      pool = quotesFor(choice);
    }
    const ids = new Set(pool.map((q) => q.id));
    let deck = (decks.current.get(choice) ?? []).filter((id) => ids.has(id));
    if (deck.length === 0) {
      deck = shuffle([...ids]);
      // Don't start a fresh deck with the quote that's on screen.
      if (deck.length > 1 && deck[deck.length - 1] === avoidId) {
        [deck[0], deck[deck.length - 1]] = [deck[deck.length - 1], deck[0]];
      }
    }
    const id = deck.pop()!;
    decks.current.set(choice, deck);
    return QUOTES_BY_ID.get(id)!;
  }

  /** Shows a quote with the CRT reveal, then unlocks the controls. */
  async function reveal(next: Quote) {
    setCurrent(next);
    setCopied(false);
    setRevealKey((k) => k + 1);
    setHidden(false);
    sfx.typing(typingMs(next.text.length));
    await wait(380);
    release();
  }

  // Boot: power the screen on and tune in a random quote.
  const boot = useEffectEvent(() => {
    void reveal(draw("random"));
  });
  useEffect(() => {
    const t = setTimeout(boot, reducedMotion() ? 0 : 450);
    return () => clearTimeout(t);
  }, []);

  /* ---------- Actions ---------- */

  async function changeChannel(choice: CategoryChoice) {
    sfx.stopTyping();
    setNoise(true);
    await wait(200);
    setNoise(false);
    await reveal(draw(choice, current?.id));
  }

  function chooseCategory(value: string) {
    const choice = value as CategoryChoice;
    if (choice === category || !acquire()) return;
    sfx.select();
    setCategory(choice);
    void changeChannel(choice);
  }

  function next() {
    if (!acquire()) return;
    sfx.next();
    void changeChannel(category);
  }

  /** Copies the quote on screen. Doesn't need the action lock: it never changes the screen. */
  async function copyQuote() {
    if (!current) return;
    if (await writeClipboard(quoteToText(current))) {
      sfx.copy();
      setCopied(true);
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 1600);
    } else {
      toast("Couldn't copy. Your browser blocked the clipboard.");
    }
  }

  /** Like toggles: saving beams the quote to the library and turns the button pink. */
  async function toggleLike() {
    if (!current || !acquire()) return;

    if (liked) {
      removeFromLibrary(current.id);
      sfx.click();
      toast("Removed from your library");
      release();
      return;
    }

    if (!addToLibrary(current.id)) {
      toast("Couldn't save. Your browser is blocking storage.");
      release();
      return;
    }
    sfx.like();
    setHearts((h) => h + 1);
    const content = contentRef.current;
    const shelf = shelfRef.current;
    if (content && shelf) {
      await beamToShelf(content.getBoundingClientRect(), shelf.getBoundingClientRect(), accent);
    }
    setPulse((p) => p + 1);
    release();
  }

  function buildFragments(): { list: Fragment[]; total: number } {
    const stage = stageRef.current?.getBoundingClientRect();
    const box = contentRef.current?.getBoundingClientRect();
    const mouth = mouthRef.current?.getBoundingClientRect();
    if (!stage || !box || !mouth) return { list: [], total: 0 };

    const cell = Math.max(14, Math.round(Math.sqrt((box.width * box.height) / 170)));
    const cols = Math.floor(box.width / cell);
    const rows = Math.floor(box.height / cell);
    const ox = box.left - stage.left + (box.width - cols * cell) / 2;
    const oy = box.top - stage.top + (box.height - rows * cell) / 2;
    // Only white and the quote's own category colour.
    const palette = ["var(--phosphor)", accent, accent];

    const list: Fragment[] = [];
    let total = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() < 0.3) continue;
        const size = cell - 2;
        const x = ox + c * cell;
        const y = oy + r * cell;
        const tx = mouth.left - stage.left + 8 + Math.random() * (mouth.width - 16) - size / 2;
        const ty = mouth.top - stage.top + mouth.height / 2 - size / 2;
        const delay = (rows - 1 - r) * 24 + Math.random() * 90;
        const duration = 620 + Math.random() * 200;
        total = Math.max(total, delay + duration);
        list.push({
          id: list.length,
          x,
          y,
          size,
          color: palette[Math.floor(Math.random() * palette.length)],
          dx: tx - x,
          dy: ty - y,
          jx: (Math.random() - 0.5) * 18,
          rot: Math.round((Math.random() - 0.5) * 4) * 90,
          delay,
          duration,
        });
      }
    }
    return { list, total };
  }

  async function trashQuote() {
    if (!current) return;
    if (binFull) {
      sfx.warning();
      setBinAlert((n) => n + 1);
      toast("Trash bin is full. Empty it to keep shredding.");
      return;
    }
    if (!acquire()) return;
    sfx.stopTyping();
    const quote = current;
    setShredding(true);
    shredded.current.add(quote.id);
    clearTimeout(statusTimer.current);

    if (!reducedMotion()) {
      // 1. Glitch.
      setGlitching(true);
      await wait(360);
      // 2. Shatter into pixels that fall into the shredder.
      const { list, total } = buildFragments();
      setFragments(list);
      setHidden(true);
      setGlitching(false);
      await wait(260);
      // 3. Shredder chews; the scraps land in the bin.
      setShredStatus("shredding");
      sfx.shred(Math.min(1.2, Math.max(0.6, (total - 260 + 120) / 1000)));
      await wait(Math.max(0, total - 260) + 120);
      setFragments([]);
    } else {
      sfx.shred(0.5);
    }

    // Will this quote fill the last slot in the bin?
    const fillsBin = trash.length + 1 >= BIN_CAPACITY;
    if (addToTrash(quote.id, quote.category)) setFreshTrashId(quote.id);
    setShredStatus("done");
    setShredding(false);
    await reveal(draw(category, quote.id));
    if (fillsBin) {
      sfx.warning();
      setBinAlert((n) => n + 1);
    }
    statusTimer.current = setTimeout(() => setShredStatus("ready"), 900);
  }

  /** Turns every fragment in the bin into a particle that floats up and away. */
  function buildRelease(): { list: Particle[]; total: number } {
    const els = binRef.current?.querySelectorAll<HTMLElement>("[data-frag]") ?? [];
    const rise = Math.min(window.innerHeight * 0.75, 560);
    const list: Particle[] = [];
    let total = 0;
    els.forEach((el) => {
      const r = el.getBoundingClientRect();
      const color = getComputedStyle(el).backgroundColor;
      const delay = Math.random() * 520;
      const duration = 1100 + Math.random() * 700;
      total = Math.max(total, delay + duration);
      list.push({
        id: list.length,
        x: r.left,
        y: r.top,
        size: r.width,
        color,
        dx: (Math.random() - 0.5) * 240,
        dy: -(rise * (0.45 + Math.random() * 0.55)),
        jx: (Math.random() - 0.5) * 14,
        delay,
        duration,
        trail: Math.random() < 0.6 ? 10 + Math.random() * 18 : 0,
        spark: false,
      });
      // A sprinkle of tiny twinkling sparks rides along.
      if (Math.random() < 0.22) {
        const sparkDelay = delay + 120;
        const sparkDuration = duration + 400;
        total = Math.max(total, sparkDelay + sparkDuration);
        list.push({
          id: list.length,
          x: r.left + r.width / 2,
          y: r.top,
          size: 2,
          color: "#e8ecff",
          dx: (Math.random() - 0.5) * 320,
          dy: -(rise * (0.7 + Math.random() * 0.4)),
          jx: 0,
          delay: sparkDelay,
          duration: sparkDuration,
          trail: 0,
          spark: true,
        });
      }
    });
    return { list, total };
  }

  async function empty() {
    if (trash.length === 0 || !acquire()) return;
    setEmptying(true); // lid swings open
    sfx.lidOpen();
    if (!reducedMotion()) {
      await wait(320);
      const { list, total } = buildRelease();
      setReleased(list);
      sfx.release(Math.min(2.4, Math.max(1.2, total / 1000)));
      await wait(total + 60);
      setReleased([]);
    }
    // Only now, with every fragment gone, does the bin reset.
    emptyTrash();
    setEmptying(false);
    setFreshTrashId(undefined);
    sfx.emptied();
    setEmptiedNotice(true);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setEmptiedNotice(false), 1800);
    release();
  }

  /* ---------- Render ---------- */

  return (
    <>
      <NavBar
        libraryIds={library}
        pulse={pulse}
        onOpenLibrary={() => {
          sfx.click();
          setLibraryOpen(true);
        }}
        shelfRef={shelfRef}
      />

      {/* Fills the viewport below the nav (56px bar + 2px edge)
          and centres the controls, display and shredder as one group. */}
      <div className="mx-auto flex min-h-[calc(100svh-58px)] w-full max-w-[56rem] flex-col gap-4 px-4 py-3 sm:gap-5 sm:px-8">
        <main className="flex flex-1 flex-col justify-center gap-4">
          {/* The page title for screen readers; the visible logo lives in the nav. */}
          <h1 className="sr-only">Pixel Quotes: an 8-bit random quote generator</h1>
          {/* Category */}
          <div className="flex flex-col gap-2.5 px-1.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-4">
              <Label htmlFor="channel" className="text-[8px] text-muted-foreground">
                Channel
              </Label>
              <Select value={category} onValueChange={chooseCategory} disabled={busy}>
                <SelectTrigger
                  id="channel"
                  className="h-9 w-full bg-card text-[9px] sm:h-10 sm:w-60"
                >
                  <SelectValue />
                </SelectTrigger>
                {/* Popper positioning: always open below the trigger, at its width. */}
                <SelectContent position="popper" side="bottom" align="start" sideOffset={10}>
                  {CHOICES.map((c) => {
                    const meta = CATEGORY_META[c];
                    return (
                      <SelectItem key={c} value={c} className="gap-3 py-2.5 text-[9px]">
                        <span style={{ color: meta.color }}>
                          <PixelIcon name={meta.icon} className="size-auto h-3.5" />
                        </span>
                        {meta.label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <p className="hidden text-base text-muted-foreground sm:block">
              {QUOTES.length} quotes · {CATEGORIES.length} categories
            </p>
          </div>

          {/* Stage: display (with controls) + shredder */}
          <section ref={stageRef} aria-label="Quote display" className="relative isolate">
            <DisplayScreen
              quote={current}
              channel={category}
              number={number}
              total={QUOTES.length}
              liked={liked}
              revealKey={revealKey}
              glitching={glitching}
              hidden={hidden}
              noise={noise}
              contentRef={contentRef}
              onCopy={copyQuote}
              copied={copied}
              actions={
                <div className="grid grid-cols-[1fr_1.35fr_1fr] items-center gap-4 px-1.5 sm:flex sm:justify-center sm:gap-6">
                  <Button
                    onClick={toggleLike}
                    disabled={busy || !current}
                    aria-pressed={liked}
                    aria-label={liked ? "Saved. Remove from library" : "Like and save to library"}
                    className={cn(
                      "h-9 w-full gap-1.5 px-1 text-[8px] text-ink transition-[background-color,filter,transform] hover:-translate-y-0.5 sm:w-28 sm:gap-2 sm:text-[9px]",
                      liked
                        ? "bg-pink shadow-[0_0_14px_var(--pink)] hover:bg-pink hover:brightness-110"
                        : "bg-foreground hover:bg-white",
                    )}
                  >
                    <PixelIcon name="heart" className={cn("h-3.5", !liked && "text-pink")} />
                    {liked ? "Saved" : "Like"}
                  </Button>
                  <Button
                    onClick={next}
                    disabled={busy}
                    className="h-12 w-full gap-2 px-2 text-[10px] shadow-[0_0_18px_rgb(46_230_255_/_0.35)] transition-[filter,transform] hover:-translate-y-0.5 hover:bg-primary hover:brightness-115 sm:w-44 sm:gap-3 sm:text-xs"
                  >
                    <PixelIcon name="next" className="h-4" />
                    Next
                  </Button>
                  <Button
                    onClick={trashQuote}
                    disabled={busy || !current}
                    // Still clickable when the bin is full, so it can sound the warning.
                    aria-disabled={binFull || undefined}
                    aria-label={binFull ? "Trash bin is full. Empty it first" : "Trash this quote"}
                    className={cn(
                      "h-9 w-full gap-1.5 px-1 text-[8px] transition-[background-color,color,transform] hover:-translate-y-0.5 sm:w-28 sm:gap-2 sm:text-[9px]",
                      shredding
                        ? "bg-destructive text-white shadow-[0_0_14px_var(--destructive)] hover:bg-destructive disabled:opacity-100"
                        : binFull
                          ? "cursor-not-allowed bg-foreground text-ink opacity-50 hover:translate-y-0 hover:bg-foreground"
                          : "bg-foreground text-ink hover:bg-white",
                    )}
                  >
                    <PixelIcon name="trash" className="h-3.5" />
                    Trash
                  </Button>
                </div>
              }
            />

            <Shredder
              status={shredStatus}
              accent={accent}
              items={trash}
              freshId={freshTrashId}
              emptying={emptying}
              releasing={released.length > 0}
              notice={emptiedNotice}
              alert={binAlert}
              canEmpty={!busy}
              onEmpty={empty}
              mouthRef={mouthRef}
              binRef={binRef}
            />

            {/* Falling pixel fragments */}
            {fragments.length > 0 && (
              <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
                {fragments.map((f) => (
                  <span
                    key={f.id}
                    className="absolute block"
                    style={
                      {
                        left: f.x,
                        top: f.y,
                        width: f.size,
                        height: f.size,
                        backgroundColor: f.color,
                        boxShadow: `0 0 6px ${f.color}`,
                        "--dx": `${f.dx}px`,
                        "--dy": `${f.dy}px`,
                        "--jx": `${f.jx}px`,
                        "--rot": `${f.rot}deg`,
                        animation: `frag-fall ${f.duration}ms cubic-bezier(0.45, 0, 0.95, 0.6) ${f.delay}ms both`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>
            )}

            {/* Hearts that pop when liking */}
            {hearts > 0 && (
              <div
                key={hearts}
                className="pointer-events-none absolute inset-x-0 top-[32%] z-40 flex justify-center"
                aria-hidden="true"
              >
                {[-110, -55, 0, 55, 110, -25, 25].map((dx, i) => (
                  <span
                    key={i}
                    className="absolute text-pink drop-shadow-[0_0_6px_var(--pink)]"
                    style={
                      {
                        fontSize: 14 + (i % 3) * 6,
                        "--dx": `${dx}px`,
                        "--dy": `${-90 - (i % 3) * 30}px`,
                        animation: `heart-float 0.7s cubic-bezier(0.2, 0.7, 0.4, 1) ${i * 0.04}s both`,
                      } as React.CSSProperties
                    }
                  >
                    <PixelIcon name="heart" />
                  </span>
                ))}
              </div>
            )}

            {/* Screen readers hear each new quote once. */}
            <p className="sr-only" aria-live="polite">
              {current && !hidden ? `${current.text} — ${current.author}` : ""}
            </p>
          </section>
        </main>

        <p className="text-center text-base text-muted-foreground [@media(max-height:959px)]:hidden">
          Like saves to your library · Trash feeds the shredder · everything stays in this browser
        </p>

        <LibrarySheet
          open={libraryOpen}
          onOpenChange={(open) => {
            sfx.click();
            setLibraryOpen(open);
          }}
          ids={library}
        />
      </div>

      {/* Emptied fragments floating up into the sky */}
      {released.length > 0 && (
        <div className="pointer-events-none fixed inset-0 z-[55]" aria-hidden="true">
          {released.map((p) => (
            <span
              key={p.id}
              className={p.spark ? "release-spark" : "release-particle"}
              data-trail={p.trail > 0 ? "" : undefined}
              style={
                {
                  left: p.x,
                  top: p.y,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 ${p.spark ? 6 : 8}px ${p.color}`,
                  "--c": p.color,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  "--jx": `${p.jx}px`,
                  "--trail": `${p.trail}px`,
                  "--dur": `${p.duration}ms`,
                  "--delay": `${p.delay}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
