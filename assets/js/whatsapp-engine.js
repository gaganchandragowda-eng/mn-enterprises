/* =================================================================
   M N ENTERPRISES — WHATSAPP CONTEXT-AWARE AUTO-REPLY ENGINE
   whatsapp-engine.js
   -----------------------------------------------------------------
   Load AFTER products.js
   No external dependencies. Runs fully in-browser (localStorage)
   and in Node.js via server.js webhook.
   ================================================================= */

const WA_ENGINE = (() => {
  /* ----------------------------------------------------------------
     CONSTANTS & SHOP TRUTH
  ---------------------------------------------------------------- */
  const SHOP = {
    name: "M N Enterprises",
    phone: "919686311260",
    location: "APMC Road, Nada Prabhu Kempe Gowda Circle, Bangarapet, Kolar, Karnataka 563114",
    timings: "6:30 AM to 9:00 PM, all 7 days",
    gstin: "29DTPG1328E1ZZ",
    upi: "PhonePe / Google Pay accepted",
    delivery: "Delivery available for bulk orders within Bangarapet. Confirm with shop staff.",
    since: "5+ years (trusted local service)"
  };

  const UNITS = ["pieces","piece","pcs","pc","nos","no","numbers","numbers","number","meter","meters","metre","metres","m","length","lengths","bundle","bundles","roll","rolls","bag","bags","kg","box","boxes","set","sets","pair","pairs","unit","units"];

  /* ----------------------------------------------------------------
     STORAGE HELPERS
  ---------------------------------------------------------------- */
  const store = {
    get() {
      try { return JSON.parse(localStorage.getItem("mn_wa_threads") || "{}"); } catch { return {}; }
    },
    save(data) {
      try { localStorage.setItem("mn_wa_threads", JSON.stringify(data)); } catch(e) {}
    },
    getThread(phone) {
      const d = this.get();
      if (!d[phone]) d[phone] = {
        id: phone,
        customerName: null,
        phone,
        messages: [],
        draftItems: [],       // [{product, qty, size, unit, raw}]
        activeItem: null,     // last mentioned product
        activeQty: null,      // last mentioned qty
        lang: "en",           // 'en' | 'kn' | 'kanglish'
        status: "new",        // new | auto_replied | needs_attention | handed_over
        autoPilot: true,
        lastUpdated: Date.now(),
        seenIds: []           // idempotency set
      };
      return d[phone];
    },
    saveThread(thread) {
      const d = this.get();
      d[thread.phone] = thread;
      this.save(d);
    },
    allThreads() {
      return Object.values(this.get()).sort((a,b) => b.lastUpdated - a.lastUpdated);
    }
  };

  /* ----------------------------------------------------------------
     LANGUAGE DETECTION
  ---------------------------------------------------------------- */
  function detectLang(text) {
    // Kannada script characters range U+0C80 to U+0CFF
    if (/[\u0C80-\u0CFF]/.test(text)) return "kn";
    // Romanized Kannada / Kanglish keywords
    const kanglish = /\b(beku|beda|eshtu|ideya|idu|illa|bekku|bekag|madtira|madri|madi|maadu|helri|heli|rate|enu|yen|hego|hogali|kodbidi|kodi|bidi|bekuva|barali)\b/i;
    if (kanglish.test(text)) return "kanglish";
    return "en";
  }

  /* ----------------------------------------------------------------
     INTENT CLASSIFICATION
  ---------------------------------------------------------------- */
  const INTENT = {
    ORDER_REQ:        /\b(require|need|want|order|give me|send|supply|beku|bekag|beku|kodbidi|kodi|want to order|enquiry for|enquiry about)\b/i,
    AVAILABILITY:     /\b(available|stock|is there|do you have|ideya|stock ide|sikt\b|miluttha|siguttha|sigthaideya|beku ideya|have|in stock|got)\b/i,
    PRICE_QUERY:      /\b(price|rate|cost|how much|eshtu|bele|belege|beleg[au]|yelashtu|enu bele|what.*cost|what.*rate|what.*price|how much.*for|charge)\b/i,
    QTY_CHANGE:       /\b(change|update|modify|make it|change.*to|it.*to\s*\d|instead\s*\d|madi\s*\d|now\s*\d|actually\s*\d|correct.*to\s*\d)\b/i,
    FOLLOW_UP_QTY:    /^[\d]+\s*(pieces?|pcs?|nos?|meters?|lengths?|bundles?|rolls?|units?)?\s*[\.\!\?]?\s*$/i,
    DELIVERY_QUERY:   /\b(deliver|delivery|send to|dispatch|courier|bring|shipping|home.*deliver|doorstep|madtira|barali|hogali)\b/i,
    COMPLAINT:        /\b(complaint|complain|damage|damaged|defective|broken|refund|money back|bad quality|not working|leak|leaking|short circuit|burst|problem|issue|cheated|wrong|fake)\b/i,
    PAYMENT:          /\b(payment|pay|paid|upi|gpay|phonepay|paytm|online.*pay|bank.*transfer|bounced|failed|not received)\b/i,
    GREETING:         /^(hi|hello|hii|hey|namaste|namasthe|good\s*(morning|afternoon|evening|night)|hai|hy|sup|what's up|ello)\b/i,
    THANKS:           /\b(thank|thanks|thank you|dhanyavaad|shukriya|ty|tq|thx)\b/i,
    TIMING_QUERY:     /\b(open|closed|timing|hours|when.*open|close|working hours|shop.*time|time.*shop)\b/i,
    LOCATION_QUERY:   /\b(where|address|location|place|shop.*where|direction|map|how.*reach)\b/i,
    SHOP_INFO:        /\b(about|gstin|gst number|owner|contact|email|website|who)\b/i,
    ANAPHORA_QTY:     /^(change|make|update|now|it.*to|that.*to|make.*to)\s*(\d+)\s*(pieces?|pcs?|nos?|meters?|lengths?|units?)?\s*[\.\!\?]?\s*$/i,
    YES:              /^\s*(yes|yeah|ya|yep|sure|ok|okay|fine|haan|hmm|confirm|correct|right)\s*[\.\!\?]?\s*$/i,
    NO:               /^\s*(no|nope|nahi|illa|not now|cancel|later)\s*[\.\!\?]?\s*$/i,
  };

  /* ----------------------------------------------------------------
     PRODUCT MATCHER — fuzzy match against catalog
  ---------------------------------------------------------------- */
  const ALIASES = {
    // PVC
    "pvc elbow": ["pvc elbow","elbow pvc","pvc 90","pvc bend"],
    "pvc tee": ["pvc tee","tee pvc","pvc t"],
    "pvc collar": ["pvc collar","pvc socket","pvc coupler","pvc coupling","pvc joiner"],
    "pvc pipe": ["pvc pipe","agricultural pipe","agri pipe","agri pvc","field pipe"],
    "cpvc elbow": ["cpvc elbow","cpvc 90","cpvc bend","cpvc hot cold elbow"],
    "cpvc tee": ["cpvc tee","cpvc t"],
    "cpvc pipe": ["cpvc pipe","cpvc hot","hot cold pipe","cpvc tube"],
    // Brass
    "brass elbow": ["brass elbow","brass 90","brass bend","brass fitting elbow"],
    "brass collar": ["brass collar","brass socket","brass coupling","brass joiner"],
    // Electrical
    "wire": ["wire","cable","wiring","kei wire","kei cable","homecab","inflame"],
    "bulb": ["bulb","led bulb","lamp","light bulb","gm bulb","9w bulb","9 watt","9w led"],
    "emergency light": ["emergency light","emergency bulb","emergency lamp","em light","inverter bulb","sturlite emergency","gm emergency"],
    "tube light": ["tube light","tube lamp","led tube","fluorescent tube","philips tube","sturlite tube"],
    "street light": ["street light","streetlight","outdoor light","flood light","area light","external light","led street"],
    "mcb": ["mcb","circuit breaker","breaker","miniature circuit"],
    "switch": ["switch","socket","modular switch","plug point","plug"],
    // Pumps
    "pump": ["pump","water pump","motor pump","submersible","self priming","borewell pump","sharp pump"],
    "tank": ["tank","water tank","storage tank","flowken","overhead tank"],
    // CCTV
    "camera": ["camera","cctv","cctv camera","dome camera","bullet camera","ip camera","security camera","surveillance"],
    "dvr": ["dvr","nvr","recorder","digital video recorder"],
    // Network
    "router": ["router","wifi router","wifi","wireless router","wi-fi"],
    "cable": ["lan cable","network cable","cat6","ethernet","rj45"]
  };

  function extractSize(text) {
    const m = text.match(/(\d+\/\d+|\d+(?:\.\d+)?)\s*("|inch|inches|in|"|sq\.?mm|sqmm|sqmm|mm|cm|ft|feet|litre|liter|ltr|L|kw|w|watt|watts|W|hp|HP|A|amp|ampere)/i);
    if (m) return m[0].trim();
    return null;
  }

  function extractQty(text) {
    const m = text.match(/(\d+)\s*(pieces?|pcs?|nos?|no\.?|numbers?|meters?|metres?|lengths?|bundles?|rolls?|units?|bags?|kgs?|box(es)?|sets?|pairs?|lamps?|bulbs?|lights?)?/i);
    return m ? parseInt(m[1], 10) : null;
  }

  function findProducts(text) {
    if (typeof PRODUCTS === "undefined") return [];
    const products = PRODUCTS.getAll();
    const lo = text.toLowerCase();
    const matched = [];

    // Direct substring match on product name/desc
    for (const p of products) {
      const nameLo = p.name.toLowerCase();
      const descLo = (p.desc || "").toLowerCase();
      if (nameLo.includes(lo.slice(0,12)) || lo.includes(nameLo.slice(0,12)) || descLo.includes(lo.slice(0,10))) {
        matched.push(p);
      }
    }
    if (matched.length) return matched;

    // Alias-based lookup
    for (const [key, aliases] of Object.entries(ALIASES)) {
      if (aliases.some(a => lo.includes(a))) {
        const kLo = key.toLowerCase();
        const found = products.filter(p => p.name.toLowerCase().includes(kLo.split(" ")[0]) ||
          p.name.toLowerCase().includes(kLo.split(" ")[1] || "___"));
        if (found.length) return found;
      }
    }

    return [];
  }

  /* ----------------------------------------------------------------
     ENTITY EXTRACTION — parse products, sizes, quantities
  ---------------------------------------------------------------- */
  function extractItems(text) {
    const items = [];
    // Pattern: "[qty] [unit]? [productName]" — separated by "and" | "&" | ","
    const chunks = text
      .replace(/\band\b/gi, "|")
      .replace(/[,;&]/g, "|")
      .split("|")
      .map(s => s.trim())
      .filter(Boolean);

    for (const chunk of chunks) {
      const qty = extractQty(chunk);
      const size = extractSize(chunk);
      const prods = findProducts(chunk);
      if (qty || prods.length) {
        items.push({ raw: chunk.trim(), qty, size, products: prods });
      }
    }
    return items;
  }

  /* ----------------------------------------------------------------
     RESPONSE TEMPLATES
  ---------------------------------------------------------------- */
  const WA_AUTO_FOOTER = `\n────────────────────────\n🏬 *M N Enterprises* — Bangarapet\n📍 APMC Road, Opp. Kempe Gowda Circle\n📞 096863 11260 | ⏰ 6:30 AM–9:00 PM`;

  const T = {
    greet(lang) {
      if (lang === "kn") return "ನಮಸ್ಕಾರ! M N Enterprises ಗೆ ಸ್ವಾಗತ. ನಿಮಗೆ ಏನು ಸಹಾಯ ಮಾಡಲಿ? 🙏";
      if (lang === "kanglish") return "Namaskara! M N Enterprises ge swagata. Nimge yenu help mado? 🙏";
      return `Hello! Welcome to *${SHOP.name}*. How can we help you today? 😊`;
    },
    thanks(lang) {
      if (lang === "kn") return "ಧನ್ಯವಾದ! ನಿಮಗೆ ಇನ್ನೇನಾದರೂ ಸಹಾಯ ಬೇಕಾದರೆ ಕೇಳಿ.";
      if (lang === "kanglish") return "Dhanyavaad! Innu yenu beku aadre heli.";
      return "Thank you! 😊 Do let us know if you need anything else.";
    },
    timing(lang) {
      if (lang === "kn") return `ನಮ್ಮ ಅಂಗಡಿ ಪ್ರತಿದಿನ ಬೆಳಗ್ಗೆ 6:30 ರಿಂದ ರಾತ್ರಿ 9:00 ರ ವರೆಗೆ ತೆರೆದಿರುತ್ತದೆ. 🕐`;
      if (lang === "kanglish") return `Naamma angadi pratidinaa 6:30 AM ninda 9:00 PM varegu teridiratte. 🕐`;
      return `🕐 We are open *every day*, 6:30 AM to 9:00 PM — no holidays!`;
    },
    location(lang) {
      if (lang === "kn") return `ನಮ್ಮ ವಿಳಾಸ:\n📍 ${SHOP.location}\n\nGoogle Maps ನಲ್ಲಿ ಹುಡುಕಲು: "M N Enterprises Bangarapet" ಎಂದು ಟೈಪ್ ಮಾಡಿ.`;
      return `📍 *Our address:*\n${SHOP.location}\n\nSearch "M N Enterprises Bangarapet" on Google Maps.`;
    },
    orderAck(items, lang) {
      let subtotal = 0;
      let hasPrices = false;
      const list = items.map((it, idx) => {
        const num = idx + 1;
        const qty = it.qty || 1;
        const p = it.products && it.products.length ? it.products[0] : null;
        const nameStr = p ? p.name : it.raw;
        const sizeStr = it.size ? ` (${it.size})` : "";
        if (p && p.price) {
          hasPrices = true;
          const line = p.price * qty;
          subtotal += line;
          return `${num}️⃣ *${nameStr}${sizeStr}*\n   • Qty: ${qty} ${it.unit || "pcs"} × ₹${p.price} = *₹${line.toLocaleString("en-IN")}*`;
        }
        return `${num}️⃣ *${nameStr}${sizeStr}*\n   • Qty: ${qty} ${it.unit || "pcs"}`;
      }).join("\n\n");

      let header = `🧾 *M N ENTERPRISES — ORDER BILL & ESTIMATE*\n────────────────────────\n📦 *ITEMIZED BILL:*\n\n${list}\n────────────────────────\n`;
      if (hasPrices) {
        header += `💰 *TOTAL PAYABLE:* *₹${subtotal.toLocaleString("en-IN")}*\n────────────────────────\n`;
      }

      if (lang === "kn") return `${header}ಧನ್ಯವಾದ! ನಿಮ್ಮ ಆರ್ಡರ್ ವಿವರ ಸ್ವೀಕರಿಸಿದ್ದೇವೆ. ಅಂಗಡಿ ಸಿಬ್ಬಂದಿ ಲಭ್ಯತೆ ಖಚಿತಪಡಿಸುತ್ತಾರೆ. 🙏`;
      if (lang === "kanglish") return `${header}Dhanyavaad! Nimma order details sweekarisiddeeve. Angadi staff availability confirm madtaare. 🙏`;
      return `${header}Thank you! We have logged your order requirement. Our staff will confirm packing & delivery shortly. 🙏`;
    },
    available(product, size, lang) {
      const name = product ? product.name : "that item";
      const sizeStr = size ? ` (${size})` : "";
      if (lang === "kn") return `✅ ಹೌದು, *${name}${sizeStr}* ಲಭ್ಯವಿದೆ.`;
      if (lang === "kanglish") return `✅ Howdu, *${name}${sizeStr}* available idhe.`;
      return `✅ Yes, *${name}${sizeStr}* is available.`;
    },
    notAvailable(name, lang) {
      if (lang === "kn") return `⚠️ ಕ್ಷಮಿಸಿ, *${name}* ಈಗ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ನೇರವಾಗಿ ಅಂಗಡಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
      if (lang === "kanglish") return `⚠️ Sorry, *${name}* eega available illa. Dayavittu nerage angadi contact madi.`;
      return `⚠️ Sorry, *${name}* is currently not in stock. Please contact the shop directly for alternatives.`;
    },
    priceInfo(product, lang) {
      const name = product.name;
      const price = `₹${product.price}`;
      const mrp = product.mrp && product.mrp > product.price ? ` (MRP ₹${product.mrp})` : "";
      if (lang === "kn") return `💰 *${name}* ಬೆಲೆ: *${price}*${mrp} ಪ್ರತಿ ಘಟಕ.`;
      if (lang === "kanglish") return `💰 *${name}* bele: *${price}*${mrp} (per unit).`;
      return `💰 *${name}* is priced at *${price}*${mrp} per unit.`;
    },
    priceUnknown(name, lang) {
      if (lang === "kn") return `${name} ಬೆಲೆ ಖಚಿತಪಡಿಸಲು ದಯವಿಟ್ಟು ನೇರವಾಗಿ ಅಂಗಡಿ ಸಿಬ್ಬಂದಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ.`;
      return `The exact price for ${name} will need to be confirmed by our shop staff. Please call or message directly.`;
    },
    qtyChanged(product, qty, lang) {
      const name = product ? product.name : "the item";
      if (lang === "kn") return `✅ ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ. *${name}* ಪ್ರಮಾಣ *${qty}* ಎಂದು ಅಪ್‌ಡೇಟ್ ಮಾಡಲಾಗಿದೆ.`;
      if (lang === "kanglish") return `✅ Got it. *${name}* quantity *${qty}* aagi update madidheeve.`;
      return `✅ Got it! Updated the quantity of *${name}* to *${qty} pcs*.`;
    },
    delivery(lang) {
      if (lang === "kn") return `🚚 ಬ್ಯಾಂಗ್ಲೋರ್‌ಪೇಟ್ ಒಳಗೆ ಬಲ್ಕ್ ಆರ್ಡರ್‌ಗಳಿಗೆ ಡೆಲಿವರಿ ಲಭ್ಯ. ದಯವಿಟ್ಟು ದೃಢಪಡಿಸಲು ಅಂಗಡಿ ಸಿಬ್ಬಂದಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ.`;
      return `🚚 Delivery is available for bulk orders within Bangarapet. Our staff will confirm the details with you shortly.`;
    },
    escalate(lang) {
      if (lang === "kn") return `ನಿಮ್ಮ ಸಮಸ್ಯೆ ನಮ್ಮ ಸಿಬ್ಬಂದಿಗೆ ರವಾನೆ ಮಾಡಲಾಗಿದೆ. ಅವರು ಶೀಘ್ರದಲ್ಲಿ ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸುತ್ತಾರೆ. ಅಸೌಕರ್ಯಕ್ಕೆ ಕ್ಷಮಿಸಿ. 🙏`;
      return `We're sorry to hear that. Your message has been flagged for our shop staff who will get in touch with you shortly. 🙏`;
    },
    noInfo(lang) {
      if (lang === "kn") return `ಈ ವಿಷಯ ಬಗ್ಗೆ ನಾವು ಖಚಿತ ಮಾಹಿತಿ ನೀಡಲು ಸಾಧ್ಯವಿಲ್ಲ. ನಮ್ಮ ಸಿಬ್ಬಂದಿ ದೃಢಪಡಿಸುತ್ತಾರೆ.`;
      return `We don't have enough information to answer that right now. Our staff will confirm and get back to you shortly.`;
    },
    fallback(lang) {
      if (lang === "kn") return `ಧನ್ಯವಾದ. ನಿಮ್ಮ ಸಂದೇಶ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ಇನ್ನೇನಾದರೂ ಅಗತ್ಯವಿದ್ದರೆ ಕೇಳಿ. 🙏`;
      return `Thank you for your message! Is there anything specific you need — products, availability, or pricing? 😊`;
    }
  };

  /* ----------------------------------------------------------------
     CORE PROCESSING ENGINE
  ---------------------------------------------------------------- */
  function processMessage(phone, text, msgId) {
    const thread = store.getThread(phone);

    // -- Idempotency: skip already processed messages --
    if (msgId && thread.seenIds.includes(msgId)) {
      return { reply: null, status: thread.status, duplicate: true };
    }
    if (msgId) {
      thread.seenIds = [...thread.seenIds.slice(-49), msgId];
    }

    const cleanText = text.trim();
    const lang = detectLang(cleanText);
    thread.lang = lang;

    // Record incoming message
    thread.messages.push({
      id: msgId || Date.now().toString(),
      role: "customer",
      text: cleanText,
      ts: Date.now()
    });

    let reply = null;
    let newStatus = "auto_replied";
    let needsEscalation = false;

    /* ---- 1. Check Escalation Triggers ---- */
    if (INTENT.COMPLAINT.test(cleanText) || INTENT.PAYMENT.test(cleanText)) {
      needsEscalation = true;
      reply = T.escalate(lang);
      newStatus = "needs_attention";
    }

    /* ---- 2. Greeting ---- */
    else if (INTENT.GREETING.test(cleanText) && cleanText.length < 30) {
      reply = T.greet(lang);
    }

    /* ---- 3. Thanks ---- */
    else if (INTENT.THANKS.test(cleanText) && cleanText.length < 40) {
      reply = T.thanks(lang);
    }

    /* ---- 4. Timing Query ---- */
    else if (INTENT.TIMING_QUERY.test(cleanText)) {
      reply = T.timing(lang);
    }

    /* ---- 5. Location Query ---- */
    else if (INTENT.LOCATION_QUERY.test(cleanText)) {
      reply = T.location(lang);
    }

    /* ---- 6. Delivery Query ---- */
    else if (INTENT.DELIVERY_QUERY.test(cleanText)) {
      reply = T.delivery(lang);
    }

    /* ---- 7. Anaphora / Quantity Change ---- */
    else if (INTENT.ANAPHORA_QTY.test(cleanText)) {
      const qtyMatch = cleanText.match(/(\d+)/);
      const newQty = qtyMatch ? parseInt(qtyMatch[1]) : null;
      if (newQty && thread.activeItem) {
        // Update draft item qty
        const draftIdx = thread.draftItems.findIndex(i => i.product?.id === thread.activeItem.id);
        if (draftIdx >= 0) {
          thread.draftItems[draftIdx].qty = newQty;
        }
        thread.activeQty = newQty;
        reply = T.qtyChanged(thread.activeItem, newQty, lang);
      } else if (newQty) {
        reply = T.qtyChanged(null, newQty, lang);
      } else {
        reply = T.fallback(lang);
      }
    }

    /* ---- 8. Quantity-only follow-up (e.g. "change it to 25") ---- */
    else if (INTENT.QTY_CHANGE.test(cleanText)) {
      const qtyMatch = cleanText.match(/(\d+)/);
      const newQty = qtyMatch ? parseInt(qtyMatch[1]) : null;
      if (newQty && thread.activeItem) {
        const draftIdx = thread.draftItems.findIndex(i => i.product?.id === thread.activeItem.id);
        if (draftIdx >= 0) thread.draftItems[draftIdx].qty = newQty;
        thread.activeQty = newQty;
        reply = T.qtyChanged(thread.activeItem, newQty, lang);
      } else {
        reply = T.fallback(lang);
      }
    }

    /* ---- 9. Bare number as follow-up quantity ---- */
    else if (INTENT.FOLLOW_UP_QTY.test(cleanText) && thread.activeItem) {
      const newQty = extractQty(cleanText);
      if (newQty) {
        const draftIdx = thread.draftItems.findIndex(i => i.product?.id === thread.activeItem.id);
        if (draftIdx >= 0) thread.draftItems[draftIdx].qty = newQty;
        thread.activeQty = newQty;
        reply = T.qtyChanged(thread.activeItem, newQty, lang);
      }
    }

    /* ---- 10. Price Query ---- */
    else if (INTENT.PRICE_QUERY.test(cleanText)) {
      // Try to find product in current text
      let prods = findProducts(cleanText);
      // Fall back to active item
      if (!prods.length && thread.activeItem) prods = [thread.activeItem];
      if (prods.length) {
        if (prods[0].price) {
          reply = T.priceInfo(prods[0], lang);
        } else {
          reply = T.priceUnknown(prods[0].name, lang);
        }
      } else {
        reply = T.noInfo(lang);
      }
    }

    /* ---- 11. Availability Query ---- */
    else if (INTENT.AVAILABILITY.test(cleanText)) {
      let prods = findProducts(cleanText);
      const size = extractSize(cleanText);
      // Fall back to active item if pronouns used
      if (!prods.length && /\b(it|that|the|this|itu|adhu|adu|avaru)\b/i.test(cleanText) && thread.activeItem) {
        prods = [thread.activeItem];
      }
      if (!prods.length && thread.activeItem) prods = [thread.activeItem];
      if (prods.length) {
        // Use product's stock field as ground truth
        const p = prods[0];
        if (p.stock === true) {
          reply = T.available(p, size, lang);
        } else if (p.stock === false) {
          reply = T.notAvailable(p.name, lang);
        } else {
          reply = T.noInfo(lang);
        }
      } else {
        reply = T.noInfo(lang);
      }
    }

    /* ---- 12. Order Requirement / Product Request ---- */
    else if (INTENT.ORDER_REQ.test(cleanText) || findProducts(cleanText).length > 0) {
      const items = extractItems(cleanText);
      if (items.length) {
        // Update draftItems & activeItem
        for (const item of items) {
          if (item.products.length) {
            const existing = thread.draftItems.findIndex(d => d.product?.id === item.products[0].id);
            if (existing >= 0) {
              thread.draftItems[existing].qty = item.qty || thread.draftItems[existing].qty;
            } else {
              thread.draftItems.push({
                product: item.products[0],
                qty: item.qty,
                size: item.size,
                unit: item.unit,
                raw: item.raw
              });
            }
            // Set last mentioned product as active
            thread.activeItem = item.products[0];
            thread.activeQty = item.qty;
          }
        }
        reply = T.orderAck(items, lang);
      } else {
        reply = T.fallback(lang);
      }
    }

    /* ---- 13. Fallback ---- */
    else {
      reply = T.fallback(lang);
    }

    // Record outgoing message
    if (reply) {
      if (!reply.includes("M N Enterprises") && !reply.includes("────────────────────────")) {
        reply = reply + WA_AUTO_FOOTER;
      }
      thread.messages.push({
        id: "auto_" + Date.now(),
        role: "auto",
        text: reply,
        ts: Date.now(),
        isAuto: true
      });
    }

    thread.status = newStatus;
    thread.lastUpdated = Date.now();
    store.saveThread(thread);

    return {
      reply,
      status: newStatus,
      needsEscalation,
      thread,
      duplicate: false
    };
  }

  /* ----------------------------------------------------------------
     PUBLIC API
  ---------------------------------------------------------------- */
  return {
    /**
     * Main entry: process an incoming customer message.
     * @param {string} phone  - Customer phone number (international format, no +)
     * @param {string} text   - Message text
     * @param {string} msgId  - Unique message ID for deduplication (optional)
     * @returns {{ reply, status, needsEscalation, thread, duplicate }}
     */
    handleMessage(phone, text, msgId) {
      return processMessage(phone, text, msgId);
    },

    /** Get all conversation threads for admin view */
    getThreads() {
      return store.allThreads();
    },

    /** Get a single thread by phone */
    getThread(phone) {
      return store.getThread(phone);
    },

    /** Toggle autopilot on/off for a thread */
    setAutoPilot(phone, enabled) {
      const thread = store.getThread(phone);
      thread.autoPilot = enabled;
      store.saveThread(thread);
    },

    /** Mark a thread as handed over to staff */
    handOver(phone) {
      const thread = store.getThread(phone);
      thread.status = "handed_over";
      thread.autoPilot = false;
      store.saveThread(thread);
    },

    /** Staff sends a manual reply — records it in thread */
    staffReply(phone, text) {
      const thread = store.getThread(phone);
      thread.messages.push({
        id: "staff_" + Date.now(),
        role: "staff",
        text,
        ts: Date.now(),
        isAuto: false
      });
      if (thread.status === "needs_attention") thread.status = "handed_over";
      thread.lastUpdated = Date.now();
      store.saveThread(thread);
    },

    /** Convert draft items to a confirmed order object */
    confirmOrder(phone) {
      const thread = store.getThread(phone);
      if (!thread.draftItems.length) return null;
      const order = {
        id: "waord_" + Date.now(),
        phone,
        customerName: thread.customerName,
        items: thread.draftItems,
        confirmedAt: new Date().toISOString(),
        source: "whatsapp"
      };
      // Save to mn_orders & alert admin
      try {
        const orders = JSON.parse(localStorage.getItem("mn_orders") || "[]");
        orders.unshift(order);
        localStorage.setItem("mn_orders", JSON.stringify(orders.slice(0,100)));

        const alertPayload = {
          id: order.id,
          name: order.customerName || "WhatsApp Customer",
          phone: order.phone || "",
          total: (order.items || []).reduce((s, x) => s + (Number(x.price) || 0) * (Number(x.qty) || 1), 0),
          slot: "WhatsApp Direct Order",
          itemsCount: (order.items || []).length,
          itemsSummary: (order.items || []).map(x => `${x.qty}× ${x.name}`).slice(0, 3).join(", "),
          time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
          timestamp: Date.now()
        };
        localStorage.setItem("mn_admin_new_order_alert", JSON.stringify(alertPayload));
        try { window.dispatchEvent(new CustomEvent("mn_order_alert", { detail: alertPayload })); } catch(e){}
      } catch(e) {}
      thread.draftItems = [];
      thread.status = "handed_over";
      store.saveThread(thread);
      return order;
    },

    /** Delete a thread */
    deleteThread(phone) {
      const d = store.get();
      delete d[phone];
      store.save(d);
    },

    /** Clear all threads (reset) */
    clearAll() {
      store.save({});
    },

    /** Expose SHOP constants for UI */
    SHOP
  };
})();

// Make available globally (for Node.js exports if using server.js)
if (typeof module !== "undefined") module.exports = WA_ENGINE;
