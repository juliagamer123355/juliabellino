// Redimensiona e recomprime uma imagem no navegador antes do upload,
// pra render melhor o 1GB grátis de storage do Supabase.
export function compressImage(file, { maxDimension = 1600, quality = 0.75 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
      const width = Math.round(img.width * scale);
      const height = Math.round(img.height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Não foi possível processar a imagem."));
            return;
          }
          const name = file.name.replace(/\.\w+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Não foi possível ler a imagem."));
    };

    img.src = objectUrl;
  });
}
