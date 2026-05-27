import { FormEvent, useState } from "react";
import { Plus, Shield, Trash2, KeyRound, Save, UserCog, Crown, Mail } from "lucide-react";
import SectionHeader from "@/components/features/SectionHeader";
import EmptyState from "@/components/features/EmptyState";
import { useStore, StorageKeys } from "@/lib/storage";
import {
  registerStaff,
  updatePassword,
  updateAccount,
  deleteAccount,
  useCurrentUser,
} from "@/lib/auth";
import type { StaffAccount, StaffRole } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function StaffAccounts() {
  const me = useCurrentUser();
  const [accounts] = useStore<StaffAccount[]>(StorageKeys.staffAccounts, []);
  const [showAdd, setShowAdd] = useState(false);
  const canManage = me?.role === "owner" || me?.role === "admin";

  return (
    <div className="space-y-8">
      <SectionHeader
        kicker="ADMIN"
        title="Staff accounts"
        subtitle="All credentials are stored locally on this device. Add the staff who can sign in to this dashboard."
        actions={
          canManage && (
            <button onClick={() => setShowAdd((v) => !v)} className="btn-primary">
              <Plus className="w-4 h-4" />
              {showAdd ? "Close form" : "Add staff"}
            </button>
          )
        }
      />

      {showAdd && canManage && <AddForm onDone={() => setShowAdd(false)} />}

      {accounts.length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No staff accounts yet"
          description="The owner account will appear here after first sign-in."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              isMe={me?.id === a.id}
              canManage={canManage}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("staff");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await registerStaff({ username, displayName, email, password, role });
      toast.success(`${username} added`);
      setUsername("");
      setDisplayName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      onDone();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add staff");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="card-surface p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <Field label="Username">
        <input
          required
          className="input-base font-mono"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </Field>
      <Field label="Display name">
        <input
          className="input-base"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </Field>
      <Field label="Email (optional)">
        <input
          type="email"
          className="input-base"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          required
          minLength={4}
          className="input-base font-mono"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Field label="Role">
        <select
          className="input-base"
          value={role}
          onChange={(e) => setRole(e.target.value as StaffRole)}
        >
          <option value="staff">Staff (handle tickets)</option>
          <option value="admin">Admin (manage settings)</option>
          <option value="owner">Owner (full control)</option>
        </select>
      </Field>
      <div className="md:col-span-2 flex gap-2 justify-end">
        <button type="button" onClick={onDone} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? "Saving…" : "Create account"}
        </button>
      </div>
    </form>
  );
}

function AccountCard({
  account,
  isMe,
  canManage,
}: {
  account: StaffAccount;
  isMe: boolean;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(account.displayName);
  const [email, setEmail] = useState(account.email ?? "");
  const [role, setRole] = useState<StaffRole>(account.role);
  const [newPassword, setNewPassword] = useState("");

  const save = async () => {
    updateAccount(account.id, { displayName, email, role });
    if (newPassword) {
      try {
        await updatePassword(account.id, newPassword);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Password not updated");
        return;
      }
      setNewPassword("");
    }
    setEditing(false);
    toast.success("Account updated");
  };

  const remove = () => {
    if (account.role === "owner") {
      toast.error("Owner account cannot be deleted");
      return;
    }
    if (!confirm(`Delete ${account.username}? They will lose access immediately.`)) return;
    deleteAccount(account.id);
    toast.success("Staff account deleted");
  };

  return (
    <div className="card-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "w-11 h-11 rounded-md border flex items-center justify-center font-mono font-semibold shrink-0",
              account.role === "owner"
                ? "bg-primary/10 border-primary/40 text-primary"
                : account.role === "admin"
                  ? "bg-accent/10 border-accent/40 text-accent"
                  : "bg-secondary border-border text-muted-foreground",
            )}
          >
            {account.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="font-semibold truncate">{account.displayName}</div>
              {isMe && <span className="chip chip-primary">you</span>}
              {account.role === "owner" && (
                <span className="chip chip-accent">
                  <Crown className="w-3 h-3" />
                  owner
                </span>
              )}
              {account.role === "admin" && (
                <span className="chip chip-accent">
                  <Shield className="w-3 h-3" />
                  admin
                </span>
              )}
              {account.role === "staff" && <span className="chip">staff</span>}
            </div>
            <div className="text-xs font-mono text-muted-foreground mt-0.5 truncate">
              @{account.username}
            </div>
            {account.email && (
              <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {account.email}
              </div>
            )}
          </div>
        </div>
        {canManage && !editing && (
          <div className="flex gap-1 shrink-0">
            <button onClick={() => setEditing(true)} className="btn-ghost h-8 px-2">
              <KeyRound className="w-3.5 h-3.5" />
            </button>
            {account.role !== "owner" && (
              <button onClick={remove} className="btn-ghost h-8 px-2 hover:text-destructive">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {editing && (
        <div className="mt-4 space-y-3 border-t border-border pt-4">
          <Field label="Display name">
            <input
              className="input-base"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </Field>
          <Field label="Email">
            <input
              className="input-base"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          {account.role !== "owner" && (
            <Field label="Role">
              <select
                className="input-base"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
          )}
          <Field label="New password (leave blank to keep current)">
            <input
              type="password"
              className="input-base font-mono"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={save} className="btn-primary">
              <Save className="w-4 h-4" />
              Save changes
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border text-[11px] font-mono text-muted-foreground flex items-center justify-between">
        <span>Created {new Date(account.createdAt).toLocaleDateString()}</span>
        {account.lastLogin && (
          <span>Last login {new Date(account.lastLogin).toLocaleString()}</span>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground mb-1.5 block">
        {label}
      </label>
      {children}
    </div>
  );
}
