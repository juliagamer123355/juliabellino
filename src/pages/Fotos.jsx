import { useEffect, useState } from "react";
import { supabase, supabaseEnabled } from "../lib/supabase";
import { EVENT, PHOTOS_UNLOCK_DATE } from "../lib/config";
import { downloadPhotosAsZip } from "../lib/exportUtils";
import SuitIcon from "../components/SuitIcon";

const BUCKET = "fotos-festa";

export default function Fotos() {
  const unlocked = Date.now() >= new Date(PHOTOS_UNLOCK_DATE).getTime();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(unlocked);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    if (!unlocked || !supabaseEnabled) return;
    (async () => {
      const { data, error } = await supabase.storage.from(BUCKET).list("", {
        sortBy: { column: "created_at", order: "desc" },
      });
      if (!error && data) {
        const list = data
          .filter((f) => !f.name.startsWith("."))
          .map((f) => ({
            name: f.name,
            url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl,
          }));
        setPhotos(list);
      }
      setLoading(false);
    })();
  }, [unlocked]);

  function toggleSelecting() {
    setSelecting((prev) => !prev);
    setSelected(new Set());
  }

  function togglePhoto(name) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(photos.map((p) => p.name)));
  }

  async function handleDownloadSelected() {
    const items = photos.filter((p) => selected.has(p.name));
    if (items.length === 0) return;
    setZipping(true);
    setZipProgress({ done: 0, total: items.length });
    try {
      await downloadPhotosAsZip(items, "fotos-selecionadas.zip", (done, total) =>
        setZipProgress({ done, total }),
      );
    } catch (err) {
      alert("Não foi possível gerar o zip: " + err.message);
    } finally {
      setZipping(false);
    }
  }

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

          {!loading && photos.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={toggleSelecting}
                className="tracked-label rounded border border-gold/40 px-4 py-2 text-gold hover:bg-gold/10"
              >
                {selecting ? "Cancelar seleção" : "Selecionar fotos"}
              </button>
              {selecting && (
                <>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="tracked-label rounded border border-gold/40 px-4 py-2 text-gold hover:bg-gold/10"
                  >
                    Selecionar todas
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSelected}
                    disabled={selected.size === 0 || zipping}
                    className="tracked-label rounded bg-gold px-4 py-2 text-ink hover:opacity-90 disabled:opacity-50"
                  >
                    {zipping
                      ? `Baixando ${zipProgress.done}/${zipProgress.total}...`
                      : `Baixar selecionadas (${selected.size}) (.zip)`}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => {
              const isSelected = selected.has(photo.name);
              return (
                <button
                  key={photo.name}
                  type="button"
                  onClick={() => (selecting ? togglePhoto(photo.name) : window.open(photo.url, "_blank"))}
                  className={`group relative aspect-square overflow-hidden rounded-lg border bg-panel text-left ${
                    isSelected ? "border-gold" : "border-gold/15"
                  }`}
                >
                  <img
                    src={photo.url}
                    alt=""
                    className={`h-full w-full object-cover transition-opacity ${
                      selecting && isSelected ? "opacity-70" : ""
                    }`}
                    loading="lazy"
                  />
                  {selecting && (
                    <span
                      className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full border text-sm ${
                        isSelected
                          ? "border-gold bg-gold text-ink"
                          : "border-cream/60 bg-ink/60 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
