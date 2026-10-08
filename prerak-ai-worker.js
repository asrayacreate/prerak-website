/**
 * PRERAK AI Worker — Gemini-powered assistant for the website chat-widget
 * and the Sahayak Marketing tool. Both send: { messages:[{role,content}], context, lang[, mode] }
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

// ── Permanent system prompt (owner-provided, keep verbatim) ─────────────────
const SYSTEM_PROMPT = `You are the official AI Customer Support Assistant for 'Prerak Multipurpose Pvt. Ltd.', a leading construction and interior design company based in Hetauda, Nepal. CRITICAL LANGUAGE RULE: You MUST strictly reply in the EXACT SAME language and script that the user uses to ask the question.

* If the user writes in English -> Reply in English.
* If the user writes in pure Nepali (Devanagari / नेपाली) -> Reply in pure Nepali (Devanagari).
* If the user writes in Romanized Nepali (e.g., 'K chha khabar') -> Reply ONLY in Romanized Nepali (Pinglish).
* If the user writes in Hindi -> Reply in Hindi.

Be polite, helpful, and concise. Do not use Markdown formatting like bold or italics unnecessarily. Focus on answering queries related to construction, interior design, UPVC, gypsum, plumbing, and other services provided by Prerak Multipurpose.`;

// Company facts the assistant must not get wrong (contacts, hours, what is / isn't offered).
const BUSINESS_FACTS =
  "Company facts: Services — building construction, interior design, UPVC/aluminium windows and " +
  "doors, gypsum ceiling, plumbing, electrical, painting, renovation, solar water heater & geyser " +
  "installation, construction material supply. The only solar-related service is solar water heater " +
  "and geyser installation; Prerak does NOT provide solar panels, batteries, or inverters — if asked, " +
  "say so politely and offer the solar water heater and geyser service instead. " +
  "Phone: 9801069733 / 9855069733. WhatsApp: 9779801069733. Hours: 8AM-6PM, Sunday-Friday. " +
  "Free site visit is available. Never invent prices, warranty terms, discounts or project counts " +
  "beyond what is given here or in the context — if unsure, suggest a quick call/WhatsApp.";

// Per-turn reminder, chosen from the user's latest message (the model otherwise tends to
// continue in the language of earlier turns or of the context).
const LANG_TURN = {
  en: "The user's latest message is in English. Reply ONLY in English.",
  ne: "The user's latest message is in Nepali (Devanagari script). Reply ONLY in pure Nepali, written in Devanagari.",
  rom: "The user's latest message is in Romanized Nepali (Nepali typed in Roman letters). Reply ONLY in Romanized Nepali — not Devanagari, not English, not Hindi.",
  hi: "The user's latest message is in Hindi (Devanagari script). Reply ONLY in Hindi, written in Devanagari — not Nepali.",
  hirom: "The user's latest message is in Hindi typed in Roman letters (Hinglish). Reply ONLY in Hindi written in Roman letters, like the user — not Nepali, not Devanagari."
};

// Marker words. Hindi and Nepali share the Devanagari script, so they are told apart by
// common function words (है/क्या/नहीं vs छ/हो/लाई); same idea for Roman-letter text.
const DEV_NE = new Set(("छ छन् छैन छु छौं हो होइन लाई मा ले बाट गर्न गर्ने गर्नु गर्नुहोस् गर्छ गर्छौं कति कसरी किन " +
  "चाहिन्छ चाहियो हुन्छ हुन्छन् पर्छ तपाईं तपाईंको तपाईँ हामी हाम्रो मलाई मेरो पनि अनि सक्छ सकिन्छ भयो थियो " +
  "लाग्छ लाग्ने बनाउन छन").split(" "));
const DEV_HI = new Set(("है हैं था थी थे क्या नहीं नही मुझे मैं हम आप आपका आपकी आपके कितना कितनी कितने कैसे " +
  "चाहिए करना करते करें करेंगे होगा होगी होंगे रहा रही रहे लिए वाला वाली में भी तो यह वह इस उस कौन कब क्यों " +
  "बनवाना बनाना लगेगा सकते सकता मिलेगा").split(" "));
const ROMAN_NE = new Set(("ko ma cha chha xa chaina chhaina hunchha huncha hunxa kati kasari kaha kahile kaile " +
  "kun kina garnu garne garna gardinu garchha garcha garxa garnuhunchha garnuhuncha garnuhos garnus malai mero " +
  "hamro tapai tapain tapaiko hajur banauna banaune lagcha lagchha lagxa parcha parchha paisa sakincha " +
  "sakinchha milcha milchha chahiyo chaiyo chahincha dinus dinuhos ra pani ani hola thiyo chu chhu xu " +
  "sasto mahango bhayo vayo dekhi samma ahile aaja bholi thau thegana sampark khulcha khulchha baje rakhnu lagaune " +
  "lagaunu jadan mulya bhanda ramro sabai yo tyo khabar k").split(" "));
const ROMAN_HI = new Set(("hai hain tha thi kya nahi nahin mujhe hum aap aapka aapki aapke kitna kitni kitne kaise " +
  "chahiye karna karte karein karenge hoga hogi rahe raha rahi liye wala wali mein bhi kaun kab kyun kyon " +
  "banwana banana lagega sakte sakta milega accha acha theek thik").split(" "));

/** Reply language of a message: "en" | "ne" | "rom" | "hi" | "hirom". */
function detectLang(text, hint) {
  const t = String(text || "");
  const dev = (t.match(/[\u0900-\u097F]/g) || []).length;
  const lat = (t.match(/[A-Za-z]/g) || []).length;
  if (dev && dev >= lat * 0.5) {
    const toks = t.split(/[\s।,.!?;:()"'\-]+/).filter(Boolean);
    const ne = toks.filter(w => DEV_NE.has(w)).length;
    const hi = toks.filter(w => DEV_HI.has(w)).length;
    return hi > ne ? "hi" : "ne";
  }
  if (!lat) return dev ? "ne" : (LANG_TURN[hint] ? hint : "ne");
  const words = t.toLowerCase().match(/[a-z]+/g) || [];
  const ne = words.filter(w => ROMAN_NE.has(w)).length;
  const hi = words.filter(w => ROMAN_HI.has(w)).length;
  const enough = n => n >= 2 || (n >= 1 && words.length <= 3);
  if (hi > ne && enough(hi)) return "hirom";
  if (enough(ne)) return "rom";
  return "en";
}

/** One warm welcome line on the visitor's first message, in the reply language. */
function greetingFor(lang, isFirstTurn) {
  if (!isFirstTurn) return "";
  const line = {
    en: "\"Namaste! Welcome to Prerak Multipurpose.\"",
    ne: "\"नमस्ते! 🙏 प्रेरक मल्टिपर्पोजमा स्वागत छ।\"",
    rom: "\"Namaste! 🙏 Prerak Multipurpose ma swagat chha.\"",
    hi: "\"नमस्ते! 🙏 प्रेरक मल्टिपर्पज़ में आपका स्वागत है।\"",
    hirom: "\"Namaste! 🙏 Prerak Multipurpose mein aapka swagat hai.\""
  }[lang] || "\"Namaste!\"";
  return "\n\nThis is the visitor's first message: start with one short welcome line such as " + line +
    " (in the reply language), then answer the question.";
}

/** Full system instruction. contentMode = Sahayak caption requests (their instruction names the language). */
function buildSystemPrompt(lang, contentMode, isFirstTurn, context) {
  const ctx = context ? ("\n\nAdditional context (facts only — its language does NOT decide your reply language):\n" + context) : "";
  if (contentMode) {
    return "You write marketing content for Prerak Multipurpose Pvt. Ltd., Hetauda, Nepal. " +
      "Write the output in exactly the language and script the instruction asks for. " +
      "Do not use Markdown formatting.\n\n" + BUSINESS_FACTS + ctx;
  }
  return SYSTEM_PROMPT + "\n\n" + BUSINESS_FACTS + greetingFor(lang, isFirstTurn) + ctx + "\n\n" + LANG_TURN[lang];
}

/** Conversation turns for Gemini: user/model only, must start with "user", no two same roles in a row. */
function toContents(messages, reminder) {
  const out = [];
  for (const m of messages.slice(-12)) {
    const role = m && m.role === "assistant" ? "model" : "user";
    const text = String((m && m.content) || "").slice(0, 4000);
    if (!text) continue;
    if (!out.length && role === "model") continue;
    const prev = out[out.length - 1];
    if (prev && prev.role === role) prev.parts[0].text += "\n\n" + text;
    else out.push({ role, parts: [{ text }] });
  }
  const last = out[out.length - 1];
  if (reminder && last && last.role === "user") last.parts[0].text += "\n\n[" + reminder + "]";
  return out;
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

    // System prompt goes in Gemini's dedicated systemInstruction field; contents = the chat only.
    const contents = toContents(messages, contentMode ? "" : LANG_TURN[lang]);
    if (!contents.length) {
      return new Response(JSON.stringify({ error: "messages चाहिन्छ" }), {
        status: 400, headers: { "Content-Type": "application/json", ...cors }
      });
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
          systemInstruction: { parts: [{ text: sys }] },
          contents,
          generationConfig: { temperature: 0.6, maxOutputTokens: 900 }
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
