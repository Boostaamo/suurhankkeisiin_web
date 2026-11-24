import { hakuindeksi } from "@/lib/haku";

export const dynamic = "force-static";

export function GET() {
  return Response.json(hakuindeksi());
}
