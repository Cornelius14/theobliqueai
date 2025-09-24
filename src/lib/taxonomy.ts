export type UniversalIntent =
  // Transactions / Ownership
  | "acquisition" | "disposition" | "sale_leaseback" | "fee_simple_transfer" | "ground_lease"
  // Leasing (granular)
  | "lease_agreement" | "lease_renewal" | "lease_termination" | "sublease" | "lease_surrender"
  | "ti_work_letter" | "lease_structuring_gross_net" | "percentage_rent" | "rent_escalation"
  | "security_deposit_escrow" | "management_contract" | "service_contract" | "cam_reconciliation"
  // Debt / Equity
  | "mortgage_origination" | "refinance" | "cash_out_refinance" | "mezz_loan"
  | "preferred_equity" | "preferred_equity_conversion" | "equity_raise" | "syndication" | "joint_venture"
  | "seller_financing" | "installment_sale" | "assumption" | "recapitalization"
  // Construction / Development
  | "construction_contract" | "subcontract" | "change_order" | "design_contract"
  | "construction_draw" | "performance_bond" | "payment_bond"
  | "disbursement_requisition" | "construction_loan_closing" | "cost_reimbursement_agreement"
  | "site_improvement_agreement" | "offsite_improvements_agreement"
  | "utility_easement" | "easement_dedication" | "grading_contract" | "sitework_subcontract" | "punchlist_contract"
  // Tax / Exchange / Structuring
  | "1031_exchange" | "tax_credit_equity" | "contribution_agreement" | "option_agreement" | "rofr"
  | "joint_development" | "securitization" | "reconveyance" | "exit_disposition"
  // Default / Restructuring
  | "event_of_default" | "workout_modification" | "deed_in_lieu" | "foreclosure" | "short_sale"
  | "bankruptcy" | "receivership" | "discounted_payoff" | "debt_restructuring" | "liquidation"
  // Fallback
  | "other";

export function mapIntentFromText(text: string): UniversalIntent {
  const t = (text||"").toLowerCase();
  // Highly specific phrases first (so specificity wins)
  if (t.includes("lease surrender") || t.includes("surrender")) return "lease_surrender";
  if (t.includes("sale-leaseback") || t.includes("sale leaseback")) return "sale_leaseback";
  if (t.includes("ground lease") || t.includes("land lease")) return "ground_lease";
  if (t.includes("work letter") || /\bti\b/.test(t)) return "ti_work_letter";
  if (t.includes("construction draw") || t.includes("requisition")) return "construction_draw";
  if (t.includes("1031") || t.includes("like-kind")) return "1031_exchange";
  if (t.includes("mezz")) return "mezz_loan";
  if (t.includes("preferred equity") || t.includes("pref equity")) return "preferred_equity";
  if (t.includes("refi") || t.includes("refinance")) return "refinance";
  if (t.includes("cam")) return "cam_reconciliation";
  if (t.includes("foreclosure")) return "foreclosure";
  if (t.includes("workout") || t.includes("modification")) return "workout_modification";
  if (t.includes("bankruptcy") || t.includes("chapter 11")) return "bankruptcy";
  if (t.includes("rofr") || t.includes("right of first")) return "rofr";
  if (t.includes("option to purchase") || t.includes("option agreement")) return "option_agreement";
  if (t.includes("sublease") || t.includes("assignment")) return "sublease";
  if (t.includes("renewal") || t.includes("extend")) return "lease_renewal";
  if (t.includes("termination") || t.includes("cancel")) return "lease_termination";
  if (t.includes("lease")) return "lease_agreement";
  if (t.includes("buy") || t.includes("purchase") || t.includes("acquire")) return "acquisition";
  if (t.includes("sell") || t.includes("disposition")) return "disposition";
  return "other";
}