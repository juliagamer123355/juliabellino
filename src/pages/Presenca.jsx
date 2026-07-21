import { useState } from "react";
import { supabase, supabaseEnabled } from "../lib/supabase";
import { compressImage } from "../lib/imageCompression";
import { EVENT } from "../lib/config";
import SuitIcon from "../components/SuitIcon";

const initialForm = {
  nome: "",
  telefone: "",
  observacao: "",
  confirmado: "",
};

export default function Presenca() {
  const [form, setForm] = useState(initialForm);
  const [foto, setFoto] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | sending | done | error
  const [errorMsg, setErrorMsg] = useState("");

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nome || !form.confirmado) {
      setErrorMsg("Preencha nome e confirme sua presença.");
      return;
    }
    setErrorMsg("");
    setStatus("sending");

    try {
      if (!supabaseEnabled) {
        throw new Error("Integração com Supabase ainda não configurada.");
      }

      let fotoPath = null;
      if (foto) {
        const compressed = await compressImage(foto);
        const path = `${Date.now()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage
          .from("fotos-presenca")
          .upload(path, compressed);
        if (uploadError) throw uploadError;
        fotoPath = path;
      }

      const { error: insertError } = await supabase.from("rsvps").insert({
        nome: form.nome,
        telefone: form.telefone,
        observacao: form.observacao,
        confirmado: form.confirmado,
        foto_path: fotoPath,
      });
      if (insertError) throw insertError;

      setStatus("done");
      setForm(initialForm);
      setFoto(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Não foi possível enviar. Tente novamente.");
      setStatus("error");
    }
  }

  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-40 lg:px-10">
      <SuitIcon
        suit="spade"
        className="pointer-events-none absolute -left-10 top-24 h-40 w-40 text-gold/10"
      />

      <div className="relative mx-auto max-w-xl text-center">
        <p className="tracked-label mb-3 text-gold">Seu nome na lista VIP</p>
        <div className="mx-auto mb-6 h-px w-16 bg-gold/50" />
        <h1 className="font-display text-4xl text-cream sm:text-5xl">Confirmação de Presença</h1>
        <p className="mt-4 text-xl text-cream/75 sm:text-2xl">
          Confirme sua presença para celebrar esta noite especial ao lado de{" "}
          {EVENT.name.split(" ")[0]}.
        </p>

        {status === "done" ? (
          <div className="mt-12 rounded-xl border border-gold/25 bg-panel px-6 py-12 sm:px-8">
            <SuitIcon suit="heart" className="mx-auto mb-4 h-8 w-8 text-gold" />
            <h2 className="font-display text-2xl text-gold-light">Presença registrada!</h2>
            <p className="mt-3 text-xl text-cream/75">
              Obrigado por confirmar. Nos vemos no Casino Night!
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-12 space-y-6 rounded-xl border border-gold/15 bg-panel px-5 py-8 text-left sm:px-10 sm:py-10"
          >
            <div>
              <label className="tracked-label mb-2 block text-muted">
                Nome completo e acompanhantes
              </label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => updateField("nome", e.target.value)}
                className="w-full rounded border border-gold/20 bg-ink px-4 py-3 text-lg text-cream outline-none focus:border-gold"
                placeholder="Seu nome"
                required
              />
            </div>

            <div>
              <label className="tracked-label mb-2 block text-muted">Telefone</label>
              <input
                type="tel"
                value={form.telefone}
                onChange={(e) => updateField("telefone", e.target.value)}
                className="w-full rounded border border-gold/20 bg-ink px-4 py-3 text-lg text-cream outline-none focus:border-gold"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="tracked-label mb-2 block text-muted">
                Observação (crianças e idades)
              </label>
              <textarea
                value={form.observacao}
                onChange={(e) => updateField("observacao", e.target.value)}
                rows={3}
                className="w-full resize-none rounded border border-gold/20 bg-ink px-4 py-3 text-lg text-cream outline-none focus:border-gold"
              />
            </div>

            <div>
              <label className="tracked-label mb-2 block text-muted">
                Foto com a aniversariante (opcional)
              </label>
              <p className="mb-2 text-base text-cream/60">
                Se você tiver uma foto com {EVENT.name.split(" ")[0]}, envie aqui — ela quer
                imprimir depois.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                className="w-full rounded border border-gold/20 bg-ink px-4 py-3 text-base text-cream outline-none file:mr-4 file:rounded file:border-0 file:bg-gold file:px-4 file:py-2 file:text-ink"
              />
            </div>

            <div>
              <label className="tracked-label mb-2 block text-muted">Confirmo presença</label>
              <select
                value={form.confirmado}
                onChange={(e) => updateField("confirmado", e.target.value)}
                className="w-full rounded border border-gold/20 bg-ink px-4 py-3 text-lg text-cream outline-none focus:border-gold"
                required
              >
                <option value="" disabled>
                  Selecione uma opção
                </option>
                <option value="sim">Sim, estarei lá!</option>
                <option value="nao">Não poderei ir</option>
                <option value="talvez">Ainda não sei</option>
              </select>
            </div>

            {errorMsg && <p className="text-base text-red-400">{errorMsg}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded bg-gold py-4 text-lg font-medium tracking-wide text-ink transition-transform hover:scale-[1.01] disabled:opacity-60"
            >
              {status === "sending" ? "Enviando..." : "Confirmar presença"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
