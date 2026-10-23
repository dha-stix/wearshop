// Bachs payments client (https://docs.bachs.io). Server only: it uses the secret API key.
import "server-only";
import crypto from "node:crypto";

const API_BASE = process.env.BACHS_API_BASE || "https://sandbox-api.bachs.io";
const SIGNATURE_TOLERANCE_SECONDS = 300;

async function bachsRequest(path, { method = "GET", body, idempotencyKey } = {}) {
  const apiKey = process.env.BACHS_API_KEY;
  if (!apiKey) throw new Error("BACHS_API_KEY is missing. Add it to .env.local.");

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.detail || `Bachs request failed (${res.status})`);
    err.status = res.status;
    err.code = data.error_code;
    throw err;
  }
  return data;
}

// Hosted checkout for a fixed amount. Bachs appends ?checkout_id=<id> to successUrl.
export function createCheckoutSession({ orderId, amount, currency, customer, successUrl, cancelUrl }) {
  return bachsRequest("/v1/checkout-sessions", {
    method: "POST",
    idempotencyKey: `order-${orderId}`,
    body: {
      pricing: { currency, amount: Number(amount).toFixed(2) },
      customer,
      success_url: successUrl,
      cancel_url: cancelUrl,
      reference: orderId,
      metadata: { orderId },
      expires_in_minutes: 60,
    },
  });
}

export function getCheckoutSession(checkoutId) {
  return bachsRequest(`/v1/checkout-sessions/${encodeURIComponent(checkoutId)}`);
}

function safeEqual(a, b) {
  const ab = Buffer.from(a || "", "utf8");
  const bb = Buffer.from(b || "", "utf8");
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

// Verifies X-Bachs-Signature-V2 ("t=<ts>,v1=<sig>[,v1=<sig>]") or the legacy
// X-Bachs-Timestamp + X-Bachs-Signature pair: HMAC-SHA256 hex of "{timestamp}.{raw_body}".
export function verifyWebhookSignature(rawBody, headers, secret = process.env.BACHS_WEBHOOK_SECRET) {
  if (!secret) throw new Error("BACHS_WEBHOOK_SECRET is missing.");

  let timestamp = null;
  let signatures = [];
  const v2 = headers.get("x-bachs-signature-v2");
  if (v2) {
    for (const part of v2.split(",")) {
      const [key, value] = part.trim().split("=");
      if (key === "t") timestamp = value;
      if (key === "v1") signatures.push(value);
    }
  } else {
    timestamp = headers.get("x-bachs-timestamp");
    signatures = [headers.get("x-bachs-signature")].filter(Boolean);
  }
  if (!timestamp || !signatures.length) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

  const expected = crypto.createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  return signatures.some((sig) => safeEqual(sig, expected));
}
