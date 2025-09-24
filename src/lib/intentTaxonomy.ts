export type UniversalIntent =
  // Transactions / Ownership
  | "acquisition" | "disposition" | "sale_leaseback" | "fee_simple_transfer"
  | "ground_lease"
  // Leasing (core)
  | "lease_agreement" | "lease_renewal" | "lease_termination" | "sublease" | "lease_surrender"
  | "option_to_purchase" | "lease_structuring_gross_net" | "percentage_rent" | "rent_escalation"
  | "security_deposit_escrow" | "ti_work_letter" | "management_contract" | "service_contract"
  | "cam_reconciliation"
  // Debt / Equity
  | "mortgage_origination" | "refinance" | "cash_out_refinance" | "mezz_loan"
  | "preferred_equity" | "preferred_equity_conversion" | "equity_raise" | "syndication" | "joint_venture"
  | "seller_financing" | "installment_sale" | "assumption" | "recapitalization"
  // Construction / Development
  | "construction_contract" | "subcontract" | "change_order" | "design_contract"
  | "construction_draw" | "performance_bond" | "payment_bond"
  | "disbursement_requisition" | "construction_loan_closing"
  | "cost_reimbursement_agreement"
  | "site_improvement_agreement" | "offsite_improvements_agreement"
  | "utility_easement" | "easement_dedication"
  | "grading_contract" | "sitework_subcontract" | "punchlist_contract"
  // Tax / Exchange / Structuring
  | "1031_exchange" | "tax_credit_equity" | "contribution_agreement"
  | "option_agreement" | "rofr" | "joint_development" | "exit_disposition"
  | "securitization" | "reconveyance"
  // Default / Restructuring
  | "event_of_default" | "workout_modification" | "deed_in_lieu" | "foreclosure"
  | "short_sale" | "bankruptcy" | "receivership" | "discounted_payoff"
  | "debt_restructuring" | "liquidation"
  // Fallback
  | "other";

export const INTENT_SYNONYMS: Record<string, UniversalIntent> = {
  // Transactions / Ownership
  "buy": "acquisition", "purchase": "acquisition", "acquire": "acquisition",
  "sell": "disposition", "disposition": "disposition",
  "sale-leaseback": "sale_leaseback", "sale leaseback": "sale_leaseback",
  "fee simple": "fee_simple_transfer",
  "ground lease": "ground_lease", "land lease": "ground_lease",

  // Leasing (core + ops)
  "lease agreement": "lease_agreement", "new lease": "lease_agreement", "lease": "lease_agreement",
  "renewal": "lease_renewal", "extend": "lease_renewal",
  "termination": "lease_termination", "cancel": "lease_termination",
  "sublease": "sublease", "assignment": "sublease",
  "surrender": "lease_surrender",
  "option to purchase": "option_to_purchase", "lease option": "option_to_purchase",
  "gross lease": "lease_structuring_gross_net", "net lease": "lease_structuring_gross_net",
  "percentage rent": "percentage_rent",
  "rent escalation": "rent_escalation", "index clause": "rent_escalation",
  "security deposit": "security_deposit_escrow", "escrow": "security_deposit_escrow",
  "ti allowance": "ti_work_letter", "work letter": "ti_work_letter",
  "property management": "management_contract", "operating contract": "management_contract",
  "service contract": "service_contract", "janitorial": "service_contract", "security": "service_contract",
  "cam": "cam_reconciliation", "common area maintenance": "cam_reconciliation",

  // Debt / Equity
  "mortgage": "mortgage_origination", "loan": "mortgage_origination",
  "refi": "refinance", "refinance": "refinance",
  "cash-out": "cash_out_refinance", "cash out": "cash_out_refinance",
  "mezz": "mezz_loan", "mezzanine": "mezz_loan",
  "preferred equity": "preferred_equity", "pref equity": "preferred_equity",
  "pref conversion": "preferred_equity_conversion", "preferred conversion": "preferred_equity_conversion",
  "equity raise": "equity_raise", "capital raise": "equity_raise",
  "syndication": "syndication",
  "joint venture": "joint_venture", "jv": "joint_venture",
  "seller financing": "seller_financing", "vtb": "seller_financing",
  "installment sale": "installment_sale",
  "assumption": "assumption",
  "recap": "recapitalization", "recapitalization": "recapitalization",

  // Construction / Development
  "construction contract": "construction_contract",
  "subcontract": "subcontract",
  "change order": "change_order",
  "design contract": "design_contract", "architect": "design_contract", "engineering": "design_contract",
  "construction draw": "construction_draw", "draw request": "construction_draw",
  "performance bond": "performance_bond",
  "payment bond": "payment_bond",
  "disbursement": "disbursement_requisition", "requisition": "disbursement_requisition",
  "construction loan closing": "construction_loan_closing",
  "cost reimbursement": "cost_reimbursement_agreement",
  "site improvement": "site_improvement_agreement", "infrastructure agreement": "site_improvement_agreement",
  "offsite improvements": "offsite_improvements_agreement",
  "utility easement": "utility_easement", "easement dedication": "easement_dedication",
  "grading": "grading_contract", "earthwork": "grading_contract",
  "sitework": "sitework_subcontract",
  "punchlist": "punchlist_contract",

  // Tax / Exchange / Structuring
  "1031": "1031_exchange", "like-kind": "1031_exchange",
  "tax credit": "tax_credit_equity", "lihtc": "tax_credit_equity", "historic tax credit": "tax_credit_equity",
  "contribution agreement": "contribution_agreement",
  "option agreement": "option_agreement", "option to buy": "option_agreement",
  "rofr": "rofr", "right of first refusal": "rofr", "right of first offer": "rofr",
  "joint development": "joint_development", "ground partnership": "joint_development",
  "exit": "exit_disposition", "disposition of stabilized": "exit_disposition",
  "securitization": "securitization", "mbs": "securitization",
  "reconveyance": "reconveyance",

  // Default / Restructuring
  "event of default": "event_of_default", "default": "event_of_default",
  "workout": "workout_modification", "modification": "workout_modification",
  "deed in lieu": "deed_in_lieu",
  "foreclosure": "foreclosure",
  "short sale": "short_sale",
  "bankruptcy": "bankruptcy", "chapter 11": "bankruptcy",
  "receivership": "receivership",
  "discounted payoff": "discounted_payoff", "dpo": "discounted_payoff",
  "debt restructuring": "debt_restructuring",
  "liquidation": "liquidation",
};

export function mapIntentFromText(text: string): UniversalIntent {
  const t = (text || "").toLowerCase();
  for (const key of Object.keys(INTENT_SYNONYMS)) {
    if (t.includes(key)) return INTENT_SYNONYMS[key];
  }
  // heuristic fallbacks
  if (t.includes("matur")) return "refinance";
  if (t.includes("leaseback")) return "sale_leaseback";
  if (t.includes("ground")) return "ground_lease";
  return "other";
}