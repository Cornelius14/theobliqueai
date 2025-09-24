import { UniversalIntent, mapIntentFromText } from "./taxonomy";
import { resolveMarket } from "./marketGazetteer";

export type { UniversalIntent };

export type UniversalParsed = {
  intent: UniversalIntent;
  role: "buy_side"|"sell_side"|"borrower"|"lender"|"tenant"|"landlord"|"sponsor"|"investor"|"other";
  asset_type?: string|null;
  market?: { city?: string|null; state?: string|null; metro?: string|null; country?: string|null }|null;
  units?: { min?: number|null; max?: number|null }|null;
  size_sf?: { min?: number|null; max?: number|null }|null;
  acres?: { min?: number|null; max?: number|null }|null;
  budget?: { min?: number|null; max?: number|null }|null;
  cap_rate?: { min?: number|null; max?: number|null }|null;
  psf?: { min?: number|null; max?: number|null }|null;
  build_year?: { after?: number|null; before?: number|null }|null;
  timing?: { months_to_event?: number|null }|null;
  constraints?: string[];
  red_flags?: string[];
  keywords?: string[];
  confidence?: Record<string, number>;
  missing_reasons?: Record<string, string>;
};

const toNum = (v:any)=> (typeof v==='number' && isFinite(v)) ? v : null;

export function normalizeUniversal(raw:any, original:string): UniversalParsed {
  const text = String(original||"");
  // 1) intent: pick the MORE SPECIFIC of (LLM intent vs text-mapped intent)
  const llmIntent = (raw?.intent||"").toString() as UniversalIntent;
  const textIntent = mapIntentFromText(text);
  const intent: UniversalIntent =
    (llmIntent === "lease_agreement" && textIntent === "lease_surrender") ? "lease_surrender"
    : (textIntent !== "other" ? textIntent : (llmIntent || "other"));

  // 2) market: prefer LLM, else resolve "city area / near city"
  const market = raw?.market ?? resolveMarket(text) ?? null;

  // 3) units/size ranges (15–20 units, 20k–40k sf, etc.)
  const u = /(\d{1,3})\s*[-–]\s*(\d{1,3})\s*units?/i.exec(text);
  const s = /(\d{1,3}(?:,\d{3})?)(?:\s*(?:k|K))?\s*[-–]\s*(\d{1,3}(?:,\d{3})?)(?:\s*(?:k|K))?\s*(?:sf|sq\s*ft)/i.exec(text);
  const units = raw?.units ?? (u ? { min: +u[1], max: +u[2] } : null);
  const size_sf = raw?.size_range_sf ?? (s ? {
    min: +(s[1].replace(/,/g,"") + (/\bk\b/i.test(s[0]) ? "000" : "")),
    max: +(s[2].replace(/,/g,"") + (/\bk\b/i.test(s[0]) ? "000" : "")),
  } : null);

  // 4) role inference
  let role: UniversalParsed["role"] = "other";
  const tl = text.toLowerCase();
  if (intent === "lease_surrender") role = "tenant";
  else if (/borrower|refi|refinance/.test(tl)) role = "borrower";
  else if (/lender/.test(tl)) role = "lender";
  else if (/buy|acquire|invest/.test(tl)) role = "buy_side";
  else if (/sell|disposition/.test(tl)) role = "sell_side";
  else if (/tenant/.test(tl)) role = "tenant";
  else if (/landlord|owner/.test(tl)) role = "landlord";

  // 5) asset type (keep LLM if present, else light inference)
  const asset = raw?.asset_type
    ?? (/\bwarehouse|industrial\b/i.test(tl) ? "industrial"
      : /\bmultifamily|apartment\b/i.test(tl) ? "multifamily"
      : /\boffice\b/i.test(tl) ? "office"
      : /\bretail\b/i.test(tl) ? "retail"
      : /\bland\b/i.test(tl) ? "land"
      : null);

  // 6) build reasons / confidence (minimal)
  const missing: Record<string,string> = {};
  if (!market) missing.market = "City/metro not explicit (e.g., 'Boston area')";
  if (!units && !size_sf) missing.size = "Size/units not specified";
  if (!asset) missing.asset_type = "Asset type not explicit";

  return {
    intent,
    role,
    asset_type: asset,
    market,
    units,
    size_sf,
    acres: raw?.acres ?? null,
    budget: raw?.budget ?? raw?.price ?? null,
    cap_rate: raw?.cap_rate ?? null,
    psf: raw?.psf ?? null,
    build_year: raw?.build_year ?? null,
    timing: raw?.timing ?? null,
    constraints: raw?.constraints ?? [],
    red_flags: raw?.red_flags ?? [],
    keywords: raw?.keywords ?? [],
    confidence: raw?.confidence ?? {},
    missing_reasons: missing,
  };
}

export function computeCoverage(parsed: UniversalParsed): number {
  let score = 0;
  
  if (parsed.intent && parsed.intent !== 'other') score += 20;
  if (parsed.asset_type) score += 15;
  if (parsed.market && (parsed.market.city || parsed.market.metro || parsed.market.state)) score += 20;
  if (parsed.size_sf?.min || parsed.size_sf?.max || parsed.units?.min || parsed.units?.max) score += 15;
  if (parsed.budget?.min || parsed.budget?.max || parsed.cap_rate?.min || parsed.psf?.min) score += 15;
  if (parsed.timing?.months_to_event) score += 10;
  if (parsed.role) score += 5;
  
  return Math.min(100, score);
}
