import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";

import { EditorShell } from "@/components/editor/EditorShell";
import { NoAccess } from "@/components/NoAccess";
import { SetupNotice } from "@/components/SetupNotice";
import { authorizeCompanyAccess } from "@/lib/db/authz";
import { getJobs, getSections } from "@/lib/db/queries";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getSiteUrl } from "@/lib/utils/url";

export const metadata: Metadata = {
  title: "Careers page builder",
  robots: { index: false, follow: false },
};

export default async function EditPage({
  params,
}: {
  params: Promise<{ companySlug: string }>;
}) {
  if (!isSupabaseConfigured()) return <SetupNotice />;

  const { companySlug } = await params;
  const access = await authorizeCompanyAccess(companySlug);

  if (access.status === "unauthenticated") {
    redirect(`/login?next=/${companySlug}/edit`);
  }
  if (access.status === "not-found") notFound();
  if (access.status === "forbidden") return <NoAccess slug={companySlug} />;

  const { company } = access;
  const [sections, jobs, siteUrl] = await Promise.all([
    getSections(company.id, { visibleOnly: false }),
    getJobs(company.id, { publishedOnly: true }),
    getSiteUrl(),
  ]);

  return (
    <EditorShell
      company={company}
      sections={sections}
      jobs={jobs}
      publicUrl={`${siteUrl}/${company.slug}/careers`}
    />
  );
}
