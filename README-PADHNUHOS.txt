── 🪔 नयाँ (2026-10): दशैं–तिहार FESTIVE THEME (अस्थायी) ──
✨ के छ: सबैभन्दा माथिको notice bar मा पहिलो "🪔 दशैं–तिहार विशेष:
   सम्पूर्ण निर्माण तथा इन्टेरियर सेवामा १०% सम्म छुट" (सुनौलो) र
   "🏠 नि:शुल्क साइट भिजिट" (हरियो), notice को छेउमा बलेको दियो;
   बिस्तारै झर्ने सयपत्री, hero माथि उड्ने सानो चंगा, हल्का पटका,
   र बायाँ तल 🎵 बटन — थिचेपछि मात्र धुन बज्छ (आफैं बज्दैन)।
⚡ Performance: एनिमेशन/धुन festive.js मा छन् — page पूरै load
   भएपछि मात्र आउँछ (~7 KB)। "Reduce motion" रोज्नेलाई झर्ने/पड्कने
   एनिमेशन देखिँदैन; admin mode मा केही देखिँदैन।
🎵 धुन: browser आफैंले बजाउने मौलिक धुन (बाँसुरी, मादल, घण्टी) —
   कुनै file download छैन। आफ्नै mp3 (जस्तै Malshree, अनुमति
   भएको) बजाउन index.html मा PRK_FESTIVE को musicUrl मा file को
   नाम लेख्नुहोस्, जस्तै musicUrl:"music/dashain.mp3"।
⏹️ बन्द गर्ने: (१) Admin → Components → "🪔 Festive Theme" off गर्नुहोस्
   (सबै visitor का लागि), वा (२) index.html मा PRK_FESTIVE को
   on:true लाई on:false बनाउनुहोस्। एउटा भाग मात्र बन्द गर्न
   petals / kite / crackers / music:false। FEST_END (छठ, 2026-11-16)
   पछि आफैं बन्द हुन्छ।
🗑️ पूरै हटाउने (चाडपर्वपछि, चाहे): festive.js file मेटाउनुहोस् र
   index.html मा "FESTIVE THEME" लेखिएको <script> हटाउनुहोस्।


── ✅ नयाँ (2026-10): विश्वास र पारदर्शिता ──
🚫 नक्कली "Rajan K. from Hetauda requested a site visit…" जस्ता
   activity popup पूरै हटाइए।
🪔 दशैं–तिहार offer र चाडपर्वका सूचना index.html को FEST_END
   मिति (अहिले "2026-11-16", छठ) सम्म मात्र देखिन्छन्, त्यसपछि
   आफैं हट्छन्। अर्को वर्ष फेरि चलाउन index.html मा FEST_END
   खोजेर नयाँ मिति राख्नुहोस्। Admin notice को From/To मिति पनि
   अब लागू हुन्छ।
🎁 Exit popup (page छोड्न लाग्दा): FEST_END सम्म "दशैं–तिहार
   अफर · छठसम्म — १०% सम्म छुट", त्यसपछि "नि:शुल्क साइट भिजिट"
   (छुट बिना)। "Limited Offer" भन्ने सधैंभरिको अफर हटाइयो।
⭐ "4.9/5 Happy Clients" (प्रमाण नभएको rating) को सट्टा
   "10 सेवा एउटै छानामुनि"। साँचो Google rating राख्न
   Admin → Hero → Stats को तेस्रो box मा rating र label लेख्नुहोस्।
🖼️ Projects मा इन्टरनेटको stock फोटो (images.unsplash.com) भएका
   card देखिँदैनन् — Admin → Projects मा आफ्नो वास्तविक फोटो
   हालेपछि आफैं देखिन्छन्।
💬 Testimonials: पहिलेका सबै review (Ram Bahadur Thapa, Sumitra Devi
   Shrestha आदि) र "127+ verified reviews" भन्ने दाबी नक्कली भएकाले
   हटाइए। एउटा पनि साँचो review नभएसम्म website मा Testimonials
   section र footer को "Reviews" link लुक्छन्। साँचो ग्राहकको
   review (अनुमति लिएर) Admin → Testimonials → Save Testimonial बाट
   थप्नुहोस् — section आफैं देखिन्छ; त्यहीँबाट Delete पनि गर्न सकिन्छ।
