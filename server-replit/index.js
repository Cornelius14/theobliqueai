import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());                 // allow all origins for demo
app.use(express.json({ limit: "1mb" }));

app.post("/parseBuyBox", async (req, res) => {
  try {
    const text = (req.body?.text || "").toString().slice(0, 4000);
    if (!text) return res.status(400).json({ error: "Missing text" });

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        response_format: { type: "json_object" },
        temperature: 0.1,
        messages: [
          { role: "system", content: "You convert natural-language real-estate mandates into a strict JSON object. Only output JSON matching the schema. No prose." },
          { role: "user", content:
`Schema:
{
 "intent": "acquisition|lease|refinance|title|null",
 "asset_type": "industrial|warehouse|multifamily|retail|land|data center|single-family|null",
 "market": {"city": string|null, "state": string|null, "metro": string|null},
 "size_range_sf": {"min": number|null, "max": number|null} | null,
 "units_range": {"min": number|null, "max": number|null} | null,
 "price_cap_band": {"psf_min": number|null, "psf_max": number|null, "cap_min": number|null, "cap_max": number|null, "per_door_max": number|null, "budget_min": number|null, "budget_max": number|null} | null,
 "build_year": {"after": number|null, "before": number|null} | null,
 "owner_age_min": number|null,
 "timing": {"months_to_event": number|null} | null,
 "flags": {"loan_maturing": boolean, "owner_age_65_plus": boolean, "off_market": boolean}
}
Text:
${text}` }
        ]
      })
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: "LLM error", detail });
    }
    const data = await r.json();
    const raw = data?.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return res.status(200).json(parsed);
  } catch (e) {
    return res.status(422).json({ error: "Parse failure", detail: String(e?.message || e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Parse API on :${PORT}`));