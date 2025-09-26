// src/lib/parserClient.ts
const PARSER_URL = "https://mandate-parser-brenertomer.replit.app"; // your live Replit

export type Range = { min: number|null; max: number|null };
export type Market = { city: string; state: string|null } | null;

export type Parsed = {
  intent: string|null;
  role: string|null;
  asset: string|null;
  market: Market;
  units: Range|null;
  size_sf: Range|null;
  budget: Range|null;
  cap_rate: Range|null;
  timing: { label: string; min: number|null; max: number|null } | null;
  constraints: string[];
  red_flags: string[];
  confidence: Record<string, number>;
  missing: string[];
  _raw?: { text: string };
};

export async function parseWithLLM(text: string): Promise<Parsed> {
  const res = await fetch(`${PARSER_URL}/parseBuyBox`, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error(`Parser ${res.status}`);
  return await res.json();
}
