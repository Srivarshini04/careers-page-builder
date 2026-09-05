import { redirect } from "next/navigation";

import { getPrimaryCompanyForUser } from "@/lib/db/authz";
import { createClient } from "@/lib/supabase/server";

/**
 * Post-login landing hop: resolves which company the signed-in recruiter owns and
 * forwards to that company's builder. Keeps the slug out of the login form, and gives
 * multi-company support a single place to grow a picker later.
 */
export default async function GoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const company = await getPrimaryCompanyForUser(user.id);
  if (!company) redirect("/login?error=no-company");

  redirect(`/${company.slug}/edit`);
}
