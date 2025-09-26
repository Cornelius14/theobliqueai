// src/lib/generateProspects.ts
export type Prospect = {
  title: string;
  subtitle?: string;
  market?: string;
  channels: { email: boolean; sms: boolean; call: boolean; vm: boolean };
  note?: string;
  contact?: { name: string; email: string; phone: string };
};

function hash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); }
  return h >>> 0;
}
function seeded(randSeed: number) {
  let s = randSeed >>> 0;
  return () => { s = (1664525 * s + 1013904223) >>> 0; return s / 0xffffffff; };
}
function pick<T>(rng: () => number, arr: T[]) { return arr[Math.floor(rng() * arr.length)]!; }
function bool(rng: () => number, p = 0.6) { return rng() < p; }

const FIRST = ["Jordan","Taylor","Avery","Riley","Casey","Morgan","Hayden","Parker","Alex","Dana","Rowan","Sasha"];
const LAST  = ["Lee","Patel","Garcia","Kim","Nguyen","Lopez","Diaz","Khan","Cohen","Gonzalez","Singh","Miller"];
const STREETS=["Commerce","Industrial","Market","Broad","Main","Peachtree","Congress","Fifth","Seventh","Union","Hudson","Canal"];

export function generateProspects(parsed: any, original: string, n = 12): {
  prospects: Prospect[]; qualified: Prospect[]; booked: Prospect[];
} {
  const seed = hash(JSON.stringify(parsed) + "|" + original);
  const rng = seeded(seed);

  const city = parsed?.market?.city || "Target City";
  const asset = (parsed?.asset_type || parsed?.asset || "Asset").replace(/_/g, " ");
  const sizeLo = parsed?.size_sf?.min || parsed?.units?.min || null;
  const sizeHi = parsed?.size_sf?.max || parsed?.units?.max || null;

  const make = (): Prospect => {
    const name = `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
    const email = `${name.toLowerCase().replace(/ /g,".")}@example.com`;
    const phone = `(${200+Math.floor(rng()*700)}) ${100+Math.floor(rng()*900)}-${1000+Math.floor(rng()*9000)}`;
    const street = `${Math.floor(rng()*900)+100} ${pick(rng, STREETS)} St`;
    const title = `${asset.charAt(0).toUpperCase()+asset.slice(1)} — ${sizeLo && sizeHi ? `${sizeLo.toLocaleString()}–${sizeHi.toLocaleString()} ${parsed?.units ? "units" : "SF"}` : (sizeLo ? `${sizeLo.toLocaleString()} ${parsed?.units ? "units" : "SF"}+` : "Sized") } (${city})`;

    return {
      title,
      subtitle: street,
      market: city,
      channels: {
        email: bool(rng, 0.75),
        sms: bool(rng, 0.6),
        call: bool(rng, 0.5),
        vm:   bool(rng, 0.55),
      },
      note: `Matches: ${asset}${city ? " • " + city : ""}${sizeLo ? ` • ${sizeLo}${parsed?.units ? " units" : " SF"}+` : ""}`,
      contact: { name, email, phone },
    };
  };

  const all: Prospect[] = Array.from({ length: n }, make);
  return {
    prospects: all.slice(0, Math.max(4, Math.floor(n*0.5))),
    qualified: all.slice(Math.max(4, Math.floor(n*0.5)), Math.max(6, Math.floor(n*0.83))),
    booked:    all.slice(Math.max(6, Math.floor(n*0.83))),
  };
}