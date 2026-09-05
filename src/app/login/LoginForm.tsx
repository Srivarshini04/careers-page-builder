"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Building2, Lock, Mail, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Primitives";
import { DEMO_ACCOUNTS } from "@/lib/auth/demo";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError(
        signInError.message === "Invalid login credentials"
          ? "That email and password don't match a recruiter account."
          : signInError.message,
      );
      setStatus("idle");
      return;
    }

    if (next && next.startsWith("/")) {
      router.replace(next);
      return;
    }

    /*
     * Resolve the recruiter's company here rather than bouncing through `/go`, which
     * cost a whole extra server round trip on the slowest moment in the app. This is a
     * single indexed lookup on the session we already hold; `/go` stays as the fallback
     * and is still what "Go to my workspace" links to.
     */
    const ownerId = data.user?.id;
    const { data: company } = ownerId
      ? await supabase
          .from("companies")
          .select("slug")
          .eq("owner_id", ownerId)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle<{ slug: string }>()
      : { data: null };

    router.replace(company ? `/${company.slug}/edit` : "/go");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <FieldWithIcon
        id="email"
        label="Work email"
        icon={Mail}
        type="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
      />

      <FieldWithIcon
        id="password"
        label="Password"
        icon={Lock}
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={setPassword}
      />

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Spinner />
            Signing in…
          </>
        ) : (
          <>
            Sign in
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </Button>

      <div className="rounded-xl border border-ink-200 bg-ink-50 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-800">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-ink-500" />
          Demo accounts
        </p>
        <p className="mt-1 text-sm text-ink-600">
          Each company has its own recruiter — sign in as one and you can&apos;t edit the
          other.
        </p>

        <ul className="mt-3 space-y-2">
          {DEMO_ACCOUNTS.map((account) => {
            const selected = email === account.email;
            return (
              <li key={account.email}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                    setError(null);
                  }}
                  aria-pressed={selected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border bg-white p-3 text-left transition-colors",
                    selected
                      ? "border-ink-900 ring-1 ring-ink-900"
                      : "border-ink-200 hover:border-ink-300",
                  )}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-600">
                    <Building2 aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-ink-900">
                      {account.company}
                    </span>
                    <span className="block truncate font-mono text-xs text-ink-500">
                      {account.email}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-3 font-mono text-xs text-ink-500">
          password: {DEMO_ACCOUNTS[0].password}
        </p>
      </div>
    </form>
  );
}

/** Labelled input with a leading icon — the label stays a real <label>, not a placeholder. */
function FieldWithIcon({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  type,
  autoComplete,
}: {
  id: string;
  label: string;
  icon: typeof Mail;
  value: string;
  onChange: (value: string) => void;
  type: string;
  autoComplete: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-800">
        {label}
      </label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-400"
        />
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={autoComplete}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-ink-200 bg-white pr-3 pl-9 text-sm text-ink-900 transition-colors placeholder:text-ink-400 hover:border-ink-300 focus:border-ink-400"
        />
      </div>
    </div>
  );
}
