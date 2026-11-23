import { QuoteMachine } from "@/components/quotes/quote-machine";

export default function Home() {
  // overflow-clip: the screen glow can extend past the page edges without adding scroll.
  return (
    <div className="flex flex-1 flex-col overflow-clip">
      <QuoteMachine />
    </div>
  );
}
