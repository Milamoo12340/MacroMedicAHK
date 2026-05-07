import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 grid-bg">
      <div className="card-surface max-w-md w-full p-8 text-center">
        <div className="w-12 h-12 rounded-lg bg-[hsl(var(--warning))]/10 border border-[hsl(var(--warning))]/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[hsl(var(--warning))]" />
        </div>
        <div className="mt-4 font-mono text-[11px] tracking-widest uppercase text-muted-foreground">404 • Not Found</div>
        <h1 className="text-2xl font-semibold mt-2">This command isn&apos;t registered.</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you&apos;re looking for doesn&apos;t exist in this bot&apos;s config.
        </p>
        <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