🔒 privacy-policy.html = website को गोपनीयता नीति (contact form र
   footer को link)। privacy.html चाहिँ Ganak app को हो — नछुनुहोस्।
❓ 404.html = गलत/पुरानो link खोल्दा देखिने page (Home, फोन,
   WhatsApp बटनसहित)।


── 🔐 नयाँ (2026-10): ADMIN PASSWORD सुरक्षा — एकपटक गर्नैपर्ने ──
⚠️ पहिले admin/super-admin password को hash (SHA-256) website को
   HTML र सार्वजनिक Firestore (siteSettings/main) मा खुला थियो —
   जो कोहीले copy गरेर कमजोर password अनुमान गर्न सक्थ्यो।
   अब हटाइयो: HTML मा छैन, Firestore मा लेखिँदैन/पढिँदैन, र admin
   ले अर्को पटक Save गर्दा Firestore बाट पनि मेटिन्छ।
🔑 Login: यो device मा save भएको password, नत्र Firebase Auth
   (admin email + password) बाट जाँचिन्छ। Password बिर्से login
   box मा "Forgot password? Send reset email" थिच्नुहोस् — Firebase
   ले admin email मा reset link पठाउँछ।
✅ अनिवार्य (एकपटक): पुरानो password सार्वजनिक भइसकेकोले
   Admin → Settings → Change Password बाट नयाँ बलियो password
   राख्नुहोस् (अब यसले Firebase Auth को password पनि सँगै बदल्छ)।
🛡️ Firestore Rules (सिफारिस): siteSettings मा admin ले मात्र लेख्न
   पाओस् — आफ्नो rules भित्र यो पनि थप्नुहोस्/मिलाउनुहोस्:

    match /siteSettings/{doc} {
      allow read: if true;
      allow write: if request.auth != null
        && request.auth.token.email == 'asrayacreate.ac@gmail.com';
    }
    match /stats/{doc} {
      allow read: if request.auth != null
        && request.auth.token.email == 'asrayacreate.ac@gmail.com';
      allow create, update: if request.resource.data.keys().hasOnly(['wa','call','mail']);
    }


── 🤖 नयाँ (2026-10): PRERAK ASSISTANT — भाषा नियम + SOLAR ──
🗣️ Assistant ले अब प्रयोगकर्ताकै भाषा र लिपिमा जवाफ दिन्छ:
   नेपाली (देवनागरी) → नेपाली · Roman नेपाली ("K chha khabar") →
   Roman नेपाली · English → English · हिन्दी → हिन्दी
   (site को EN/NE बटनले होइन)।
📜 स्थायी System Prompt: prerak-ai-worker.js को SYSTEM_PROMPT —
   Gemini को systemInstruction मा पठाइन्छ। बदल्नुपरे त्यही text
   मात्र फेर्नुहोस् र Cloudflare मा फेरि paste + Deploy गर्नुहोस्।
☀️ Solar सेवा = सोलार वाटर हिटर र गिजर जडान मात्र (सोलार panel,
   battery वा inverter होइन) — site, FAQ, team card सबैतिर।
⚠️ अनिवार्य: नयाँ prerak-ai-worker.js लाई Cloudflare → Workers →
   prerak-ai → Edit code मा पूरै paste गरी Deploy गर्नुहोस्।
   (paste नगरेसम्म AI जवाफमा पुरानै नियम चल्छ; website को
   FAQ-mode जवाफ भने तुरुन्तै नयाँ नियममा चल्छ)


── 📨 नयाँ (2026-10): CONTACT FORM → FIREBASE "inquiries" ──
✅ Form का सबै ५ विवरण अनिवार्य; नाम/फोन/ठेगाना/सेवा/सन्देश
   कडाइका साथ जाँचिन्छ (नेपाली नम्बर, देवनागरी अंक पनि चल्छ)।
☁️ "कोट अनुरोध" थिचेपछि inquiry Firebase Firestore को
   `inquiries` collection मा save हुन्छ → सफल भए हरियो
   "अनुरोध प्राप्त भयो!" (सन्दर्भ नं. PRK-XXXXXX सहित),
   असफल भए रातो panel (फेरि प्रयास / WhatsApp / फोन)।
📥 Admin login गरेपछि ती inquiries आफैं CRM मा "New" lead भएर
   आउँछन् (हरेक ५ मिनेटमा पनि जाँच्छ, दोहोरिँदैनन्)।
