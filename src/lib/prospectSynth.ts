import type { UniversalParsed } from "./normalizeUniversal";

export function synthProspects(parsed: UniversalParsed, seedText: string, count=12) {
  const cards:any[] = [];
  const seed = hash(seedText + "|" + parsed.intent + "|" + (parsed.asset_type||"") + "|" + (parsed.market?.city||parsed.market?.metro||""));
  const rnd = mulberry32(seed);

  for (let i=0;i<count;i++) {
    const base = baseFields(parsed, rnd);
    const withIntent = intentFields(parsed, rnd, base);
    withIntent.channels = channelMix(rnd);    // email/sms/call/vm with green/red mix
    cards.push(withIntent);
  }
  return cards;
}

// --- helpers (succinct) ---
function baseFields(p:UniversalParsed,r:()=>number){
  const city = p.market?.city || p.market?.metro || sample(r, ["Market Core","Eastside","West End","Uptown","South Loop"]);
  const size = p.units?.min ? `${p.units.min}-${p.units.max} units`
             : p.size_sf?.min ? `${fmt(p.size_sf.min)}–${fmt(p.size_sf.max)} SF` : null;
  return { city, size, asset: p.asset_type || "asset", title: "" };
}
function intentFields(p:UniversalParsed, r:()=>number, b:any): any {
  const baseCard = { 
    title: "",
    city: b.city, 
    asset: b.asset, 
    size: b.size, 
    match: [] as string[] 
  };
  
  switch (p.intent) {
    case "lease_surrender":
      return { 
        ...baseCard,
        title: `Lease Surrender — ${b.asset} (${b.city})`,
        surrender_terms: sample(r,["no penalty","1-month penalty","pro-rata TI clawback"])
      };
    case "refinance":
      return { 
        ...baseCard,
        title: `Refi Target — ${b.asset} (${b.city})`,
        loan_maturity_months: pick(r,[3,6,9,12]), 
        rate: pick(r,[5.9,6.3,6.8,7.1]), 
        balance: dollar(r,3_000_000,25_000_000) 
      };
    case "ground_lease":
      return { 
        ...baseCard,
        title: `Ground Lease — ${b.asset} site (${b.city})`,
        term_years: pick(r,[49,66,75,99]), 
        acres: pick(r,[2.3,4.7,7.9]), 
        zoning: sample(r,["M-1","I-2","MU","C-3"]) 
      };
    case "ti_work_letter":
      return { 
        ...baseCard,
        title: `TI / Work Letter — ${b.asset} (${b.city})`,
        allowance_psf: pick(r,[25,35,45,60]), 
        scope: sample(r,["HVAC + storefront","whitebox","spec TI"]) 
      };
    case "construction_draw":
      return { 
        ...baseCard,
        title: `Construction Draw — ${b.asset} (${b.city})`,
        draw_no: pick(r,[3,4,5,6]), 
        approved_pct: pick(r,[72,81,88,93])+"%" 
      };
    case "1031_exchange":
      return { 
        ...baseCard,
        title: `1031 Exchange — ${b.asset} (${b.city})`,
        id_days: 45, 
        exchange_deadline_days: 180 
      };
    default:
      return { 
        ...baseCard,
        title: `${cap(b.asset)} — ${b.city}`
      };
  }
}
function channelMix(r:()=>number){ return [
  { tag:"email", ok: r()>0.35 }, { tag:"sms", ok: r()>0.55 }, { tag:"call", ok: r()>0.6 }, { tag:"vm", ok: r()>0.7 }
];}
function pick<T>(r:()=>number, arr:T[]){ return arr[Math.floor(r()*arr.length)]; }
function sample<T>(r:()=>number, arr:T[]){ return pick(r,arr); }
function mulberry32(a:number){ return function(){ let t=a+=0x6D2B79F5; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return((t^(t>>>14))>>>0)/4294967296; };}
function hash(s:string){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619);} return h>>>0; }
function cap(s:string){ return s ? s[0].toUpperCase()+s.slice(1) : s; }
function fmt(n:number){ return n>=1000 ? `${Math.round(n/1000)}k` : `${n}`; }
function dollar(r:()=>number,min:number,max:number){ const v = Math.round(min + r()*(max-min)); return `$${v.toLocaleString()}`; }