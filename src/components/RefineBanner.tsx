// src/components/RefineBanner.tsx
import React from "react";
import type { RefinePlan } from "../lib/buildRefinePlan";

export default function RefineBanner({
  plan,
  onInsert,
}: {
  plan: RefinePlan | null;
  onInsert: (snippet: string) => void;
}) {
  if (!plan || !plan.items.length) return null;

  return (
    <div className="mt-4 rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3">
      <div className="mb-2 font-semibold text-amber-200">Refine your criteria:</div>

      <div className="space-y-3">
        {plan.items.map((it) => (
          <div key={it.key}>
            <div className="text-sm font-medium text-amber-100">{it.title}</div>
            <div className="text-sm text-amber-200/90">{it.message}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {it.examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => onInsert(ex)}
                  className="rounded-md border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 text-xs text-amber-100 hover:bg-amber-300/20"
                >
                  + {ex}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-amber-300/80">
        Tip: click a chip to insert, then press <b>Parse</b> again.
      </div>
    </div>
  );
}