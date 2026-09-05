import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./LoginForm";
import { SetupNotice } from "@/components/SetupNotice";

export const metadata: Metadata = {
  title: "Recruiter sign in · Careers Page Builder",
  description: "Sign in to customise your company's careers page.",
  robots: { index: false, follow: false },
};

// Depends on the request's session cookie.
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { next } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect(next && next.startsWith("/") ? next : "/go");

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <main className="flex flex-col justify-center px-5 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to home
          </Link>

          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">
            Sign in to your workspace
          </h1>
          <p className="mt-2 mb-8 text-sm text-ink-600">
            Manage your company&apos;s branded careers page and open roles.
          </p>

          <LoginForm next={next} />
        </div>
      </main>

      {/* Decorative panel — hidden from assistive tech and from small screens. */}
      <aside
        aria-hidden="true"
        className="relative hidden overflow-hidden bg-ink-900 lg:block"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 500px at 20% 15%, rgba(79,70,229,0.45), transparent 60%), radial-gradient(700px 500px at 90% 85%, rgba(14,165,233,0.35), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-14 text-white">
          <div className="inline-flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-5 w-5" />
            Careers Page Builder
          </div>
          <div className="max-w-md">
            <p className="text-3xl leading-tight font-semibold tracking-tight text-balance">
              Your brand. Your story. Your roles.
            </p>
            <p className="mt-4 text-white/70">
              Change colours, rewrite your story, reorder sections — then publish a
              careers page candidates can browse from any device.
            </p>
          </div>
          <p className="text-sm text-white/50">Whitecarrot assignment prototype</p>
        </div>
      </aside>
    </div>
  );
}
