import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LINKS = [
  { to: "/", label: "Início" },
  { to: "/#sobre", label: "Sobre" },
  { to: "/#evento", label: "Evento" },
  { to: "/#dress-code", label: "Dress Code" },
  { to: "/fotos", label: "Fotos" },
  { to: "/presenca", label: "Presença" },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function goTo(to) {
    const [path, hash] = to.split("#");
    const targetPath = path || "/";

    if (!hash) {
      navigate(targetPath);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (location.pathname !== targetPath) {
      navigate(`${targetPath}#${hash}`);
      // Wait for the route to render before scrolling to the section.
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 80);
      return;
    }

    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
    navigate(`${targetPath}#${hash}`, { replace: true });
  }

  function isActive(to) {
    if (to === "/") return location.pathname === "/" && !location.hash;
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      return location.pathname === (path || "/") && location.hash === `#${hash}`;
    }
    return location.pathname === to;
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "bg-ink/95 backdrop-blur border-b border-gold/10" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-10">
        <button
          type="button"
          onClick={() => goTo("/")}
          className="font-display text-2xl tracking-widest text-gold"
        >
          JB
        </button>

        <ul className="hidden items-center gap-7 md:flex lg:gap-9">
          {LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => goTo(link.to)}
                className={`tracked-label transition-colors hover:text-gold ${
                  isActive(link.to) ? "text-gold" : "text-cream/80"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <span
            className={`h-px w-6 bg-gold transition-transform duration-200 ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span className={`h-px w-6 bg-gold transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-px w-6 bg-gold transition-transform duration-200 ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`overflow-hidden border-t border-gold/10 bg-ink transition-[max-height] duration-300 ease-in-out md:hidden ${
          open ? "max-h-96" : "max-h-0 border-t-0"
        }`}
      >
        <ul className="flex flex-col gap-1 px-6 py-4">
          {LINKS.map((link) => (
            <li key={link.label}>
              <button
                type="button"
                onClick={() => goTo(link.to)}
                className={`tracked-label block w-full py-3 text-left ${
                  isActive(link.to) ? "text-gold" : "text-cream/80"
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
