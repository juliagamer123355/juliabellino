// Formata progressivamente no padrão brasileiro: DDD + 9 + número, ex: "41 9 1234-5678".
export function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";

  let out = digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 3);
  if (digits.length > 3) out += " " + digits.slice(3, 7);
  if (digits.length > 7) out += "-" + digits.slice(7, 11);
  return out;
}

// Válido = DDD (2) + 9 (celular) + 8 dígitos = 11 dígitos no total.
export function isValidPhone(raw) {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 11 && digits[2] === "9";
}
