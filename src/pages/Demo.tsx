// src/pages/Demo.tsx
import React, { useState } from "react";
import { parseBuyBox, type ParsedBuyBox } from "../lib/parserClient";
import { buildRefinePlan } from "../lib/buildRefinePlan";
import RefineBanner from "../components/RefineBanner";
import { generateProspects } from "../lib/generateProspects";

function isReadyForCRM(p: ParsedBuyBox | null) {
  if (!p) return false;
  const hasCore = !!p.intent && !!p.market && !!p.asset_type;
  const hasSize = !!p.units || !!p.size_sf;
  const hasMoney = !!p.budget || !!p.cap_rate;
  return hasCore && hasSize && hasMoney;
}

export default function Demo() {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedBuyBox | null>(null);
  const [plan, setPlan] = useState<ReturnType<typeof buildRefinePlan> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<{prospects:any[];qualified:any[];booked:any[]}>({prospects:[],qualified:[],booked:[]});

  async function onParse() {
    setBusy(true);
    setErr(null);
    setPlan(null);
    setParsed(null);
    try {
      const res = await parseBuyBox(text);        // LLM-first
      setParsed(res);
      const rp = buildRefinePlan(res);
      setPlan(rp.items.length ? rp : null);

      // Only generate demo cards if we have the core fields; they must reflect the mandate:
      if (isReadyForCRM(res)) {
        const g = generateProspects(res, text, 12);
        setRows(g);
      } else {
        setRows({prospects:[],qualified:[],booked:[]});
      }
    } catch (e: any) {
      setErr("LLM unavailable. Try again in a moment.");
      setRows({prospects:[],qualified:[],booked:[]});
    } finally {
      setBusy(false);
    }
  }

  function onInsert(snippet: string) {
    setText((prev) => (prev?.trim() ? `${prev.trim()} ${snippet}` : snippet));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-4 text-2xl font-semibold">Deal Finder — Live Demo</h1>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Type any mandate: "Find industrial warehouses in Atlanta; 60k–120k SF; built ≥1980; cap ≥6%", "Multifamily 80–100 units in Austin; loan maturing ≤6 months; budget ≤ $20M", "Construction vendor: owners with recent land permits in Dallas."`}
        className="h-28 w-full rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-neutral-100 outline-none"
      />

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={onParse}
          disabled={busy}
          className="rounded-lg bg-neutral-100 px-4 py-2 text-neutral-900 hover:bg-white disabled:opacity-50"
        >
          {busy ? "Parsing…" : "Parse Criteria"}
        </button>
        {err && <div className="text-sm text-red-300">{err}</div>}
      </div>

      <RefineBanner plan={plan} onInsert={onInsert} />

      {/* Parsed Buy-Box */}
      <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
        <div className="mb-3 text-lg font-medium text-neutral-100">Parsed Buy-Box</div>
        {parsed ? (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-neutral-300">
            <div><b>Intent:</b> {parsed.intent ?? "-"}</div>
            <div><b>Asset Type:</b> {parsed.asset_type ?? parsed.asset ?? "-"}</div>
            <div><b>Market:</b> {parsed.market?.city ? `${parsed.market.city}${parsed.market?.state ? ", " + parsed.market.state : ""}` : "-"}</div>
            <div><b>Units:</b> {parsed.units ? `${parsed.units.min ?? ""}${parsed.units.min?"–":""}${parsed.units.max ?? ""}` : "-"}</div>
            <div><b>Size (SF):</b> {parsed.size_sf ? `${parsed.size_sf.min ?? ""}${parsed.size_sf.min?"–":""}${parsed.size_sf.max ?? ""}` : "-"}</div>
            <div><b>Budget:</b> {parsed.budget?.max ? `≤ $${Number(parsed.budget.max).toLocaleString()}` : (parsed.budget?.min ? `$${Number(parsed.budget.min).toLocaleString()}+` : "-")}</div>
            <div><b>Cap Rate:</b> {parsed.cap_rate?.min ? `≥ ${parsed.cap_rate.min}%` : (parsed.cap_rate?.max ? `≤ ${parsed.cap_rate.max}%` : "-")}</div>
            <div><b>Timing/Notes:</b> {parsed.timing ?? "-"}</div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">Nothing parsed yet.</div>
        )}
      </div>

      {/* Sample pipeline cards (must reflect the mandate) */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div>
          <div className="mb-2 text-sm font-semibold text-neutral-200">Prospected</div>
          <div className="space-y-2">
            {rows.prospects.map((p,i)=>(
              <div key={`p-${i}`} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="text-sm font-medium text-neutral-100">{p.title}</div>
                <div className="text-xs text-neutral-400">{p.subtitle}</div>
                <div className="mt-2 text-xs">
                  <span className={p.channels.email ? "text-green-400" : "text-red-400"}>email</span> ·{" "}
                  <span className={p.channels.sms ? "text-green-400" : "text-red-400"}>sms</span> ·{" "}
                  <span className={p.channels.vm ? "text-green-400" : "text-red-400"}>vm</span> ·{" "}
                  <span className={p.channels.call ? "text-green-400" : "text-red-400"}>call</span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400">{p.contact?.name} — {p.contact?.email} — {p.contact?.phone}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-neutral-200">Qualified Target</div>
          <div className="space-y-2">
            {rows.qualified.map((p,i)=>(
              <div key={`q-${i}`} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="text-sm font-medium text-neutral-100">{p.title}</div>
                <div className="text-xs text-neutral-400">{p.subtitle}</div>
                <div className="mt-2 text-xs">
                  <span className={p.channels.email ? "text-green-400" : "text-red-400"}>email</span> ·{" "}
                  <span className={p.channels.sms ? "text-green-400" : "text-red-400"}>sms</span> ·{" "}
                  <span className={p.channels.vm ? "text-green-400" : "text-red-400"}>vm</span> ·{" "}
                  <span className={p.channels.call ? "text-green-400" : "text-red-400"}>call</span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400">{p.contact?.name} — {p.contact?.email} — {p.contact?.phone}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-neutral-200">Meeting Booked</div>
          <div className="space-y-2">
            {rows.booked.map((p,i)=>(
              <div key={`b-${i}`} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <div className="text-sm font-medium text-neutral-100">{p.title}</div>
                <div className="text-xs text-neutral-400">{p.subtitle}</div>
                <div className="mt-2 text-xs">
                  <span className={p.channels.email ? "text-green-400" : "text-red-400"}>email</span> ·{" "}
                  <span className={p.channels.sms ? "text-green-400" : "text-red-400"}>sms</span> ·{" "}
                  <span className={p.channels.vm ? "text-green-400" : "text-red-400"}>vm</span> ·{" "}
                  <span className={p.channels.call ? "text-green-400" : "text-red-400"}>call</span>
                </div>
                <div className="mt-1 text-[11px] text-neutral-400">{p.contact?.name} — {p.contact?.email} — {p.contact?.phone}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <button
          disabled={!isReadyForCRM(parsed)}
          className={`rounded-lg px-4 py-2 ${isReadyForCRM(parsed) ? "bg-green-500 text-neutral-900 hover:bg-green-400" : "bg-neutral-800 text-neutral-500"}`}
        >
          Send to CRM
        </button>
        {!isReadyForCRM(parsed) && (
          <div className="mt-2 text-xs text-neutral-500">
            Need: intent + market + asset + (units or SF) + (budget or cap). Use the refine chips above.
          </div>
        )}
      </div>
    </div>
  );
}