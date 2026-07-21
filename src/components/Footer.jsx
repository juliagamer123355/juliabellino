import SuitIcon from "./SuitIcon";
import { EVENT } from "../lib/config";

export default function Footer() {
  return (
    <footer className="border-t border-gold/10 bg-ink px-6 py-8 text-center">
      <p className="tracked-label flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.7rem] text-muted sm:text-sm">
        © {EVENT.name} • {EVENT.theme} • {EVENT.age} Anos
        <SuitIcon suit="spade" className="h-3 w-3 shrink-0 text-gold" />
      </p>
    </footer>
  );
}
