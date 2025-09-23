// Utilities to normalize any LLM output so CRM synthesis is consistent.

export function toNumber(v: any): number|null {
  if (v == null || v === '') return null;
  if (typeof v === 'number') return isFinite(v) ? v : null;
  const s = String(v).trim().toLowerCase().replace(/,/g, '');
  // interpret "k", "thousand", "m"
  const k = /(\d+(\.\d+)?)\s*(k|thousand)\b/.exec(s);
  const m = /(\d+(\.\d+)?)\s*m\b/.exec(s);
  if (k) return Math.round(parseFloat(k[1]) * 1000);
  if (m) return Math.round(parseFloat(m[1]) * 1_000_000);
  const n = Number(s.replace(/[^\d.-]/g, ''));
  return isFinite(n) ? n : null;
}

export function normalizeAssetType(raw: any): string|null {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s.includes('warehouse')) return 'industrial';  // map common synonym
  if (s.includes('sfr')) return 'single-family';
  return s; // allow ANY (self-storage, medical office, data center, etc.)
}

export function normalizeParsed(p: any) {
  const out: any = { ...p };
  out.asset_type = normalizeAssetType(p?.asset_type);

  // size_range_sf normalization (accept strings like "20-30k")
  if (p?.size_range_sf) {
    out.size_range_sf = {
      min: toNumber(p.size_range_sf.min),
      max: toNumber(p.size_range_sf.max)
    };
  }

  if (p?.units_range) {
    out.units_range = {
      min: toNumber(p.units_range.min),
      max: toNumber(p.units_range.max)
    };
  }

  // ensure market object exists with strings/null
  const m = p?.market || {};
  out.market = {
    city: m.city ?? null,
    state: m.state ?? null,
    metro: m.metro ?? null,
    country: m.country ?? null
  };

  // clamp obviously invalid years
  if (p?.build_year) {
    const a = toNumber(p.build_year.after);
    const b = toNumber(p.build_year.before);
    out.build_year = { after: a && a>1800 ? a : null, before: b && b>1800 ? b : null };
  }

  // extra constraints if LLM extracted them
  out.owner_age_min = p?.owner_age_min ?? null;
  out.owner_age_max = p?.owner_age_max ?? null;
  out.ownership_years_min = p?.ownership_years_min ?? null;

  return out;
}

export function coverageScore(parsed: any): number {
  // simple coverage: intent + asset + any market + size or units
  let c = 0;
  if (parsed.intent) c++;
  if (parsed.asset_type) c++;
  if (parsed.market && (parsed.market.city||parsed.market.metro||parsed.market.state||parsed.market.country)) c++;
  if (parsed.size_range_sf?.min || parsed.size_range_sf?.max || parsed.units_range?.min || parsed.units_range?.max) c++;
  if (parsed.build_year?.after || parsed.build_year?.before) c++;
  return Math.round((c/5)*100);
}