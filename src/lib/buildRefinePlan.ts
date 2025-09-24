export type RefineItem = {
  key: "intent" | "market" | "asset_type" | "units" | "size_sf" | "budget";
  title: string;
  message: string;
  examples: string[];
};

export type RefinePlan = { items: RefineItem[] };

const CITY_EXAMPLES = [
  "in Boston, MA",
  "in the Boston metro area",
  "in Boston city, Massachusetts",
];

const INTENT_EXAMPLES = [
  "intent: acquisition",
  "intent: refinance (loan maturing)",
  "intent: ground lease",
  "intent: sale-leaseback",
];

const ASSET_EXAMPLES = [
  "asset type: multifamily",
  "asset type: industrial (warehouse)",
  "asset type: retail",
  "asset type: land",
];

const UNITS_EXAMPLES = [
  "10–20 units",
  "50–100 units",
  "150+ units",
];

const SIZE_EXAMPLES = [
  "20,000–60,000 SF",
  "100k–250k SF",
  "≥ 75,000 SF",
];

const BUDGET_EXAMPLES = [
  "budget ≤ $15,000,000",
  "below $20M",
  "cap rate ≥ 6%",
];

export function buildRefinePlan(parsed: any): RefinePlan {
  const items: RefineItem[] = [];

  if (!parsed?.intent) {
    items.push({
      key: "intent",
      title: "Intent",
      message: "Tell us what you want to do (acquisition, refinance, JV, ground lease, sale-leaseback…).",
      examples: INTENT_EXAMPLES,
    });
  }

  if (!parsed?.market) {
    items.push({
      key: "market",
      title: "Market",
      message: "Specify city/metro in a clear form the model loves.",
      examples: CITY_EXAMPLES,
    });
  }

  if (!parsed?.asset_type) {
    items.push({
      key: "asset_type",
      title: "Asset Type",
      message: "Name the property type you want.",
      examples: ASSET_EXAMPLES,
    });
  }

  if (!parsed?.units && !parsed?.size_sf) {
    items.push({
      key: "units",
      title: "Size / Units",
      message: "Give either a unit range or square footage.",
      examples: [...UNITS_EXAMPLES, ...SIZE_EXAMPLES],
    });
  } else if (!parsed?.units && parsed?.asset_type === "multifamily") {
    items.push({
      key: "units",
      title: "Units",
      message: "Add an approximate unit count range.",
      examples: UNITS_EXAMPLES,
    });
  } else if (!parsed?.size_sf && parsed?.asset_type !== "multifamily") {
    items.push({
      key: "size_sf",
      title: "Square Footage",
      message: "Add an approximate SF range.",
      examples: SIZE_EXAMPLES,
    });
  }

  if (!parsed?.budget && !parsed?.cap_rate) {
    items.push({
      key: "budget",
      title: "Budget / Yield",
      message: "Give a max budget or a cap-rate threshold.",
      examples: BUDGET_EXAMPLES,
    });
  }

  return { items };
}