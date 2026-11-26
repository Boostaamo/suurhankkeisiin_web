import { rss, syoteKohde, syotePolut } from "@/lib/syote";

export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => syotePolut().map((polku) => ({ polku }));

export async function GET(_: Request, { params }: { params: Promise<{ polku?: string[] }> }) {
  const k = syoteKohde((await params).polku ?? []);
  if (!k) return new Response("Ei löytynyt", { status: 404 });
  return new Response(rss(k), { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
