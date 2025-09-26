// Lightweight LLM-backed parser API + graceful fallback.
// Deploy anywhere (Replit, Render, etc.). CORS-open for browsers.

import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

// --- CORS for browser calls (Lovable/Vite/Framer/etc.) ---
app.use(cors({ origin: "*", methods: ["GET","POST","OPTIONS"], allowedHeaders: ["Content-Type"] }));
app.options("*", cors());
app.use(express.json({ limit: "1mb" }));

// --- OpenAI client (optional but preferred) ---
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// --- Health ---
app.get("/health", (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  return res.json({ ok: true, model: openai ? MODEL : "fallback" });
});

// --- Helpers (stable JSON shape & normalizers) ---
function isNum(n){ return typeof n==="number" && isFinite(n); }
function coerceInt(x){ const n=parseInt(String(x).replace(/[, ]/g,""),10); return isNum(n)?n:null; }
function coerceMoney(x){
  if (x==null) return null;
  let s=String(x).toLowerCase().replace(/[, ]/g,"");
  let m=s.match(/^(\$)?([\d.]+)(m|b|bn)?$/);
  if(!m) return coerceInt(x);
  let n=parseFloat(m[2]);
  if(m[3]==="m") n*=1e6;
  if(m[3]==="b"||m[3]==="bn") n*=1e9;
  return Math.round(n);
}

// Normalize intent & asset to a small taxonomy so your UI is predictable
function normIntent(i){
  if(!i) return null;
  const s=String(i).toLowerCase();
  if (/(acq|acquire|acquisition|buy|purchase)/.test(s)) return "acquisition";
  if (/(refi|refinanc)/.test(s) || /(loan|debt).*(matur|balloon|coming\s*due)/.test(s)) return "refinance";
  if (/(lease|ground\s*lease|nnn|gross)/.test(s)) return "lease";
  if (/(mezz|mezzanine)/.test(s)) return "mezz";
  if (/(sale[-_\s]?leaseback|slb)/.test(s)) return "sale_leaseback";
  if (/(jv|joint[-_\s]?venture|partnership)/.test(s)) return "joint_venture";
  if (/(pref(ered)?\s*equity)/.test(s)) return "preferred_equity";
  if (/(1031|like[-_\s]?kind)/.test(s)) return "exchange_1031";
  if (/(foreclos|short\s*sale|deed\s*in\s*lieu|reconvey|workout|modif(y|ication)|default|receivership|bankruptcy)/.test(s))
    return "distress_restructuring";
  return "other";
}
function normAsset(a){
  if(!a) return null;
  const s=String(a).toLowerCase();
  if (/(multifamily|apartment|apartments|student\s*housing|senior\s*housing|mobile\s*home)/.test(s)) return "multifamily";
  if (/(industrial|warehouse|flex|cold\s*storage|logistics|distribution|manufactur)/.test(s)) return "industrial";
  if (/(retail|strip|mall|nnn)/.test(s)) return "retail";
  if (/(office|medical|clinic)/.test(s)) return "office";
  if (/(land|parcel|acre)/.test(s)) return "land";
  if (/(hotel|hospitality|resort)/.test(s)) return "hospitality";
  if (/(self[-\s]?storage)/.test(s)) return "self_storage";
  if (/(data\s*center)/.test(s)) return "data_center";
  return "other";
}

