═══════════════════════════════════════════════════════════
 PRERAK — FINAL PACK v16  (z23: floats-redesign + WA-bridge)
═══════════════════════════════════════════════════════════
यसपटक फेरिएको FILE एउटै मात्र: sahayak/index.html
बाँकी सबै (main site z22, sw.js v6, दुवै manifest, चारै
icon) उही — दोहोरो जाँच गरिसकिएको, टच गरिएको छैन।


── v11 मा नयाँ (z24) ──
🖱️ Hover-tooltip: laptop मा mouse नजिक लैजाँदा हरेक float-बटनमा
   label देखिन्छ (Call · फोन, WhatsApp, थप विकल्प; 💬 मा पनि)

📲 WA-BRIDGE: form का दुवै बटन (कोट अनुरोध + WhatsApp) ले
   अब WhatsApp खोल्नुअघि lead आफैं admin-CRM मा save गर्छ —
   visitor ले WhatsApp मा send नगरे पनि inquiry हराउँदैन।
   (source-tag सहित: "Website form", status New, 2-min dedupe)
🎯 FLOATS नयाँ रूप: ६-बटने भीड हट्यो → दायाँ-तल Call(सुनौलो)
   + WhatsApp(हरियो) मात्र; बाँकी (Projects, Messenger,
   Email, Services, Theme) "⋯" भित्र — tap गरे खुल्ने/बन्द हुने
💬 Chat-bubble अब बायाँ-तल — Call/WA सँग कहिल्यै नजुध्ने
यसपटक फेरिएको file: index.html मात्र (बाँकी सबै v9 कै)


── v12 मा नयाँ (z25) — Chat Assistant Upgrade ──
🎨 PRERAK Assistant नयाँ look: ठूलो panel, गोलाकार-icon header
   (🏠 avatar), "अनलाइन · तुरुन्तै जवाफ" हरियो-डट सहित, हरेक
   bot-जवाफमा समय + 👍👎 feedback बटन
🧠 जवाफ अझ राम्रो: Worker ले अब लामो, ठोस, site-engineer-शैलीको
   जवाफ दिन्छ (900 token सम्म, "जे पर्छ" जस्ता खाली जवाफ बेवास्ता)
⚠️ यसपटक फेरिएका DUई FILE: index.html + prerak-ai-worker.js
   (दुवै छुट्टै-छुट्टै संलग्न — worker.js Cloudflare मै paste गर्नुपर्छ,
   README स्तर-३ हेर्नुहोस्)


── v13 मा नयाँ (z26) — "थप विवरण" tab fix ──
ℹ️ दायाँ-किनारको half-round "थप विवरण" tab:
   • बायाँबाट दायाँ सारियो (सही ठाउँ)
   • mouse नजिक आउँदा आफैं popout हुन्छ (desktop)
   • click-गर्दा-नखुल्ने bug fix (hover र click को जुधाइ थियो)
   • ✕ / बाहिर-click / Esc ले बन्द हुन्छ


── v14 मा नयाँ (z27) — Final Polish ──
✨ "थप विवरण" panel नयाँ रूप: उज्यालो ivory-card, प्रस्ट गाढा
   अक्षर, icon-chips, छुट्टिने rows — अब धमिलो/dark छैन
ℹ️ Tab मा "थप" label + हल्का pulse — आँखा तान्ने
💬 Welcome-bubble v2: सेतो card, "नमस्ते! प्रेरक मल्टिपर्पोजमा
   स्वागत छ..." — ~2 सेकेन्डमा आउने, ~16 सेकेन्डमा आफैं जाने,
   click गरे chat खुल्ने
🙏 AI को पहिलो जवाफ अब "नमस्ते"-सम्बोधनबाट सुरु हुन्छ
   (worker paste गर्नुपर्छ — ZIP भित्रकै prerak-ai-worker.js)
यसपटक फेरिएका: index.html + prerak-ai-worker.js


── v15 मा नयाँ (z28) — थप-विवरण BULLETPROOF rebuild ──
ℹ️ पुरानो tab पूर्ण निष्क्रिय; शून्यबाट नयाँ:
   • mouse "नजिकै" पुग्नेबित्तिकै popout (ठ्याक्कै माथि नपुगे पनि
     — किनारमा 56px अदृश्य-क्षेत्रले समात्छ)
   • click / touch / hover — जुनसुकैले खुल्ने
   • page-load को जुनसुकै अवस्थामा बन्ने (triple-retry)
   • सर्वोच्च तह — कुनै element ले छेक्नै नसक्ने
   • उही उज्यालो ivory-card design, Call/WhatsApp सहित
