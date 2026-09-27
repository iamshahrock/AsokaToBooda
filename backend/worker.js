const ALLOWED_ORIGINS = new Set([
  "https://iamshahrock.github.io",
  "http://localhost:8788",
  "http://127.0.0.1:8788"
]);
const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "https://iamshahrock.github.io",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return new Response(JSON.stringify({ error: "Use POST to generate a poster." }), { status: 405, headers: { ...cors, ...JSON_HEADERS } });
    if (!ALLOWED_ORIGINS.has(origin)) return new Response(JSON.stringify({ error: "This website is not authorized to use the poster service." }), { status: 403, headers: { ...cors, ...JSON_HEADERS } });
    if (!env.OPENAI_API_KEY) return new Response(JSON.stringify({ error: "The poster service is not configured yet. Add the OPENAI_API_KEY secret in Cloudflare." }), { status: 503, headers: { ...cors, ...JSON_HEADERS } });

    try {
      const incoming = await request.formData();
      const prompt = incoming.get("prompt");
      if (typeof prompt !== "string" || !prompt.trim() || prompt.length > 12000) {
        return new Response(JSON.stringify({ error: "A poster prompt is required (maximum 12,000 characters)." }), { status: 400, headers: { ...cors, ...JSON_HEADERS } });
      }
      const outgoing = new FormData();
      outgoing.append("model", "gpt-image-2");
      outgoing.append("prompt", prompt);
      outgoing.append("size", "1024x1536");
      outgoing.append("quality", "medium");
      outgoing.append("output_format", "png");
      outgoing.append("n", "1");
      let count = 0;
      for (const value of incoming.getAll("image")) {
        if (!(value instanceof File)) continue;
        if (!["image/png", "image/jpeg", "image/webp"].includes(value.type)) continue;
        if (value.size > 15 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: "Each reference image must be smaller than 15 MB." }), { status: 413, headers: { ...cors, ...JSON_HEADERS } });
        }
        outgoing.append("image[]", value, value.name || `reference-${count + 1}.png`);
        count++;
        if (count >= 8) break;
      }
      if (count === 0) return new Response(JSON.stringify({ error: "Upload your photo and include at least one reference image." }), { status: 400, headers: { ...cors, ...JSON_HEADERS } });

      const response = await fetch("https://api.openai.com/v1/images/edits", {
        method: "POST",
        headers: { "Authorization": `Bearer ${env.OPENAI_API_KEY}` },
        body: outgoing
      });
      const data = await response.json();
      if (!response.ok) {
        const message = data?.error?.message || "OpenAI could not generate the image. Please try again.";
        return new Response(JSON.stringify({ error: message }), { status: response.status >= 500 ? 502 : response.status, headers: { ...cors, ...JSON_HEADERS } });
      }
      const image = data?.data?.[0]?.b64_json;
      if (!image) return new Response(JSON.stringify({ error: "The image service returned no image. Please try again." }), { status: 502, headers: { ...cors, ...JSON_HEADERS } });
      return new Response(JSON.stringify({ image, revised_prompt: data.data[0].revised_prompt || null }), { status: 200, headers: { ...cors, ...JSON_HEADERS, "Cache-Control": "no-store" } });
    } catch (error) {
      return new Response(JSON.stringify({ error: "Poster request failed. Check your connection and try again." }), { status: 500, headers: { ...cors, ...JSON_HEADERS } });
    }
  }
};