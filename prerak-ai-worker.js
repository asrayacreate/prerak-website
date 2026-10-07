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

// ── Reply-language rule ──────────────────────────────────────────────────────
const LANGUAGE_RULE =
  "STRICT LANGUAGE RULE (highest priority — overrides every other instruction): " +
  "Always reply in the exact language and script the user uses. " +
  "If the user asks in Nepali, reply in Nepali. If the user asks in English, reply in English. " +
  "Nepali written in Devanagari (e.g. 'घर बनाउन कति लाग्छ?') → reply only in Devanagari Nepali. " +
  "Nepali typed in Roman letters (e.g. 'ghar banauna kati lagcha?') → reply in the same " +
  "Roman-letter Nepali, not Devanagari and not English. " +
  "Decide from the user's latest message only — not from the website language setting, " +
  "earlier messages, or the language of the context below. Do not mix languages in one " +
  "reply; only brand names, technical terms (UPVC, gypsum, geyser) and numbers may stay as they are.\n\n";

const LANG_TURN = {
  ne: "The user's latest message is in Nepali (Devanagari script). Reply ONLY in Nepali, written in Devanagari.",
  rom: "The user's latest message is in Nepali typed in Roman letters. Reply ONLY in Nepali written in Roman letters, like the user — not Devanagari, not English.",
  en: "The user's latest message is in English. Reply ONLY in English."
};
const LANG_ACK = {
  ne: "बुझें। म प्रयोगकर्ताकै भाषा र लिपिमा जवाफ दिन्छु।",
  rom: "Bujhe. Ma prayogkarta kai bhasa ra lipi ma jawaf dinchhu.",
  en: "Understood. I will reply in the user's own language and script."
};

// Common Nepali words as typed in Roman letters (to tell "kati lagcha?" from English).
const ROMAN_NE = new Set(("ko ma ho cha chha xa chaina chhaina hunchha huncha hunxa kati kasari kaha kahile kaile " +
  "kun ke kina garnu garne garna gardinu garchha garcha garxa garnuhunchha garnuhuncha garnuhos garnus malai mero " +
  "hamro tapai tapain tapaiko hajur ghar banauna banaune lagcha lagchha lagxa parcha parchha paisa sakincha " +
  "sakinchha milcha milchha chahiyo chaiyo chahincha dinus dinuhos ra pani ani ki hola thiyo chu chhu xu kaam kam " +
  "sasto mahango bhayo vayo dekhi samma ahile aaja bholi thau thegana sampark khulcha khulchha baje rakhnu lagaune " +
  "lagaunu jadan mulya bhanda ramro sabai yo tyo").split(" "));

/** "ne" = Devanagari Nepali, "rom" = Roman-letter Nepali, "en" = English. */
function detectLang(text, hint) {
  const t = String(text || "");
  const dev = (t.match(/[\u0900-\u097F]/g) || []).length;
  const lat = (t.match(/[A-Za-z]/g) || []).length;
  if (dev && dev >= lat * 0.5) return "ne";
  if (!lat) return dev ? "ne" : (hint === "rom" || hint === "en" ? hint : "ne");
  const words = t.toLowerCase().match(/[a-z]+/g) || [];
  const hits = words.filter(w => ROMAN_NE.has(w)).length;
  return (hits >= 2 || (hits >= 1 && words.length <= 3)) ? "rom" : "en";
}

/** One warm welcome line on the visitor's first message, in the reply language. */
function greetingFor(lang, isFirstTurn) {
  if (!isFirstTurn) return "";
  if (lang === "ne") {
    return "यो visitor को पहिलो सन्देश हो: जवाफको सुरुमा एक-line न्यानो सम्बोधन गर्नुहोस् — " +
      "\"नमस्ते! 🙏 प्रेरक मल्टिपर्पोजमा स्वागत छ।\" जस्तो — अनि तुरुन्तै उनको प्रश्नको " +
      "विस्तृत जवाफ दिनुहोस्। ";
  }
  if (lang === "rom") {
    return "This is the visitor's first message: open with one warm welcome line in Roman-letter " +
      "Nepali (e.g. \"Namaste! 🙏 Prerak Multipurpose ma swagat chha.\") then answer their question in detail. ";
  }
  return "This is the visitor's first message: open with one warm welcome line " +
    "(e.g. \"Namaste! Welcome to Prerak Multipurpose.\") then answer their question in detail. ";
}