🔐 अनिवार्य: Firebase Console → Firestore Database → Rules मा
   आफ्नो पुरानो `match /databases/{database}/documents { … }`
   भित्र तलको block थपेर Publish गर्नुहोस् (बाँकी rules नछुनुहोस्)।
   नथपे visitor को form मा "अनुरोध पठाउन सकिएन" आउँछ।
   (admin email फेर्नुभएको छ भने तलको email पनि फेर्नुहोस्)

    match /inquiries/{id} {
      allow create: if request.resource.data.keys().hasOnly(['name','phone','phoneE164','location','service','message','status','source','lang','page','userAgent','createdAt'])
        && request.resource.data.keys().hasAll(['name','phone','location','service','message','status','createdAt'])
        && request.resource.data.name is string && request.resource.data.name.size() >= 2 && request.resource.data.name.size() <= 60
        && request.resource.data.phone is string && request.resource.data.phone.matches('^[0-9]{8,10}$')
        && request.resource.data.location is string && request.resource.data.location.size() >= 2 && request.resource.data.location.size() <= 100
        && request.resource.data.service is string && request.resource.data.service.size() >= 1 && request.resource.data.service.size() <= 60
        && request.resource.data.message is string && request.resource.data.message.size() >= 10 && request.resource.data.message.size() <= 1000
        && request.resource.data.status == 'New'
        && request.resource.data.source in ['website-form', 'website-whatsapp']
        && request.resource.data.page.size() <= 300 && request.resource.data.userAgent.size() <= 300
        && request.resource.data.createdAt == request.time;
      allow read, update, delete: if request.auth != null
        && request.auth.token.email == 'asrayacreate.ac@gmail.com';
    }

⚠️ Rules मा "allow read, write: if true" वा मिति-सीमा भएको
   "test mode" rule छ भने त्यो कुनै दिन expire भएर site को
   content पनि load हुन छोड्छ — एकपटक जाँच्नुहोस्।


── ⚠️ नयाँ (2026-10): IMAGES अब छुट्टै `img/` FOLDER मा ──
📁 index.html भित्रका सबै photo अब `img/` folder मा छुट्टाछुट्टै
   file भएर बसेका छन् (index.html 4.2MB → 1.1MB, site छिटो खुल्छ)।
📤 Upload गर्दा index.html सँगै `img/` folder पनि अनिवार्य
   राख्नुहोस् — नत्र photo देखिँदैनन्।
🔁 sw.js (v7) ले यी सबै image background मा cache गर्छ, त्यसैले
   app/offline मा पनि photo देखिन्छन्। img/ मा file थप्दा/फेर्दा
   sw.js को IMAGES सूची र CACHE version पनि अद्यावधिक गर्नुहोस्।
📊 Google Analytics: index.html मा GA_ID="G-XXXXXXXXXX" लाई
   आफ्नो असली Measurement ID ले बदलेपछि मात्र tracking चल्छ।


═══════════════════════════════════════════════════════════
 PRERAK — FINAL PACK v22  (z23: floats-redesign + WA-bridge)
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


── v17 मा नयाँ (z30) — MASTER FIX ──
🎯 दायाँको ⋯ (थप-menu): अब click जसरी पनि चल्छ — नयाँ
   "निर्देशांक-router" ले कुनै अदृश्य तत्वले छेके पनि सिधै खोल्छ;
   mouse नजिक पुग्दा पनि आफैं खुल्छ
💬 AI-assist: mouse नजिक पुग्दा आफैं popout; ✕ ले बन्द गरे
   ३० सेकेन्ड नबल्झिने; panel अझ अग्लो (80vh)
✨ जवाफ सफा: ** र * जस्ता गिजमिज चिन्ह अब कहिल्यै नदेखिने —
   bold राम्रो, बुँदा सुनौलो •, सेवाहरू emoji-सहित
   (🏗️ 🛋️ 🪟 ⚡ ☀️ ...) — worker paste गर्नुपर्छ!
यसपटक फेरिएका: index.html + prerak-ai-worker.js (दुवै)


