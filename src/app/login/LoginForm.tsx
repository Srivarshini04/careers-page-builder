"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, LogIn, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Primitives";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth/demo";
import { createClient } from "@/lib/supabase/client";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
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

    // `/go` resolves which company this recruiter owns and forwards to its builder.
    router.replace(next && next.startsWith("/") ? next : "/go");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Field label="Work email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </Field>

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
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Sign in
          </>
        )}
      </Button>

      <div className="rounded-lg border border-ink-200 bg-ink-50 p-4">
        <p className="flex items-center gap-1.5 text-sm font-medium text-ink-800">
          <Sparkles aria-hidden="true" className="h-4 w-4 text-ink-500" />
          Demo account
        </p>
        <p className="mt-1 text-sm text-ink-600">
          The form is prefilled with the demo recruiter. Reset it any time.
        </p>
        <dl className="mt-3 space-y-1 font-mono text-xs text-ink-700">
          <div className="flex gap-2">
            <dt className="text-ink-500">email</dt>
            <dd className="truncate">{DEMO_EMAIL}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-ink-500">pass</dt>
            <dd>{DEMO_PASSWORD}</dd>
          </div>
        </dl>
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => {
            setEmail(DEMO_EMAIL);
            setPassword(DEMO_PASSWORD);
            setError(null);
          }}
        >
          Use demo credentials
        </Button>
      </div>
    </form>
  );
}
