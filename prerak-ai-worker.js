/**
 * PRERAK AI Worker — Gemini-powered assistant for the website chat-widget
 * and the Sahayak Marketing tool. Both send: { messages:[{role,content}], context, lang }
 * and expect back: { reply: "..." }
 *
 * Setup: Cloudflare dashboard → this Worker → Settings → Variables and Secrets
 *   → Add a SECRET named  GEMINI_API_KEY  (paste the AI Studio key there, not in code).
 */

const ALLOWED_ORIGINS = [
  "https://prerakmultipurpose.com",
  "https://www.prerakmultipurpose.com"
];

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "POST मात्र चाहिन्छ" }), {
        status: 405, headers: { "Content-Type": "application/json", ...cors }
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors }
      });
    }

    const messages = Array.isArray(body.messages) ? body.messages : [];
    const context = typeof body.context === "string" ? body.context : "";
    const lang = body.lang === "en" ? "en" : "ne";
    if (!messages.length) {
      return new Response(JSON.stringify({ error: "messages चाहिन्छ" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors }
      });
    }

    // .trim() defends against a stray trailing newline/space from copy-paste into
    // the Cloudflare secret field — a single invisible character there breaks the
    // outgoing request header and looks like an unrelated 500.
    const apiKey = (env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Server मिसिङ configuration (API key)" }), {
        status: 500, headers: { "Content-Type": "application/json", ...cors }
      });
    }

    // First visitor message (no prior assistant turns) gets a warm greeting opener.
    const isFirstTurn = !messages.some(m => m && m.role === "assistant");
    const greetRule = isFirstTurn
      ? (lang === "ne"
          ? "यो visitor को पहिलो सन्देश हो: जवाफको सुरुमा एक-line न्यानो सम्बोधन गर्नुहोस् — " +
            "\"नमस्ते! 🙏 प्रेरक मल्टिपर्पोजमा स्वागत छ।\" जस्तो — अनि तुरुन्तै उनको प्रश्नको " +
            "विस्तृत जवाफ दिनुहोस्। "
          : "This is the visitor's first message: open with one warm welcome line " +
            "(e.g. \"Namaste! Welcome to Prerak Multipurpose.\") then answer their question in detail. ")
      : "";

    const sys =
      "You are the helpful assistant for Prerak Multipurpose Pvt. Ltd., a construction " +
      "and interior company in Hetauda, Nepal. Services: building construction, interior " +
      "design, UPVC/aluminum windows and doors, gypsum ceiling, plumbing, electrical, " +
      "painting, renovation, solar installation, construction material supply. " +
      "Phone: 9801069733 / 9855069733. WhatsApp: 9779801069733. " +
      "Hours: 10AM-6PM, Sunday-Friday. Free site visit is available. " +
      (lang === "ne"
        ? "हमेशा सजिलो, न्यानो नेपाली (Devanagari) मा जवाफ दिनुहोस् — औपचारिक/कठिन शब्द नचलाउनुहोस्। "
        : "Always reply in short, friendly English. ") +
      "MATCH DEPTH TO THE QUESTION: a simple factual question (hours, phone, location, " +
      "yes/no) gets 1-3 short lines. A comparison, technical explanation, or 'which is " +
      "better/how does X work' question deserves a structured, genuinely useful answer: " +
      "use short bullet points (2-4 per option), name the real trade-offs (cost, " +
      "durability, insulation, maintenance, best-use-case), and close with one practical " +
      "recommendation based on common scenarios — the kind of answer a knowledgeable " +
      "site engineer would give a customer, not a one-line brush-off. " +
      "For substantive answers, write like the most respected site engineer at the " +
      "company would: specific, concrete, grounded in how the work actually gets done — " +
      "mention typical steps, timelines, materials, or what most customers in that " +
      "situation choose, whenever you can reasonably infer them from general construction " +
      "knowledge. Avoid vague filler ('it depends', 'many factors') as the whole answer — " +
      "give the best concrete answer first, THEN note what would refine it further. " +
      "End every substantive answer (not simple factual ones) by inviting the person to " +
      "share their name, phone number, and location so the team can give an exact quote " +
      "or arrange the free site visit — but only using the contact/offer details actually " +
      "given here, never invented ones. " +
      "Never invent prices, warranty terms, discounts/promotions, or completed-project " +
      "counts beyond what's given in this context — if unsure, say the exact figure needs " +
      "a quick call/WhatsApp rather than guessing. " +
      greetRule +
      (context ? ("\n\nAdditional context:\n" + context) : "");

    // Gemini expects its own turn shape; fold system + prior turns into one contents array.
    const contents = [];
    contents.push({ role: "user", parts: [{ text: sys }] });
    contents.push({ role: "model", parts: [{ text: lang === "ne" ? "बुझें, सहयोगका लागि तयार छु।" : "Understood, ready to help." }] });
    for (const m of messages.slice(-12)) {
      const role = m.role === "assistant" ? "model" : "user";
      const text = String(m.content || "").slice(0, 4000);
      if (text) contents.push({ role, parts: [{ text }] });
    }

    // 2026-08 नोट: gemini-2.0-flash जुन १, २०२६ मा बन्द भयो; यसको आधिकारिक
    // migration-target 3.1 Flash-Lite प्रयोग गरिएको — free-tier मै, उदार rate-limit।
    const model = "gemini-3.1-flash-lite";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents,
          generationConfig: { temperature: 0.75, maxOutputTokens: 900 }
        })
      });

      if (!r.ok) {
        const errText = await r.text().catch(() => "");
        return new Response(JSON.stringify({ error: "AI service error", detail: errText.slice(0, 300) }), {
          status: 502, headers: { "Content-Type": "application/json", ...cors }
        });
      }

      const data = await r.json();
      const reply =
        data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("").trim() || "";

      if (!reply) {
        return new Response(JSON.stringify({ error: "Empty AI response" }), {
          status: 502, headers: { "Content-Type": "application/json", ...cors }
        });
      }

      return new Response(JSON.stringify({ reply }), {
        status: 200, headers: { "Content-Type": "application/json", ...cors }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: "Worker exception — यो सन्देश Claude लाई देखाउनुहोस्", detail: String((e && e.message) || e).slice(0, 300) }), {
        status: 500, headers: { "Content-Type": "application/json", ...cors }
      });
    }
  }
};
