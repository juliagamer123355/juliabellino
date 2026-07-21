import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import SuitIcon from "../components/SuitIcon";
import CountdownTimer from "../components/CountdownTimer";
import { EVENT } from "../lib/config";
import heroBg from "../assets/hero-bg.png";
import profilePhoto from "../assets/profile-source.png";
import fotoLocal from "../assets/fotoLocal.png";

function SectionLabel({ children }) {
  return (
    <div className="mb-3 flex items-center justify-center gap-3">
      <span className="h-px w-8 bg-gold/50" />
      <span className="tracked-label text-gold">{children}</span>
      <span className="h-px w-8 bg-gold/50" />
    </div>
  );
}

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 50);
  }, [location.hash]);

  return (
    <>
      {/* HERO */}
      <section
        id="inicio"
        className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink pt-20"
      >
        <img
          src={heroBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-left opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
          <p className="tracked-label mb-5 text-gold">Uma celebração exclusiva</p>
          <div className="mb-3 h-px w-16 bg-gold/60" />
          <h1 className="font-display text-5xl font-semibold leading-[1.05] text-gold-light sm:text-7xl lg:text-8xl">
            {EVENT.theme.toUpperCase()}
          </h1>
          <p className="mt-6 font-display text-xl italic text-cream sm:text-3xl">
            {EVENT.name} • {EVENT.age} Anos
          </p>
          <p className="tracked-label mt-6 text-gold-light">{EVENT.dateShort}</p>
          <p className="mt-5 max-w-md text-xl text-cream/80 sm:text-2xl">
            Uma noite de apostas, glamour e celebração.
          </p>
          <Link
            to="/presenca"
            className="mt-10 inline-flex h-14 w-14 items-center justify-center rounded bg-gold text-xl text-ink transition-transform hover:scale-105"
            aria-label="Confirmar presença"
          >
            ↘
          </Link>
        </div>

        <div className="absolute bottom-6 right-6 z-10 flex flex-col items-end gap-2 sm:bottom-8 lg:right-10">
          <SuitIcon suit="heart" className="h-6 w-6 text-gold" />
          <span className="tracked-label text-cream/60">Las Vegas, baby</span>
        </div>
      </section>

      {/* SOBRE */}
      <section id="sobre" className="relative overflow-hidden bg-ink px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="tracked-label mb-3 text-gold">A protagonista da noite</p>
            <div className="mb-6 h-px w-16 bg-gold/50" />
            <h2 className="font-display text-4xl text-cream sm:text-5xl">Minha História</h2>
            <p className="mt-6 max-w-md text-xl leading-relaxed text-cream/75 sm:text-2xl">
              {EVENT.name.split(" ")[0]} chega aos {EVENT.age} anos pronta para viver uma noite
              memorável: cheia de brilho, personalidade e momentos para guardar. Nesta
              celebração, cada convidado faz parte da sua história — e a sorte está lançada
              para uma festa inesquecível.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <SuitIcon
              suit="spade"
              className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 -rotate-12 text-gold/20"
            />
            <div className="relative overflow-hidden rounded-2xl border border-gold/40 shadow-2xl">
              <img src={profilePhoto} alt={EVENT.name} className="w-full object-cover" />
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-burgundy font-display text-sm text-gold-light">
                {EVENT.age}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* EVENTO */}
      <section id="evento" className="bg-ink-2 px-6 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <SectionLabel>Marque em sua agenda</SectionLabel>
          <h2 className="font-display text-4xl text-cream sm:text-5xl">O Evento</h2>

          <div className="mt-12 grid gap-4 sm:mt-14 sm:grid-cols-3">
            {[
              { label: "Data", value: EVENT.dateLabel, icon: "diamond" },
              { label: "Horário", value: EVENT.timeLabel, icon: "club" },
              { label: "Tema", value: EVENT.theme, icon: "heart" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-gold/15 bg-panel px-6 py-9 text-center sm:py-10"
              >
                <SuitIcon suit={item.icon} className="mx-auto mb-4 h-6 w-6 text-gold" />
                <p className="tracked-label mb-2 text-muted">{item.label}</p>
                <p className="font-display text-2xl text-cream">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid overflow-hidden rounded-xl border border-gold/15 text-left lg:grid-cols-2">
            <div className="bg-panel px-6 py-9 sm:px-8 sm:py-10">
              <p className="tracked-label mb-2 text-gold">Localização</p>
              <h3 className="font-display text-2xl text-cream sm:text-3xl">{EVENT.venue}</h3>
              <p className="mt-4 max-w-sm text-lg text-cream/75 sm:text-xl">
                {EVENT.venueDescription}
              </p>
              <a
                href={EVENT.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="tracked-label mt-6 inline-block border-b border-gold pb-1 text-gold hover:text-gold-light"
              >
                Ver endereço e mapa
              </a>
            </div>
            <a
              href={EVENT.mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="group relative flex min-h-[220px] items-center justify-center overflow-hidden"
              aria-label={`Abrir localização de ${EVENT.venue} no mapa`}
            >
              <img
                src={fotoLocal}
                alt={EVENT.venue}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/40 transition-colors group-hover:bg-ink/25" />
              <div className="relative flex flex-col items-center gap-2 text-cream">
                <SuitIcon suit="diamond" className="h-6 w-6 text-gold" />
                <span className="tracked-label rounded bg-ink/60 px-3 py-1">Ver no mapa</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* DRESS CODE */}
      <section
        id="dress-code"
        className="relative overflow-hidden bg-ink px-6 py-16 sm:px-8 sm:py-24 lg:px-10"
      >
        <SuitIcon
          suit="diamond"
          className="pointer-events-none absolute -left-8 top-10 h-32 w-32 text-gold/10"
        />
        <SuitIcon
          suit="club"
          className="pointer-events-none absolute -right-8 bottom-10 h-32 w-32 text-gold/10"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className="tracked-label mb-3 text-gold">Vista-se para jogar</p>
            <div className="mb-6 h-px w-16 bg-gold/50" />
            <h2 className="font-display text-4xl text-cream sm:text-5xl">Dress Code</h2>
            <p className="mt-6 max-w-sm text-xl text-cream/75 sm:text-2xl">
              Escolha sua melhor versão para uma noite em que cada detalhe merece brilhar.
            </p>
          </div>
          <div className="rounded-xl border border-gold/15 bg-panel px-6 py-9 sm:px-8 sm:py-10">
            <p className="text-xl text-cream/85">
              <span className="font-display text-gold-light">Mulheres:</span> traje de gala.
            </p>
            <p className="mt-3 text-xl text-cream/85">
              <span className="font-display text-gold-light">Homens:</span> esporte fino.
            </p>
          </div>
        </div>
      </section>

      {/* SAVE THE DATE */}
      <section className="bg-burgundy px-6 py-16 text-center sm:px-8 sm:py-20 lg:px-10">
        <p className="tracked-label mb-3 text-gold-light/80">A sorte está lançada</p>
        <h2 className="font-display text-4xl text-gold-light sm:text-5xl">Save the Date</h2>
        <p className="mt-3 text-xl text-cream/85 sm:text-2xl">{EVENT.dateLabel}</p>
        <div className="mt-10">
          <CountdownTimer target={EVENT.date} />
        </div>
      </section>

      {/* RSVP TEASER */}
      <section id="presenca" className="bg-ink-2 px-6 py-16 text-center sm:px-8 sm:py-24 lg:px-10">
        <SectionLabel>Seu nome na lista VIP</SectionLabel>
        <h2 className="font-display text-4xl text-cream sm:text-5xl">Confirmação de Presença</h2>
        <p className="mx-auto mt-4 max-w-md text-xl text-cream/75 sm:text-2xl">
          Confirme sua presença para celebrar esta noite especial ao lado de{" "}
          {EVENT.name.split(" ")[0]}.
        </p>
        <Link
          to="/presenca"
          className="mt-10 inline-block rounded bg-gold px-10 py-4 text-lg font-medium tracking-wide text-ink transition-transform hover:scale-105"
        >
          Confirmar presença
        </Link>
      </section>
    </>
  );
}
