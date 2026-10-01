import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const PROMPT = `This is a screenshot of a KakaoTalk attendance vote list (a title line and a grid of participant names).
Extract the text exactly as displayed:
1. First line: the title if visible (for example the date, weekday, venue and time range).
2. Then one participant per line, in the same format shown on screen (for example Jeno/M/1986). Keep truncated names as shown, including the ellipsis.
3. Ignore profile pictures, badges and labels such as "me".
4. If the count line such as "참석 : 13" is visible, include it on its own line after the title.
Output plain text only, with no explanation and no markdown.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  // Only signed-in operators may use this function (the publishable key alone is not enough).
  const auth = req.headers.get("Authorization") ?? "";
  const who = await fetch(`${Deno.env.get("SUPABASE_URL")}/auth/v1/user`, {
    headers: { apikey: Deno.env.get("SUPABASE_ANON_KEY") ?? "", Authorization: auth },
  });
  if (!auth.startsWith("Bearer ") || !who.ok) return json({ error: "unauthorized" }, 401);

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "not_configured" }, 501);

  let body: { images?: { media_type?: string; data?: string }[] };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request" }, 400);
  }
  const images = (body.images ?? []).slice(0, 4).filter((i) => i && i.data && i.data.length < 6_000_000);
  if (!images.length) return json({ error: "no_images" }, 400);

  const model = Deno.env.get("ROSTER_OCR_MODEL") ?? "claude-sonnet-5-5";
  const content = [
    ...images.map((i) => ({
      type: "image",
      source: { type: "base64", media_type: i.media_type === "image/png" ? "image/png" : "image/jpeg", data: i.data },
    })),
    { type: "text", text: PROMPT },
  ];

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 1500, messages: [{ role: "user", content }] }),
  });
  if (!res.ok) {
    const detail = await res.text();
    return json({ error: "upstream", status: res.status, detail: detail.slice(0, 300) }, 502);
  }
  const data = await res.json();
  const text = (data.content ?? []).filter((c: { type: string }) => c.type === "text").map((c: { text: string }) => c.text).join("\n");
  return json({ text });
});