// Cheap market pick (city only). You can upgrade to a gazetteer later.
function extractMarket(t){
  const m=t.match(/\b(?:in|near|around)\s+([a-z][a-z\s'.-]{2,})(?:\s+area)?\b[,.;]?/i) ||
          t.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\s+area\b[,.;]?/);
  if (m){
    let city=m[1].trim().replace(/\s+/g," ");
    // Try to split "Boston, MA" if provided
    const cs=city.split(",").map(s=>s.trim());
    if (cs.length>1) return { city: cs[0], state: cs[1] };
    return { city, state: null };
  }
  return null;
}

// Extract numeric hints from the raw text (budget, units, sf, timing)
function extractNumbers(t){
  const out={};
  // units "10–20 units" or "10-20 units"
  let u=t.match(/(\d{1,4})\s*[–-]\s*(\d{1,4})\s*units\b/i);
  if(u) out.units={ min: coerceInt(u[1]), max: coerceInt(u[2]) };

  // size "100k–200k SF" or "75,000 SF"
  let s1=t.match(/(\d[\d,\.]*)\s*(k|m)?\s*[–-]\s*(\d[\d,\.]*)\s*(k|m)?\s*sf\b/i);
  if(s1){
    const a=(s1[2]?.toLowerCase()==="k")?parseFloat(s1[1].replace(/,/g,""))*1e3:
             (s1[2]?.toLowerCase()==="m")?parseFloat(s1[1].replace(/,/g,""))*1e6:
             parseFloat(s1[1].replace(/,/g,""));
    const b=(s1[4]?.toLowerCase()==="k")?parseFloat(s1[3].replace(/,/g,""))*1e3:
             (s1[4]?.toLowerCase()==="m")?parseFloat(s1[3].replace(/,/g,""))*1e6:
             parseFloat(s1[3].replace(/,/g,""));
    out.size_sf={ min: Math.round(a), max: Math.round(b) };
  }else{
    let s2=t.match(/(\d[\d,\.]*)\s*(k|m)?\s*sf\b/i);
    if(s2){
      let v=parseFloat(s2[1].replace(/,/g,""));
      if((s2[2]||"").toLowerCase()==="k") v*=1e3;
      if((s2[2]||"").toLowerCase()==="m") v*=1e6;
      out.size_sf={ min: Math.round(v), max: null };
    }
  }

  // budget "below 15 million", "≤ $20M"
  let b=t.match(/\b(below|under|less\s*than|≤|<)\s*\$?\s*([\d,\.]+)\s*(m|million|bn|b)?\b/i);
  if(b){
    let n=parseFloat(b[2].replace(/,/g,""));
    const scale=(b[3]||"").toLowerCase();
    if(scale==="m"||scale==="million") n*=1e6;
    if(scale==="bn"||scale==="b") n*=1e9;
    out.budget={ min: null, max: Math.round(n) };
  }
  // cap rate "cap >= 6%"
  let c=t.match(/\bcap\s*(?:rate)?\s*(?:>=|≥|>|=)\s*([\d\.]+)\s*%/i);
  if(c) out.cap_rate={ min: parseFloat(c[1]), max: null };

  // timing "maturing in 3-6 months"
  let tm=t.match(/\b(matur|due|closing|closing\s*in)\s*(?:in|within)?\s*(\d{1,2})\s*(months?|mos?)\b/i);
  if(tm) out.timing={ label: "months", min: null, max: parseInt(tm[2],10) };

  return out;
}

// Always return a stable envelope
function makeEnvelope(partial={}, text=""){
  const {
    intent=null, role=null, asset=null, market=null, units=null, size_sf=null,
    budget=null, cap_rate=null, timing=null, constraints=[], red_flags=[],
    confidence={}, missing=[]
  } = partial;

  return {
    intent: normIntent(intent),
    role: role || null,
    asset: normAsset(asset),
    market: market || null,           // {city,state}|null
    units: units || null,             // {min,max}|null
    size_sf: size_sf || null,         // {min,max}|null
    budget: budget || null,           // {min,max}|null
    cap_rate: cap_rate || null,       // {min,max}|null
    timing: timing || null,           // {label,min,max}|null
    constraints,
    red_flags,
    confidence,
    missing,                          // string keys to nudge UI (["market","budget"]…)
    _raw: { text }                    // for debugging only (remove if you prefer)
  };
}

// --- LLM pass (preferred) + regex fallback ---
async function parseTextLLM(text){
  if (!openai) return null;
  const sys = `You extract real-estate "mandates" from natural language into JSON.
Return ONLY a JSON object with keys:
intent, role, asset, market{city,state}, units{min,max}, size_sf{min,max}, budget{min,max}, cap_rate{min,max}, timing{label,min,max}, constraints[], red_flags[], missing[].
- Normalize intent to: acquisition | refinance | lease | mezz | sale_leaseback | joint_venture | preferred_equity | exchange_1031 | distress_restructuring | other.
- Normalize asset to: multifamily | industrial | retail | office | land | hospitality | self_storage | data_center | other.
- market.city is capitalized name (e.g., "Boston"); state can be null.
- numbers are integers in base units (budget in $), not strings.
- If any field is unknown, set null and list its key in missing[].`;

  const u = `Text: """${text}"""`;
  const rsp = await openai.chat.completions.create({
    model: MODEL,
    messages: [
      { role:"system", content: sys },
      { role:"user",   content: u }
    ],
    temperature: 0.1,
    response_format: { type: "json_object" }
  });
  const content = rsp.choices?.[0]?.message?.content || "{}";
  let json;
  try { json = JSON.parse(content); } catch { json = null; }
  return json;
}

function parseTextFallback(text){
  const t = text || "";
  const numbers = extractNumbers(t);
  const market = extractMarket(t);
  let intent = null; // defer to normIntent for synonyms
  let asset = null;  // defer to normAsset
  const missing = [];
  if(!market) missing.push("market");
  if(!numbers.units && !numbers.size_sf) missing.push("size");
  if(!numbers.budget && !numbers.cap_rate) missing.push("money");

  return makeEnvelope({
    intent,
    asset,
    market,
    ...numbers,
    missing
  }, text);
}

app.post("/parseBuyBox", async (req, res) => {
  try {
    const text = (req.body?.text || "").slice(0, 3000);
    if (!text) return res.status(400).json({ error: "Missing text" });

    // 1) Try LLM
    let j = await parseTextLLM(text);

    // 2) If LLM unavailable or bad, use fallback
    if (!j || typeof j !== "object") {
      const fb = parseTextFallback(text);
      return res.json(fb);
    }

    // 3) Wrap LLM result into a stable envelope with normalizers
    const m = j.market?.city ? { city: j.market.city, state: j.market.state ?? null } :
              extractMarket(text);
    const numbers = extractNumbers(text); // merge in case LLM missed any numerics

    const env = makeEnvelope({
      intent: j.intent ?? null,
      role: j.role ?? null,
      asset: j.asset ?? null,
      market: m ?? null,
      units: j.units ?? numbers.units ?? null,
      size_sf: j.size_sf ?? numbers.size_sf ?? null,
      budget: j.budget ?? numbers.budget ?? null,
      cap_rate: j.cap_rate ?? numbers.cap_rate ?? null,
      timing: j.timing ?? numbers.timing ?? null,
      constraints: Array.isArray(j.constraints) ? j.constraints : [],
      red_flags: Array.isArray(j.red_flags) ? j.red_flags : [],
      confidence: typeof j.confidence === "object" && j.confidence ? j.confidence : {},
      missing: Array.isArray(j.missing) ? j.missing : []
    }, text);

    return res.json(env);
  } catch (e) {
    console.error("parseBuyBox error:", e);
    // Hard fail → fallback
    const fb = parseTextFallback(String(req.body?.text||""));
    return res.json(fb);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Parser up on :${PORT}`));
