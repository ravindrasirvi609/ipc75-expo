import { getSupabaseAdmin } from "@/lib/supabase-admin";

/** True when the request carries a Supabase session for an address in ADMIN_EMAILS. */
export async function isOrganiser(request: Request): Promise<boolean> {
  const token = request.headers
    .get("authorization")
    ?.replace(/^Bearer\s+/i, "");
  if (!token) return false;
  const { data } = await getSupabaseAdmin().auth.getUser(token);
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(
    data.user?.email && allowed.includes(data.user.email.toLowerCase()),
  );
}