── v18 मा नयाँ (z31) — ⋯ menu को सफा नयाँ रूप ──
🎯 खुल्दा देखिने ठूला गाढा नाम-थेग्ला (गिजमिज) पूरै हटाइए
✨ अब: round सुनौला-घेरा icon-बटनहरू किनारबाट सलल
   एक-एक गर्दै slide-in हुन्छन् (पहिलेको half-circle परिवारकै
   सफा शैली) — नाम चाहिँ laptop मा mouse राख्दा मात्र
   सानो pill मा देखिन्छ
यसपटक फेरिएको: index.html मात्र (worker v17 कै — यदि v17
को worker deploy गरिसकेको छ भने फेरि पर्दैन)


── v18 मा नयाँ (z31) — ⋯ menu नयाँ रूप ──
🎡 ⋯ खुल्दा अब ठूला गाढा label-थेग्ला छैनन् — round सुनौला-घेरा
   बटनहरू किनारबाट एक-एक गरी सलल आउँछन् (half-circle
   परिवारकै शैली); नाम mouse राख्दा मात्र सानो pill मा देखिन्छ
यसपटक फेरिएको: index.html मात्र (worker v17 कै — पहिले paste
गरिसकेको भए फेरि पर्दैन)


── v19 मा नयाँ (z32) — तीनवटै गुनासो fix ──
🎡 ⋯ खुल्दा अब पहिलेकै ORIGINAL सुनौला-घेरा बटनहरू नै
   फर्किन्छन् (जुन design मन पर्थ्यो) — बन्द हुँदा लुक्ने;
   कुनै बटन थिचेपछि menu आफैं बन्द
📱 MOBILE FIX: tap गर्दा केही नखुल्ने जरो भेटियो — एउटै tap
   लाई दुई handler ले दोहोरो-toggle गर्दा खुल्नासाथ बन्द हुँदो
   रहेछ; अब router नै एकमात्र मालिक — एक tap = खुल्छ, बस्छ
💬 AI panel साँघुरो (368px) + अझ अग्लो (86vh) — chat गर्न
   अझ आरामदायी
यसपटक फेरिएको: index.html मात्र


── v20 मा नयाँ (z33) — MOBILE जरो #2 + अग्लो chat ──
📱 MOBILE अन्तिम fix: औंलाको tap ले आफैंसँग जुध्दो रहेछ —
   tap-अघिको सूक्ष्म pointermove ले "mouse-नजिक" खोल्थ्यो,
   त्यही tap को click ले बन्द गर्थ्यो। अब "नजिक-खुल्ने" साँचो
   mouse मा मात्र; mobile मा tap = खुल्छ, बस्छ (⋯/ℹ️/💬 तीनै)
💬 Chat panel अब सधैं अग्लो (Chatbase-जस्तै) — खाली हुँदा
   पनि होचो नदेखिने, पूरा 86vh
यसपटक फेरिएको: index.html मात्र


── v21 मा नयाँ (z34) — Advisor-audit fixes ──
🔐 Debug-OTP सुरक्षा-कवच: "Show OTP on screen" toggle अब
   session-only — reload गर्नेबित्तिकै आफैं OFF (Firebase बाट
   ढिलो आए पनि पहिलो १२ सेकेन्ड बल-पूर्वक OFF); testing
   चाहिए session-भित्र अझै tick गर्न मिल्छ
🌐 lang="ne" (manifest सँग मिल्यो — SEO/accessibility)
🔢 Stats मा static-default (500+/13+) बेक — JS-नचल्ने
   crawler ले पनि अंक देख्छ; page मा count-up उही
नोट: advisor का अरू ३ दाबी (stats-0+, pricing-दुई-मूल्य,
calendar-stale) जाँच्दा गलत-अलार्म ठहरिए — केही परिवर्तन छैन
यसपटक फेरिएको: index.html मात्र


── v22 मा नयाँ (z35) — FINAL POLISH (audit-आधारित) ──
📱 iOS input-zoom अन्त्य: mobile मा contact-form + chat का
   input अब 16px — focus गर्दा page आफैं zoom हुने झर्को सकियो
♿ Chat a11y: सन्देश-क्षेत्रमा role="log" + aria-live —
   screen-reader ले AI-जवाफ आफैं सुनाउँछ
📋 Audit-नतिजा: focus-states(41), reduced-motion(38),
   CRUD-feedback(229 toast+27 confirm), image-fallback(36)
   — पहिल्यै स्वस्थ, केही छोइएन
यसपटक फेरिएको: index.html मात्र (2 surgical edits + 1 block)

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
