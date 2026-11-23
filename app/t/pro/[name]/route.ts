import { readFile } from "node:fs/promises";

import { TEMPLATES_LAUNCH } from "@/components/application/site/templates";
import { limited } from "@/lib/server/dodo";
import { licenseForKey } from "@/lib/server/licenses";

/**
 * Pro templates: GET /t/pro/<slug>.tgz with `Authorization: Bearer <licence key>`. Same gate as the Pro
 * registry; the tarballs are built into registry-pro/templates/ and never sit in public/.
 */
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (!TEMPLATES_LAUNCH.open) return Response.json({ error: `Templates launch ${TEMPLATES_LAUNCH.date}.` }, { status: 404 });
  if (limited("templates", request, 30)) return Response.json({ error: "Too many requests." }, { status: 429 });
  const key = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!(await licenseForKey(key))) return Response.json({ error: "A valid Panelo Pro licence key is required." }, { status: 401 });
  // Slugs only; anything else (dots, slashes) never reaches the filesystem.
  const name = (await params).name.replace(/\.tgz$/, "");
  if (!/^[a-z0-9-]+$/.test(name)) return Response.json({ error: "Not found." }, { status: 404 });
  const body = await readFile(`${process.cwd()}/registry-pro/templates/${name}.tgz`).catch(() => null);
  return body
    ? new Response(body, { headers: { "Content-Type": "application/gzip", "Content-Disposition": `attachment; filename="${name}.tgz"`, "Cache-Control": "private, no-store" } })
    : Response.json({ error: "Not found." }, { status: 404 });
}
