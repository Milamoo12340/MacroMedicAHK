import { FormEvent, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Activity, Lock, User, Mail, Crown, ArrowRight, ShieldCheck } from "lucide-react";
import { listAccounts, loginStaff, registerStaff, useCurrentUser } from "@/lib/auth";
import { seedDemoData } from "@/lib/mockData";
import { StorageKeys, saveJSON } from "@/lib/storage";
import { DEFAULT_AI_CONFIG } from "@/lib/ai";
import { DEFAULT_DISCORD_CONFIG } from "@/lib/discord";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useCurrentUser();

  const [isFirstRun, setIsFirstRun] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const accounts = listAccounts();
    const first = accounts.length === 0;
    setIsFirstRun(first);
    setMode(first ? "signup" : "login");
  }, []);

  if (user) {
    const from = (location.state as { from?: string } | null)?.from || "/dashboard";
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const account = await registerStaff({
          username: username.trim(),
          displayName: displayName.trim() || username.trim(),
          email: email.trim(),
          password,
          role: isFirstRun ? "owner" : "staff",
        });
        await loginStaff(account.username, password);

        if (isFirstRun) {
          // Seed defaults — user can clear demo data later from Settings.
          seedDemoData();
          saveJSON(StorageKeys.appMode, "demo");
          saveJSON(StorageKeys.aiConfig, DEFAULT_AI_CONFIG);
          saveJSON(StorageKeys.discordConfig, DEFAULT_DISCORD_CONFIG);
          saveJSON(StorageKeys.bootstrapped, true);
          toast.success(`Owner account created. Welcome, ${account.displayName}.`);
        } else {
          toast.success(`Account created for ${account.displayName}`);
        }
        navigate("/dashboard", { replace: true });
      } else {
        const account = await loginStaff(username.trim(), password);
        toast.success(`Welcome back, ${account.displayName}`);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-md bg-primary/15 border border-primary/40 flex items-center justify-center glow-primary">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="font-mono text-lg font-semibold tracking-tight">MacroMedic</div>
            <div className="font-mono text-[11px] text-muted-foreground">
              v1.0 • discord ticket resolver
            </div>
          </div>
        </div>

        <div className="card-surface p-6 md:p-7 relative overflow-hidden">
          <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />

          <div className="relative">
            <div className="font-mono text-[11px] tracking-widest uppercase text-primary mb-1.5">
              {isFirstRun ? "FIRST RUN" : mode === "login" ? "STAFF LOGIN" : "NEW ACCOUNT"}
            </div>
            <h1 className="text-xl font-semibold leading-tight">
              {isFirstRun
                ? "Create your owner account"
                : mode === "login"
                  ? "Sign in to the dashboard"
                  : "Add a new staff member"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {isFirstRun
                ? "Your credentials are stored locally on this device. No cloud, no email required."
                : "Username and password are saved on this device only."}
            </p>

            {isFirstRun && (
              <div className="mt-4 flex items-start gap-2.5 p-3 rounded-md border border-primary/30 bg-primary/5 text-xs text-primary">
                <Crown className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Owner account</div>
                  <div className="text-muted-foreground mt-0.5">
                    The first account becomes the owner with full access to staff management,
                    Discord integration, AI provider, and data resets.
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
              <Field icon={User} label="Username">
                <input
                  className="input-base font-mono"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </Field>

              {mode === "signup" && (
                <>
                  <Field icon={ShieldCheck} label="Display name (optional)">
                    <input
                      className="input-base"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </Field>
                  <Field icon={Mail} label="Email (optional, for your records)">
                    <input
                      type="email"
                      className="input-base"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                </>
              )}

              <Field icon={Lock} label="Password">
                <input
                  type="password"
                  className="input-base font-mono"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={4}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>

              <button
                type="submit"
                disabled={busy}
                className="btn-primary w-full mt-2 disabled:opacity-50"
              >
                {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {!isFirstRun && (
              <div className="mt-5 text-center text-xs text-muted-foreground">
                {mode === "login" ? (
                  <>
                    No account?{" "}
                    <button
                      onClick={() => setMode("signup")}
                      className="text-primary hover:underline"
                    >
                      Create staff account
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    Back to sign in
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-center text-[11px] font-mono text-muted-foreground">
          Open-source • all data stored on your device
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] uppercase font-mono tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {children}
    </div>
  );
}
