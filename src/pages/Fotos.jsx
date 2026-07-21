import { useEffect, useState } from "react";
import { supabase, supabaseEnabled } from "../lib/supabase";
import { EVENT, PHOTOS_UNLOCK_DATE } from "../lib/config";
import SuitIcon from "../components/SuitIcon";

const BUCKET = "fotos-festa";

export default function Fotos() {
  const unlocked = Date.now() >= new Date(PHOTOS_UNLOCK_DATE).getTime();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(unlocked);

  useEffect(() => {
    if (!unlocked || !supabaseEnabled) return;
    (async () => {
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        sortBy: { column: "created_at", order: "desc" },
      });
      if (!error && data) {
        const urls = data
          .filter((f) => !f.name.startsWith("."))
          .map(
            (f) => supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
          );
        setPhotos(urls);
      }
      setLoading(false);
    })();
  }, [unlocked]);

  if (!unlocked) {
    return (
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-ink px-6 text-center sm:px-8">
        <SuitIcon suit="spade" className="mb-8 h-16 w-16 text-gold/40" />
        <p className="tracked-label mb-3 text-gold">Memórias da noite</p>
        <h1 className="font-display text-4xl text-cream sm:text-5xl">Fotos da Festa</h1>
        <p className="mt-4 max-w-md text-xl text-cream/75 sm:text-2xl">
          Depois da festa, este será o espaço para reunir os momentos mais especiais do{" "}
          {EVENT.theme}. Volte após {EVENT.dateLabel} para conferir!
        </p>
      </section>
    );
  }

  return (
    <section className="bg-ink px-6 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-40 lg:px-10">
      <div className="mx-auto max-w-6xl text-center">
        <p className="tracked-label mb-3 text-gold">Memórias da noite</p>
        <h1 className="font-display text-4xl text-cream sm:text-5xl">Fotos da Festa</h1>
        <p className="mx-auto mt-4 max-w-md text-xl text-cream/75 sm:text-2xl">
          Reviva os melhores momentos do {EVENT.theme}.
        </p>

        <div className="mt-14">
          {loading && <p className="text-lg text-cream/60">Carregando fotos...</p>}
          {!loading && photos.length === 0 && (
            <p className="text-lg text-cream/60">Nenhuma foto publicada ainda.</p>
          )}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((url) => (
              <div
                key={url}
                className="aspect-square overflow-hidden rounded-lg border border-gold/15 bg-panel"
              >
                <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
