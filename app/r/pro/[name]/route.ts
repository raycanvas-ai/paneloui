import { readFile } from "node:fs/promises";

import { limited } from "@/lib/server/dodo";
import { licenseForKey } from "@/lib/server/licenses";

/**
 * The Pro shadcn registry: GET /r/pro/<item>.json with `Authorization: Bearer <licence key>`.
 * In components.json:
 *   "@panelo-pro": { "url": "https://www.paneloui.com/r/pro/{name}.json",
 *                    "headers": { "Authorization": "Bearer ${PANELO_LICENSE_KEY}" } }
 */
export async function GET(request: Request, { params }: { params: Promise<{ name: string }> }) {
  if (limited("registry", request, 120)) return Response.json({ error: "Too many requests." }, { status: 429 });
  const key = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const license = await licenseForKey(key);
  if (!license) return Response.json({ error: "A valid Panelo Pro licence key is required." }, { status: 401 });
  // Item names are slugs; anything else (dots, slashes) never reaches the filesystem.
  const name = (await params).name.replace(/\.json$/, "");
  if (!/^[a-z0-9-]+$/.test(name)) return Response.json({ error: "Not found." }, { status: 404 });
  // ponytail: reads the built Pro registry from registry-pro/ on disk, which is how `next dev` serves it.
  // The Worker has no disk: production needs these files in a private R2 bucket behind the same check.
  const body = await readFile(`${process.cwd()}/registry-pro/${name}.json`, "utf8").catch(() => null);
  return body ? new Response(body, { headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" } }) : Response.json({ error: "Not found." }, { status: 404 });
}
