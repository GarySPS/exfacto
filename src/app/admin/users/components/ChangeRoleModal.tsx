//src/app/admin/users/components/ChangeRoleModal.tsx

import { X } from "lucide-react";
import type { Profile } from "@/types/profile";

export default function ChangeRoleModal({
  user,
  currentUserRole,
  fallbackName,
  roleValue,
  actionLoading,
  onRoleChange,
  onClose,
  onSubmit,
}: {
  user: Profile;
  currentUserRole: string;
  fallbackName: string;
  roleValue: string;
  actionLoading: boolean;
  onRoleChange: (val: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-[#0a0a0a] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="text-lg font-black text-white">Change User Role</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/50 transition hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <p className="mb-4 text-sm font-semibold text-slate-400">
            Updating role for:{" "}
            <span className="font-black text-white">
              {user.display_name || user.phone || fallbackName}
            </span>
          </p>

          <select
            value={roleValue}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm font-bold text-white outline-none focus:border-purple-500/50"
          >
            <option value="user">Normal User</option>
            <option value="support">Support</option>
            {currentUserRole === "admin" && (
              <option value="leader">Leader</option>
            )}
          </select>
        </div>

        <div className="flex gap-3 border-t border-white/10 bg-white/5 px-5 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-white/10 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={actionLoading}
            className="flex-1 rounded-xl bg-purple-600 py-3 text-sm font-black text-white transition hover:bg-purple-500 disabled:opacity-50"
          >
            {actionLoading ? "Saving..." : "Save Role"}
          </button>
        </div>
      </div>
    </div>
  );
}