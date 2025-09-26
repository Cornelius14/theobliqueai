// src/lib/buildRefinePlan.ts
export type RefineItem = {
  key: "intent" | "market" | "asset_type" | "units" | "size_sf" | "budget";
  title: string;
  message: string;
  examples: string[];
};
export type RefinePlan = { items: RefineItem[] };

const CITY_EX = ["in Boston, MA", "in the Boston metro area", "in Stockholm, Sweden"];
const INTENT_EX = [
  "intent: acquisition",
  "intent: refinance (loan maturing)",
  "intent: ground lease",
  "intent: sale-leaseback",
];
const ASSET_EX = [
  "asset type: multifamily",
  "asset type: industrial (warehouse)",
  "asset type: retail",
  "asset type: land",
];
const UNITS_EX = ["64+ units", "80–100 units", "150+ units"];
const SIZE_EX = ["60,000–120,000 SF", "100k–250k SF", "≥ 75,000 SF"];
const BUDGET_EX = ["budget ≤ $15M", "below $20M", "cap rate ≥ 6%"];

export function buildRefinePlan(parsed: any): RefinePlan {
  const items: RefineItem[] = [];

  if (!parsed?.intent)
    items.push({ key: "intent", title: "Intent", message: "Tell us what you want to do.", examples: INTENT_EX });

  if (!parsed?.market)
    items.push({ key: "market", title: "Market", message: "Add a city/metro the model recognizes.", examples: CITY_EX });

  if (!parsed?.asset_type)
    items.push({ key: "asset_type", title: "Asset Type", message: "Name the property type.", examples: ASSET_EX });

  const hasUnits = !!parsed?.units;
  const hasSF = !!parsed?.size_sf;
  if (!hasUnits && !hasSF) {
    items.push({ key: "units", title: "Size / Units", message: "Give a unit range or square footage.", examples: [...UNITS_EX, ...SIZE_EX] });
  } else if (!hasUnits && parsed?.asset_type === "multifamily") {
    items.push({ key: "units", title: "Units", message: "Add an approximate unit count.", examples: UNITS_EX });
  } else if (!hasSF && parsed?.asset_type && parsed?.asset_type !== "multifamily") {
    items.push({ key: "size_sf", title: "Square Footage", message: "Add an approximate SF range.", examples: SIZE_EX });
  }

  if (!parsed?.budget && !parsed?.cap_rate) {
    items.push({ key: "budget", title: "Budget / Yield", message: "Give a max budget or a cap-rate threshold.", examples: BUDGET_EX });
  }

  return { items };
}