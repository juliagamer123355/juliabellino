// Limitador de tentativas simples em memória (por instância do serverless function),
// reutilizável por qualquer rota pública que precise de proteção contra spam/flood.
const buckets = new Map(); // key -> { count, firstAttempt }

export function getIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length > 0) return fwd.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

// Retorna { allowed, retryAfterSeconds }. Cada chamada conta como uma tentativa.
export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (entry && now - entry.firstAttempt < windowMs) {
    if (entry.count >= max) {
      return {
        allowed: false,
        retryAfterSeconds: Math.ceil((entry.firstAttempt + windowMs - now) / 1000),
      };
    }
    entry.count += 1;
    return { allowed: true };
  }

  buckets.set(key, { count: 1, firstAttempt: now });
  return { allowed: true };
}
