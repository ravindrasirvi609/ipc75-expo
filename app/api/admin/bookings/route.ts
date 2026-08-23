import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { isStallId } from "@/lib/hall-1c-plan";

async function organiser(request: Request) {
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

export async function GET(request: Request) {
  try {
    if (!(await organiser(request)))
      return Response.json(
        { message: "Organiser access required." },
        { status: 401 },
      );
    const { data, error } = await getSupabaseAdmin()
      .from("stall_bookings")
      .select(
        "stall_id,status,company,contact,email,phone,note,requested_at,updated_at",
      )
      .order("updated_at", { ascending: false });
    if (error) return Response.json({ message: error.message }, { status: 500 });
    return Response.json(
      { bookings: data ?? [] },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { message: "Could not reach the booking system. Try again shortly." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await organiser(request)))
      return Response.json(
        { message: "Organiser access required." },
        { status: 401 },
      );
    const body = await request.json().catch(() => ({}));
    const stallId = typeof body.stallId === "string" ? body.stallId.trim() : "";
    const status =
      body.status === "booked" || body.status === "hold" ? body.status : "";
    if (!isStallId(stallId) || !status)
      return Response.json(
        { message: "Invalid stall or status." },
        { status: 400 },
      );
    const { error } = await getSupabaseAdmin()
      .from("stall_bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("stall_id", stallId);
    if (error) return Response.json({ message: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { message: "Could not reach the booking system. Try again shortly." },
      { status: 503 },
    );
  }
}
