function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const CONFIRM_LABEL = {
  sim: "Sim, estará lá",
  nao: "Não poderá ir",
  talvez: "Ainda não sabe",
};

export function exportRsvpsToCsv(rsvps, filename = "convidados.csv") {
  const header = ["Nome", "Telefone", "Observação", "Presença", "Enviou foto", "Data"];
  const rows = rsvps.map((r) => [
    r.nome,
    r.telefone || "",
    r.observacao || "",
    CONFIRM_LABEL[r.confirmado] || r.confirmado,
    r.foto_url ? "Sim" : "Não",
    new Date(r.created_at).toLocaleString("pt-BR"),
  ]);

  const escapeCell = (cell) => `"${String(cell).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((row) => row.map(escapeCell).join(";")).join("\r\n");

  // ﻿ (BOM) garante acentuação correta ao abrir no Excel.
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  downloadBlob(blob, filename);
}

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, "_").trim() || "arquivo";
}

export async function downloadPhotosAsZip(items, zipFilename, onProgress) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();

  let done = 0;
  for (const item of items) {
    try {
      const res = await fetch(item.url);
      if (!res.ok) throw new Error("falha ao baixar");
      const blob = await res.blob();
      const ext = blob.type.split("/")[1] || "jpg";
      zip.file(`${sanitizeFilename(item.name)}.${ext}`, blob);
    } catch (err) {
      console.error(`Erro ao baixar ${item.name}:`, err);
    }
    done += 1;
    onProgress?.(done, items.length);
  }

  const content = await zip.generateAsync({ type: "blob" });
  downloadBlob(content, zipFilename);
}
