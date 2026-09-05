import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";

import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

import { AppPreviewArt } from "./AppPreviewArt";
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
              "radial-gradient(900px 520px at 15% 10%, rgba(99,91,255,0.5), transparent 62%), radial-gradient(760px 520px at 95% 90%, rgba(56,189,248,0.28), transparent 60%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between gap-10 p-12 text-white xl:p-14">
          <div className="inline-flex items-center gap-2 text-sm font-semibold">
            <Layers className="h-5 w-5" />
            Careers Page Builder
          </div>

          <div className="grid items-center gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            <div>
              <p className="text-3xl leading-tight font-semibold tracking-tight text-balance xl:text-4xl">
                Design. Build. Publish.
                <br />
                Your careers story, amplified.
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/70 xl:text-base">
                Change colours, rewrite your story, reorder sections — then publish a
                careers page candidates can browse from any device.
              </p>
            </div>

            <div className="hidden xl:block">
              <AppPreviewArt />
            </div>
          </div>

          <p className="text-sm text-white/50">Whitecarrot assignment prototype</p>
        </div>
      </aside>
    </div>
  );
}