/** Full system prompt. contentMode = Sahayak caption requests (no chat language rule). */
function buildSystemPrompt(lang, contentMode, isFirstTurn, context) {
  return (
    (contentMode ? "Write the output in exactly the language and script the instruction asks for. " : LANGUAGE_RULE) +
    "You are the helpful assistant for Prerak Multipurpose Pvt. Ltd., a construction " +
    "and interior company in Hetauda, Nepal. Services: building construction, interior " +
    "design, UPVC/aluminum windows and doors, gypsum ceiling, plumbing, electrical, " +
    "painting, renovation, solar water heater & geyser installation, construction material supply. " +
    "SOLAR: the only solar-related service is solar water heater and geyser installation. " +
    "Prerak does NOT provide solar panels, batteries, or inverters — if asked, say so " +
    "politely and offer the solar water heater and geyser service instead. " +
    "Phone: 9801069733 / 9855069733. WhatsApp: 9779801069733. " +
    "Hours: 8AM-6PM, Sunday-Friday. Free site visit is available. " +
    "Keep the tone simple, warm and friendly — no stiff or difficult words. " +
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
    "FORMATTING: never output markdown symbols like ** or * — write clean plain lines. " +
    "When listing services or options, start each line with one fitting emoji " +
    "(🏗️ building, 🛋️ interior, 🪟 UPVC/aluminum windows-doors, 🧱 gypsum, ⚡ electrical, " +
    "🚿 plumbing, 🎨 painting, ☀️ solar water heater/geyser, 🔨 renovation, 🚚 materials) followed by the " +
    "name and one short benefit. Keep each line short — easy to scan on a phone. " +
    "Never invent prices, warranty terms, discounts/promotions, or completed-project " +
    "counts beyond what's given in this context — if unsure, say the exact figure needs " +
    "a quick call/WhatsApp rather than guessing. " +
    greetingFor(lang, isFirstTurn) +
    (context ? ("\n\nAdditional context (facts only — its language does NOT decide your reply language):\n" + context) : "") +
    (contentMode ? "" : "\n\n" + LANG_TURN[lang])
  );
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
    // Reply language comes from the user's latest message itself (language AND script),
    // never from the website's EN/NE switch. body.lang is only a fallback hint.
    const lastUser = [...messages].reverse().find(m => m && m.role !== "assistant");
    // mode:"content" = Sahayak caption/script generator: its instruction names the output
    // language itself, so the chat language rule and the welcome line are not applied.
    const contentMode = body.mode === "content";
    const lang = contentMode ? (body.lang === "en" ? "en" : "ne") : detectLang(lastUser ? lastUser.content : "", body.lang);
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
    const isFirstTurn = !contentMode && !messages.some(m => m && m.role === "assistant");
    const sys = buildSystemPrompt(lang, contentMode, isFirstTurn, context);

    // Gemini expects its own turn shape; fold system + prior turns into one contents array.
    const contents = [];
    contents.push({ role: "user", parts: [{ text: sys }] });
    contents.push({ role: "model", parts: [{ text: contentMode ? "Understood." : LANG_ACK[lang] }] });
    for (const m of messages.slice(-12)) {
      const role = m.role === "assistant" ? "model" : "user";
      const text = String(m.content || "").slice(0, 4000);
      if (text) contents.push({ role, parts: [{ text }] });
    }
    // Re-state the language rule right on the latest user turn: earlier turns may be in a
    // different language, and the model otherwise tends to continue the previous one.
    const last = contents[contents.length - 1];
    if (!contentMode && last && last.role === "user") last.parts[0].text += "\n\n[" + LANG_TURN[lang] + "]";

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
