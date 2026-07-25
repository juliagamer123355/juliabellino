import crypto from "node:crypto";

// Limitador de tentativas simples em memória (por instância do serverless function).
// Não é perfeito contra atacante distribuído, mas barra brute-force ingênuo/automatizado.
const attempts = new Map(); // ip -> { count, firstAttempt }
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// Comparação em tempo constante pra não vazar a senha por diferença de tempo de resposta.
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a ?? ""));
  const bufB = Buffer.from(String(b ?? ""));
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA);
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

// Retorna true se autenticado; já escreve a resposta de erro (401/429) e retorna false caso contrário.
export function verifyAdminPassword(req, res) {
  const ip = getIp(req);
  const now = Date.now();
  const entry = attempts.get(ip);

  if (entry && now - entry.firstAttempt < WINDOW_MS && entry.count >= MAX_ATTEMPTS) {
    const retryAfterSeconds = Math.ceil((entry.firstAttempt + WINDOW_MS - now) / 1000);
    res.status(429).json({ error: `Muitas tentativas. Tente novamente em ${retryAfterSeconds}s.` });
    return false;
  }

  const password = req.body?.password;
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected || !safeEqual(password, expected)) {
    if (!entry || now - entry.firstAttempt >= WINDOW_MS) {
      attempts.set(ip, { count: 1, firstAttempt: now });
    } else {
      entry.count += 1;
    }
    res.status(401).json({ error: "Senha incorreta" });
    return false;
  }

  attempts.delete(ip);
  return true;
}
