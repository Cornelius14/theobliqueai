// src/lib/parserClient.ts
export type ParsedBuyBox = {
  intent?: string;
  role?: string;
  asset?: string;                      // raw from LLM if present
  asset_type?: string;                 // normalized (multifamily, industrial, etc.)
  market?: { city?: string; state?: string|null; metro?: string|null } | null;
  units?: { min?: number|null; max?: number|null } | null;
  size_sf?: { min?: number|null; max?: number|null } | null;
  budget?: { min?: number|null; max?: number|null } | null;     // USD
  cap_rate?: { min?: number|null; max?: number|null } | null;
  timing?: string | null;
  missing?: string[];                  // keys that must be refined (market, size_sf, budget, etc.)
  confidence?: Record<string, number>;
};

const PARSER_URL = "https://mandate-parser-brenertomer.replit.app";

function withTimeout<T>(p: Promise<T>, ms = 12000) {
  return Promise.race([
    p,
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]);
}

export async function parseBuyBox(text: string): Promise<ParsedBuyBox> {
  const res = await withTimeout(fetch(`${PARSER_URL}/parseBuyBox`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    mode: "cors",
    body: JSON.stringify({ text }),
  }));
  if (!res.ok) throw new Error(`LLM parser error: ${res.status}`);
  return await res.json();
}