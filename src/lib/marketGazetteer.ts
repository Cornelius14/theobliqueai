type Market = { city?: string|null; state?: string|null; metro?: string|null; country?: string|null };

const METROS: Record<string, {city: string, state: string, metro: string}> = {
  boston: { city: "Boston", state: "MA", metro: "Boston–Cambridge" },
  dallas: { city: "Dallas", state: "TX", metro: "Dallas–Fort Worth" },
  miami: { city: "Miami", state: "FL", metro: "Miami–Fort Lauderdale" },
  atlanta: { city: "Atlanta", state: "GA", metro: "Atlanta–Sandy Springs" },
  phoenix: { city: "Phoenix", state: "AZ", metro: "Phoenix–Mesa" },
  nashville: { city: "Nashville", state: "TN", metro: "Nashville–Davidson" },
  houston: { city: "Houston", state: "TX", metro: "Houston–The Woodlands" },
  chicago: { city: "Chicago", state: "IL", metro: "Chicago–Naperville" },
  seattle: { city: "Seattle", state: "WA", metro: "Seattle–Tacoma" },
  la: { city: "Los Angeles", state: "CA", metro: "Los Angeles–Long Beach" },
  "los angeles": { city: "Los Angeles", state: "CA", metro: "Los Angeles–Long Beach" },
  austin: { city: "Austin", state: "TX", metro: "Austin–Round Rock" },
  denver: { city: "Denver", state: "CO", metro: "Denver–Aurora" },
};

export function resolveMarket(text: string): Market|null {
  const t = (text||"").toLowerCase();

  // explicit "in/near/around <city> (area)"
  let m = t.match(/\b(?:in|near|around)\s+([a-z][a-z\s'-]{2,})(?:\s+area)?\b[,.;]?/);
  if (!m) m = t.match(/\b([a-z][a-z\s'-]{2,})\s+area\b[,.;]?/);

  if (m) {
    const key = m[1].trim();
    const exact = (key in METROS) ? key : Object.keys(METROS).find(x => key.includes(x));
    if (exact) return METROS[exact];
  }

  // comma/period split fallback
  for (const chunk of t.split(/[,\.;]/)) {
    const k = Object.keys(METROS).find(x => chunk.includes(x));
    if (k) return METROS[k];
  }

  const k = Object.keys(METROS).find(x => t.includes(x));
  return k ? METROS[k] : null;
}