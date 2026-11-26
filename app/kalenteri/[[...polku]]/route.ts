import { kunnat } from "@/lib/alueet";
import { ics } from "@/lib/syote";

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => [{ polku: [] }, ...kunnat().map((k) => ({ polku: [k.maakunta_tunniste, k.tunniste] }))];

export async function GET(_: Request, { params }: { params: Promise<{ polku?: string[] }> }) {
  const c = ics((await params).polku ?? []);
  if (!c) return new Response("Ei löytynyt", { status: 404 });
  return new Response(c, { headers: { "Content-Type": "text/calendar; charset=utf-8" } });
}