यसपटक फेरिएको: index.html मात्र (worker v14 कै — फेरि paste
गर्नु पर्दैन यदि v14 को worker deploy गरिसक्नुभएको छ भने)


── v16 मा नयाँ (z29) — FINAL POLISH ──
ℹ️ थप-विवरण v2.1:
   • mouse दायाँ-किनार नजिक पुग्नेबित्तिकै panel आफैं popout
     (document-तह tracking — कसैले छेक्नै नसक्ने प्रविधि)
   • पहिलो भ्रमणमा panel आफैं ~3 सेकेन्ड देखिएर चिनाउँछ
     (session मा एकपटक मात्र — code चलेको प्रमाण पनि)
🎨 AI chat नयाँ look: सेतो card (Chatbase-शैली) — सेतो header,
   हल्का-खैरो bot-bubble गाढा अक्षरसहित, सुनौलो user-bubble,
   उज्यालो input/chips — पढ्न सजिलो, आधुनिक
📱 Mobile सफा: दायाँका Call/WhatsApp गोला लुकाइए (तलको
   बारमा उही बटन छँदैछन्) — ⋯ More मात्र; भीड सकियो
जाँच: greeting z29 · site खोलेको ~3 सेकेन्डमा थप-विवरण आफैं
एकपटक देखिनुपर्छ — देखिए code चल्दैछ भन्ने पक्का!

── UPLOAD (सजिलो — १ FILE मात्र EDIT/PASTE) ──
1) यो ZIP EXTRACT गर्नुहोस्
2) GitHub → repo → "sahayak" folder भित्र पस्नुहोस्
3) index.html मा click → दायाँमाथि ✏️ (Edit)
4) Editor भित्र click → Ctrl+A (सबै select) →
   यो ZIP भित्रको sahayak/index.html को पूरा content
   खोलेर (Notepad मा) Ctrl+A, Ctrl+C गरी → Ctrl+V (paste)
5) Commit changes
   ⚠ चाहे पूरै ZIP का सबै ९ file drag-upload गरे पनि हुन्छ
     (उही नाम भएकाले बाँकी दोहोरिएर replace मात्र हुन्छन्,
     हानि छैन) — दुवै तरिका ठीक छ

── Sahayak v2 मा नयाँ के-के थपियो ──
✍️  Caption — अब १२ शैली (काम, Before/After, Tips,
    मूल्य-पारदर्शिता, भ्रम-vs-सत्य, Team, ग्राहक-कथा,
    Poll, चाडपर्व, Offer, FAQ, Series) — पहिले जस्तो
    एउटै किसिम दोहोरिँदैन (सम्झने-प्रणाली सहित)
🗓️  Calendar — १ click मा ३० दिनको पूरा content-plan,
    हरेक दिन फरक शैली, बुध=Before/After, शुक्र=Offer,
    शनि=Team — दिनमा click गरे caption+hook देखिन्छ
🎣  Hook-बैंक — ६ श्रेणीमा ३०+ तयार hook, एक-click copy
💬  Poll/सवाल-generator — comment तान्ने प्रश्न-post
🎙️  Voiceover Script — बोल्ने video का लागि (hook+body+
    अन्त्य) पूरा script, पढेरै बोल्न मिल्ने
🧵  Series-maker — ५ विषयका बहु-भाग series, सबै एकैचोटि
🪔  चाडपर्व-radar — दशैं/तिहार नजिकिँदा आजको सुझावमा
    आफैं देखिन्छ
⭐  Review + AI-mode — पहिलेकै जस्तै, यथावत्

── जाँच ──
sahayak tool खोल्नुहोस् → माथि "v2" देखिनुपर्छ →
🗓️ Calendar tab → "३० दिने plan बनाउनुहोस्" थिचेर हेर्ने

── बाँकी सबै पहिलेकै जस्तै (v8 बाट) ──
main+Sahayak दुई छुट्टै app · install-बटन आफैं आउने ·
💬 "के सहयोग गरौं?" pill · offline · self-heal ·
schema-clean · stats कहिल्यै 0+ मा नअड्किने

Version जाँच = 💬 chat greeting को पुछार (main site मा)
CNAME कहिल्यै नछुने!
═══════════════════════════════════════════════════════════
