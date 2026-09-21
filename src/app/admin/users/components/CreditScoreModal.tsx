//src>app>admin>users>components>CreditScoreModal.tsx

import { X, Award } from "lucide-react";

export default function CreditScoreModal({
  user,
  fallbackName,
  creditValue,
  actionLoading,
  onCreditChange,
  onClose,
  onSubmit,
}: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0a0a0a] p-6 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-cyan-400" />
            <h3 className="text-lg font-black">Edit Credit Score</h3>
          </div>
          <button onClick={onClose} className="text-white/40 transition hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-5 text-sm text-white/50">
          Updating score for <b className="text-white">{user.display_name || user.phone || fallbackName}</b>
        </p>

        <div className="mb-6">
          <label className="mb-2 block text-xs font-black uppercase tracking-wide text-white/40">
            Credit Score Amount
          </label>
          <input
            type="number"
            value={creditValue}
            onChange={(e) => onCreditChange(Number(e.target.value))}
            className="h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-bold text-white outline-none focus:border-cyan-400/50"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-bold text-white/70 transition hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={actionLoading}
            className="flex-1 rounded-xl bg-cyan-500 py-3 text-sm font-black text-slate-950 transition hover:bg-cyan-400 disabled:opacity-50"
          >
            {actionLoading ? "Saving..." : "Save Score"}
          </button>
        </div>
      </div>
    </div>
  );
}