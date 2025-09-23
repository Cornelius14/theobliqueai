const PARSER_API = "https://mandate-parser-brenertomer.replit.app/parseBuyBox";

export async function parseBuyBoxRemote(text: string, signal?: AbortSignal) {
  const res = await fetch(PARSER_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    signal,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Parser ${res.status}: ${msg || "request failed"}`);
  }
  return await res.json(); // Parsed JSON from the backend
}