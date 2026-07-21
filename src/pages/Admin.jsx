import { useState } from "react";
import SuitIcon from "../components/SuitIcon";

const CONFIRM_LABEL = {
  sim: "Sim, estará lá",
  nao: "Não poderá ir",
  talvez: "Ainda não sabe",
};

export default function Admin() {
  const [password, setPassword] = useState("");
  const [rsvps, setRsvps] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Erro ao entrar");
      setRsvps(body.rsvps);
      setStatus("idle");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  }

  if (!rsvps) {
    return (
      <section className="flex min-h-[100svh] flex-col items-center justify-center bg-ink px-6 text-center">
        <SuitIcon suit="spade" className="mb-6 h-10 w-10 text-gold" />
        <h1 className="font-display text-3xl text-cream">Área restrita</h1>
        <form onSubmit={handleLogin} className="mt-8 w-full max-w-xs space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full rounded border border-gold/20 bg-panel px-4 py-3 text-lg text-cream outline-none focus:border-gold"
            required
          />
          {errorMsg && <p className="text-base text-red-400">{errorMsg}</p>}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded bg-gold py-3 text-lg font-medium text-ink disabled:opacity-60"
          >
            {status === "loading" ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    );
  }

  const total = rsvps.length;
  const confirmados = rsvps.filter((r) => r.confirmado === "sim").length;

  return (
    <section className="bg-ink px-6 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-32 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display text-3xl text-cream">Lista de Convidados</h1>
        <p className="mt-2 text-lg text-cream/70">
          {confirmados} confirmados de {total} respostas
        </p>

        <div className="mt-8 overflow-x-auto rounded-xl border border-gold/15">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-panel text-muted">
              <tr className="tracked-label text-xs">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Observação</th>
                <th className="px-4 py-3">Presença</th>
                <th className="px-4 py-3">Foto</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map((r) => (
                <tr key={r.id} className="border-t border-gold/10 text-cream/85">
                  <td className="px-4 py-3">{r.nome}</td>
                  <td className="px-4 py-3">{r.telefone || "—"}</td>
                  <td className="px-4 py-3">{r.observacao || "—"}</td>
                  <td className="px-4 py-3">{CONFIRM_LABEL[r.confirmado] || r.confirmado}</td>
                  <td className="px-4 py-3">
                    {r.foto_url ? (
                      <a
                        href={r.foto_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gold underline"
                      >
                        Ver foto
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
              {rsvps.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-cream/60">
                    Nenhuma confirmação ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
