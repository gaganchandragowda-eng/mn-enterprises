/* =================================================================
   M N ENTERPRISES — PRODUCT CATALOGUE DATA
   products.js  (v3 — verified e-commerce catalog with real images & specs)
   ================================================================= */

const CATS = [
  { id:"lighting",   name:"Lighting & Bulbs",   icon:`<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>` },
  { id:"plumbing",   name:"Pipes & Fittings",   icon:`<path d="M3 6h18M3 12h18M3 18h18"/>` },
  { id:"electrical", name:"Wires & Switches",   icon:`<path d="M13 2L4 14h7l-1 8 9-12h-7z" stroke-linejoin="round"/>` },
  { id:"pumps",      name:"Pumps & Tanks",      icon:`<path d="M12 2C8 7 6 10.5 6 14a6 6 0 0012 0c0-3.5-2-7-6-12z"/><path d="M9 17.5a3 3 0 006 0"/>` },
  { id:"cctv",       name:"CCTV & Security",    icon:`<rect x="2" y="6" width="14" height="12" rx="2"/><path d="M16 10l6-3v10l-6-3"/>` },
  { id:"network",    name:"WiFi & Networking",  icon:`<path d="M12 20l.01.01M8.5 16.5a5 5 0 017 0M5 13a10 10 0 0114 0M2 9.5a15 15 0 0120 0"/>` }
];

const SEED_PRODUCTS = [
  /* ===== LIGHTING & BULBS ===== */
  {
    id: "p22",
    cat: "lighting",
    brand: "GM Modular",
    name: "GM 9W LED Bulb B22 (Cool Day White)",
    specTag: "9W · B22 Base · 6500K",
    mrp: 100,
    price: 50,
    stock: true,
    rating: 4.8,
    reviews: 142,
    img: "assets/img/products/gm-led-bulb-9w.jpg",
    desc: "Energy-efficient GM 9 Watt LED bulb designed for Indian household voltages. Delivering 900 lumens of crisp 6500K cool daylight with up to 85% energy savings over incandescent lamps. Comes with standard B22 bayonet base that fits all standard ceiling and wall holders.",
    highlights: [
      "Special store price ₹50 (MRP ₹100 — Flat 50% discount)",
      "High lumen efficacy: 100 lm/Watt with 6500K Cool White light",
      "Standard B22 base fits standard Indian home sockets",
      "Surge protection up to 3.5kV against voltage fluctuations",
      "2-Year manufacturer replacement warranty"
    ],
    specs: {
      "Brand": "GM Modular",
      "Power Consumption": "9 Watts",
      "Cap / Base": "B22 (Standard Bayonet)",
      "Color Temperature": "6500K Cool Day White",
      "Luminous Flux": "900 Lumens",
      "Operating Voltage": "220V - 240V AC, 50Hz",
      "Warranty": "2 Years Replacement",
      "Origin": "Made in India"
    },
    keywords: ["gm", "bulb", "led bulb", "9w", "9 watt", "9 watts", "gm bulb", "cool white", "b22"]
  },
  {
    id: "p23",
    cat: "lighting",
    brand: "GM Modular",
    name: "GM Emergency Inverter LED Bulb (9W Rechargeable)",
    specTag: "9W · 4-Hour Backup · Inverter Bulb",
    mrp: 750,
    price: 620,
    stock: true,
    rating: 4.7,
    reviews: 89,
    img: "assets/img/products/gm-emergency-bulb.jpg",
    desc: "Smart GM rechargeable inverter LED bulb that stays on during power cuts automatically. Equipped with high-capacity Lithium-ion battery providing 4 hours of continuous backup light. Charges automatically while the regular light switch is ON.",
    highlights: [
      "Automatic ON instantly when mains power cuts off",
      "Built-in 2200mAh Lithium-ion battery provides 3.5 - 4 hours backup",
      "Works as normal 9W bulb and charges simultaneously",
      "Overcharging and deep-discharge battery protection",
      "Standard B22 base fits regular home bulb holders"
    ],
    specs: {
      "Brand": "GM Modular",
      "Wattage": "9 Watts",
      "Battery Type": "Rechargeable Lithium-Ion (2200mAh)",
      "Backup Time": "Up to 4 Hours",
      "Charging Time": "8 - 10 Hours on normal AC",
      "Base Type": "B22",
      "Warranty": "1 Year Replacement"
    },
    keywords: ["gm emergency", "emergency bulb", "inverter bulb", "backup light", "rechargeable bulb", "power cut"]
  },
  {
    id: "p24",
    cat: "lighting",
    brand: "Sturlite",
    name: "Sturlite Emergency LED Light (8W Inverter Backup)",
    specTag: "8W · 5-Hour Backup · Li-ion",
    mrp: 900,
    price: 750,
    stock: true,
    rating: 4.6,
    reviews: 64,
    img: "assets/img/products/sturlite-emergency-bulb.jpg",
    desc: "Heavy-duty Sturlite 8W emergency inverter lighting fitting. Designed for commercial shops, offices, and homes needing dependable illumination through load shedding and power interruptions.",
    highlights: [
      "High grade Sturlite driver with fast charging circuit",
      "5 hours uninterrupted cool daylight emergency illumination",
      "Eco-mode dimming to extend emergency battery runtime",
      "Fire-retardant polycarbonate housing"
    ],
    specs: {
      "Brand": "Sturlite",
      "Wattage": "8 Watts",
      "Backup Time": "4.5 to 5 Hours",
      "Battery": "Li-ion High Grade Cell",
      "Color Temperature": "6500K Cool White",
      "Warranty": "1 Year"
    },
    keywords: ["sturlite", "sturlite emergency", "emergency light", "sturlite bulb", "backup"]
  },
  {
    id: "p25",
    cat: "lighting",
    brand: "Philips",
    name: "Philips LED Tube Light 20W T8 (4 Feet / 1200mm)",
    specTag: "20W · 4 Feet · 2000 Lumens",
    mrp: 520,
    price: 430,
    stock: true,
    rating: 4.9,
    reviews: 178,
    img: "assets/img/products/philips-tube-light.jpg",
    desc: "Philips CorePro LED tube light 20 Watt delivering 2000 lumens of glare-free, uniform light. Direct replacement for old 36W/40W fluorescent tubelights with 50% energy savings. Built-in driver with no flicker.",
    highlights: [
      "Genuine Philips lighting with superior eye-comfort technology",
      "Direct 220V connection — no choke or starter required",
      "Extremely long lifespan of up to 25,000 burning hours",
      "2-Year Philips warranty"
    ],
    specs: {
      "Brand": "Philips",
      "Length": "4 Feet (1200 mm)",
      "Power": "20 Watts",
      "Lumen Output": "2000 Lumens",
      "Fitting Type": "Batten / T8 Retrofit",
      "Warranty": "2 Years"
    },
    keywords: ["philips", "tube light", "tubelight", "led tube", "philips tube", "4ft tube", "20w"]
  },
  {
    id: "p26",
    cat: "lighting",
    brand: "Sturlite",
    name: "Sturlite 18W Slim LED Batten Tube Light (4 Feet)",
    specTag: "18W · 4 Feet · Slim Batten",
    mrp: 420,
    price: 340,
    stock: true,
    rating: 4.6,
    reviews: 95,
    img: "assets/img/products/sturlite-tube-light.jpg",
    desc: "Sturlite slimline 18W LED batten light with integrated aluminium heat sink and frosted diffuser. Offers wide 140° beam angle ideal for rooms, corridors, kitchens, and retail display racks.",
    highlights: [
      "Sleek architectural slim profile with mounting clips included",
      "High luminous output: 1800 lumens, 6500K bright white",
      "Surge resistant up to 4kV",
      "Great value replacement for traditional tubelights"
    ],
    specs: {
      "Brand": "Sturlite",
      "Length": "4 Feet",
      "Wattage": "18 Watts",
      "Light Color": "6500K Cool White",
      "Housing": "Extruded Aluminium + Polycarbonate",
      "Warranty": "1 Year"
    },
    keywords: ["sturlite tube", "sturlite led", "tubelight", "18w", "slim batten"]
  },
  {
    id: "p27",
    cat: "lighting",
    brand: "Havells / OEM",
    name: "Outdoor LED Street & Flood Light 30W (IP65 Waterproof)",
    specTag: "30W · IP65 · Die-cast Aluminium",
    mrp: 1200,
    price: 950,
    stock: true,
    rating: 4.7,
    reviews: 58,
    img: "assets/img/products/led-street-light.jpg",
    desc: "Heavy-duty 30W IP65 outdoor waterproof LED street and flood light. Die-cast aluminium enclosure with toughened glass lens for street poles, shop fronts, parking compounds, and agricultural pump sheds.",
    highlights: [
      "IP65 Weatherproof & dustproof rating for heavy rain & sun",
      "Die-cast aluminium body for heat dissipation",
      "3000 lumens wide-spread illumination",
      "Pole clamp mount included"
    ],
    specs: {
      "Power": "30 Watts",
      "IP Rating": "IP65 Weatherproof",
      "Luminous Output": "3000 Lumens",
      "Operating Voltage": "140V - 280V AC",
      "Casing": "Die-cast Aluminium",
      "Warranty": "2 Years"
    },
    keywords: ["street light", "flood light", "outdoor light", "30w", "waterproof light", "ip65"]
  },
  {
    id: "p28",
    cat: "lighting",
    brand: "Havells / OEM",
    name: "Heavy-Duty LED Street & Flood Light 50W (IP65)",
    specTag: "50W · IP65 · 5000 Lumens",
    mrp: 1800,
    price: 1450,
    stock: true,
    rating: 4.8,
    reviews: 73,
    img: "assets/img/products/led-street-light.jpg",
    desc: "Ultra-bright 50W LED flood / street light delivering 5000 lumens of daylight white illumination. Designed for warehouses, large shop signs, farmhouses, and street lighting.",
    highlights: [
      "5000 lumens ultra-high brightness",
      "Heavy finned aluminium heat sink for thermal stability",
      "IP65 water & dust resistance",
      "High surge protection (up to 4kV)"
    ],
    specs: {
      "Power": "50 Watts",
      "IP Rating": "IP65",
      "Lumens": "5000 Lumens",
      "Voltage": "100V - 270V AC",
      "Warranty": "2 Years"
    },
    keywords: ["street light", "50w", "flood light", "outdoor led", "50w street"]
  },

  /* ===== PIPES & PLUMBING FITTINGS ===== */
  {
    id: "p29",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC 90° Elbow, 1 inch (Schedule 40)",
    specTag: '1" Socket · 90° Bend · ISI',
    mrp: 28,
    price: 22,
    stock: true,
    rating: 4.9,
    reviews: 210,
    img: "assets/img/products/pvc-elbow.jpg",
    desc: "Precision injection-moulded 1 inch PVC 90-degree elbow fitting for domestic cold water plumbing and agricultural piping networks. ISI certified high tensile PVC.",
    highlights: [
      'Standard 1" solvent cement socket on both ends',
      "Leak-proof, smooth interior wall minimizes pressure drop",
      "Corrosion-proof and chemical resistant",
      "ISI marked Schedule 40 standard"
    ],
    specs: {
      "Fitting Type": "90° Elbow Bend",
      "Nominal Size": '1 Inch (25mm)',
      "Material": "Rigid PVC (Unplasticized)",
      "Connection": "Solvent Weld Socket",
      "Standard": "IS: 4985 / ASTM D2466"
    },
    keywords: ["pvc elbow", '1 inch elbow', '1" elbow', "elbow 1 inch", "pvc bend", "pvc fitting"]
  },
  {
    id: "p30",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC 90° Elbow, 3/4 inch",
    specTag: '3/4" Socket · 90° Bend · ISI',
    mrp: 22,
    price: 17,
    stock: true,
    rating: 4.8,
    reviews: 185,
    img: "assets/img/products/pvc-elbow.jpg",
    desc: "Standard 3/4 inch PVC 90 degree elbow for bathroom, kitchen, and garden cold water lines. Durable rigid PVC that resists scale buildup and leakage.",
    highlights: [
      '3/4" dual socket for seamless solvent cementing',
      "High impact strength and UV stabilized",
      "ISI certified quality"
    ],
    specs: {
      "Fitting Type": "90° Elbow",
      "Size": '3/4 Inch (20mm)',
      "Material": "PVC",
      "Standard": "ISI Certified"
    },
    keywords: ["pvc elbow", '3/4 inch elbow', '3/4" elbow', "elbow 3/4", "pvc bend"]
  },
  {
    id: "p31",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC 90° Elbow, 1/2 inch",
    specTag: '1/2" Socket · 90° Bend',
    mrp: 15,
    price: 11,
    stock: true,
    rating: 4.7,
    reviews: 130,
    img: "assets/img/products/pvc-elbow.jpg",
    desc: "1/2 inch PVC 90° elbow fitting for compact household water branch lines, wash basins, and water purifier connections.",
    highlights: [
      '1/2" socket both ends',
      "Precise moulding for quick solvent weld",
      "Clean white finish"
    ],
    specs: { "Size": '1/2 Inch (15mm)', "Material": "PVC", "Fitting": "90° Elbow" },
    keywords: ["pvc elbow", '1/2 inch elbow', "half inch elbow", "elbow half inch"]
  },
  {
    id: "p32",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC 90° Elbow, 2 inch (Heavy-Duty)",
    specTag: '2" Socket · Heavy Flow',
    mrp: 48,
    price: 38,
    stock: true,
    rating: 4.8,
    reviews: 92,
    img: "assets/img/products/pvc-elbow.jpg",
    desc: "Heavy-duty 2 inch PVC 90 degree elbow for main inlet water lines, agricultural borewell distribution, and commercial drainage.",
    highlights: ['2" heavy duty bore', "Thick wall construction for high water pressure", "ISI certified"],
    specs: { "Size": '2 Inch (50mm)', "Material": "Heavy-Duty PVC", "Fitting": "90° Elbow" },
    keywords: ["pvc elbow", '2 inch elbow', '2" elbow', "large elbow"]
  },
  {
    id: "p33",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC Equal Tee, 1 inch (T-Junction)",
    specTag: '1" Equal Tee · 3-Way Socket',
    mrp: 35,
    price: 27,
    stock: true,
    rating: 4.8,
    reviews: 145,
    img: "assets/img/products/pvc-tee.jpg",
    desc: 'Equal 1" bore 3-way T-junction fitting for branching cold water PVC pipelines. Precision-engineered socket joints for zero leakage.',
    highlights: ['3 × 1" sockets for clean right-angle branching', "High pressure tolerance", "ISI marked PVC"],
    specs: { "Type": "Equal Tee", "Size": '1 Inch', "Material": "PVC", "Standard": "ISI" },
    keywords: ["pvc tee", '1 inch tee', '1" tee', "tee fitting", "pvc t", "equal tee"]
  },
  {
    id: "p34",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC Equal Tee, 3/4 inch",
    specTag: '3/4" Equal Tee · 3-Way Socket',
    mrp: 26,
    price: 20,
    stock: true,
    rating: 4.8,
    reviews: 122,
    img: "assets/img/products/pvc-tee.jpg",
    desc: '3/4" equal bore PVC T-junction connector fitting for domestic water line branching to faucets, showers, and water tanks.',
    highlights: ['3 × 3/4" equal sockets', "Smooth interior ensures steady water flow", "ISI approved"],
    specs: { "Type": "Equal Tee", "Size": '3/4 Inch', "Material": "PVC" },
    keywords: ["pvc tee", '3/4 tee', "tee 3/4", '3/4 inch tee']
  },
  {
    id: "p35",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC Collar / Socket Coupler, 1 inch",
    specTag: '1" Straight Coupler · ISI',
    mrp: 18,
    price: 13,
    stock: true,
    rating: 4.9,
    reviews: 160,
    img: "assets/img/products/pvc-collar.jpg",
    desc: 'Straight socket coupler / collar for connecting two 1" PVC pipe lengths end-to-end. Internal pipe stop collar ensures equal insertion depth and a completely leak-proof bond.',
    highlights: ['1" socket to socket straight connection', "Built-in internal pipe stop", "Guaranteed leak-free joint with PVC solvent"],
    specs: { "Type": "Straight Coupler / Collar", "Size": '1 Inch', "Material": "PVC", "Standard": "ISI" },
    keywords: ["pvc collar", "pvc coupler", "pvc socket", "socket coupler", '1 inch collar']
  },
  {
    id: "p36",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: "PVC Collar / Socket Coupler, 3/4 inch",
    specTag: '3/4" Straight Coupler · ISI',
    mrp: 14,
    price: 10,
    stock: true,
    rating: 4.8,
    reviews: 140,
    img: "assets/img/products/pvc-collar.jpg",
    desc: '3/4" PVC pipe joiner socket coupler collar. Connects 3/4 inch domestic water supply pipes securely.',
    highlights: ['3/4" straight socket joiner', "Durable thick wall construction", "ISI marked"],
    specs: { "Type": "Straight Coupler", "Size": '3/4 Inch', "Material": "PVC" },
    keywords: ["pvc collar", "3/4 collar", "pvc socket", "coupler 3/4"]
  },
  {
    id: "p37",
    cat: "plumbing",
    brand: "Astral / Ashirvad",
    name: "CPVC 90° Elbow, 1 inch (Hot & Cold Water)",
    specTag: '1" CPVC · Rated to 93°C · SDR 11',
    mrp: 45,
    price: 36,
    stock: true,
    rating: 4.9,
    reviews: 190,
    img: "assets/img/products/cpvc-elbow.jpg",
    desc: "Cream-coloured CPVC (Chlorinated Polyvinyl Chloride) 90-degree elbow fitting for hot and cold potable water lines. SDR 11 standard, handles temperatures up to 93°C from solar water heaters and geysers.",
    highlights: [
      "Withstands high temperature up to 93°C without softening",
      "SDR-11 pressure rated for geysers and solar water lines",
      "Lead-free, non-toxic, safe for drinking water",
      "ASTM D2846 / IS 15778 standard certified"
    ],
    specs: {
      "Fitting": "90° Elbow",
      "Size": '1 Inch (25mm)',
      "Material": "CPVC (Chlorinated PVC)",
      "Temperature Rating": "Up to 93°C",
      "Standard": "ASTM D2846 / SDR 11"
    },
    keywords: ["cpvc elbow", '1 inch cpvc', 'cpvc 90', "hot cold elbow", "astral cpvc", "ashirvad cpvc"]
  },
  {
    id: "p38",
    cat: "plumbing",
    brand: "Astral / Ashirvad",
    name: "CPVC 90° Elbow, 3/4 inch",
    specTag: '3/4" CPVC · Rated to 93°C',
    mrp: 36,
    price: 29,
    stock: true,
    rating: 4.8,
    reviews: 165,
    img: "assets/img/products/cpvc-elbow.jpg",
    desc: "3/4 inch CPVC 90 degree elbow for bathroom shower, basin, and hot water pipeline routing.",
    highlights: ['3/4" SDR-11 CPVC fitting', "High thermal resistance for solar and geyser water", "100% leak-proof with CPVC solvent"],
    specs: { "Size": '3/4 Inch (20mm)', "Material": "CPVC", "Max Temp": "93°C" },
    keywords: ["cpvc elbow", '3/4 cpvc', 'cpvc 3/4 elbow', "cpvc bend"]
  },
  {
    id: "p39",
    cat: "plumbing",
    brand: "Astral / Ashirvad",
    name: "CPVC Equal Tee, 1 inch",
    specTag: '1" CPVC Tee · Hot & Cold',
    mrp: 55,
    price: 44,
    stock: true,
    rating: 4.8,
    reviews: 110,
    img: "assets/img/products/cpvc-tee.jpg",
    desc: '1" equal bore CPVC 3-way T-junction fitting for branching hot and cold water plumbing networks.',
    highlights: ['3 × 1" sockets for branching', "Temperature resistant up to 93°C", "Food grade and anti-scaling"],
    specs: { "Type": "Equal Tee", "Size": '1 Inch', "Material": "CPVC", "Standard": "SDR 11" },
    keywords: ["cpvc tee", '1 inch cpvc tee', "cpvc t", "hot cold tee"]
  },
  {
    id: "p40",
    cat: "plumbing",
    brand: "Astral / Ashirvad",
    name: "CPVC Equal Tee, 3/4 inch",
    specTag: '3/4" CPVC Tee · Hot & Cold',
    mrp: 42,
    price: 33,
    stock: true,
    rating: 4.8,
    reviews: 95,
    img: "assets/img/products/cpvc-tee.jpg",
    desc: '3/4 inch CPVC equal tee connector fitting for hot water branching to taps and shower mixers.',
    highlights: ['3 × 3/4" sockets', "High-pressure rated for multi-storey buildings", "Smooth inner surface"],
    specs: { "Size": '3/4 Inch', "Material": "CPVC", "Pressure Rating": "SDR 11" },
    keywords: ["cpvc tee", '3/4 cpvc tee', 'cpvc 3/4 t']
  },
  {
    id: "p41",
    cat: "plumbing",
    brand: "Supreme / Astral",
    name: 'CPVC Hot & Cold Water Pipe, 1" (3m Length)',
    specTag: '1" × 3m · SDR 11 · 93°C Rated',
    mrp: 640,
    price: 565,
    stock: true,
    rating: 4.9,
    reviews: 135,
    img: "assets/img/products/cpvc-pipes.jpg",
    desc: 'Rigid CPVC 1" diameter hot and cold water pipe in 3-metre length. SDR-11 pressure rated, handles temperatures up to 93°C. Non-corroding, anti-bacterial, and certified for drinking water.',
    highlights: ['3m length, 1" outer diameter', "SDR-11 standard for geysers & solar heating", "Zero corrosion or scaling over lifetime", "ISI and ASTM D2846 compliant"],
    specs: { "Diameter": '1 Inch (25mm)', "Length": "3 Metres", "Material": "CPVC", "Pressure Rating": "SDR 11" },
    keywords: ["cpvc pipe", "hot cold pipe", '1 inch cpvc', "cpvc tube"]
  },
  {
    id: "p7",
    cat: "plumbing",
    brand: "Supreme / Finolex",
    name: 'Agricultural PVC Pipe, 4" (3m Length)',
    specTag: '4" × 3m · Schedule 40 · ISI',
    mrp: 820,
    price: 730,
    stock: true,
    rating: 4.8,
    reviews: 115,
    img: "assets/img/products/cpvc-pipes.jpg",
    desc: 'Heavy-duty 4" rigid PVC pipe for borewell discharge, agricultural field irrigation, and main drainage. High tensile strength, smooth internal surface for maximum water discharge volume.',
    highlights: ['4" diameter, 3-metre length', "High burst pressure rating for pump lines", "Resistant to soil acids and agricultural chemicals"],
    specs: { "Diameter": '4 Inch (110mm)', "Length": "3 Metres", "Material": "Rigid PVC", "Standard": "IS 4985" },
    keywords: ["pvc pipe", "agri pipe", '4 inch pipe', "borewell pipe", "irrigation pipe"]
  },
  {
    id: "p42",
    cat: "plumbing",
    brand: "Zoloto / Leader",
    name: "Brass 90° Elbow, 1 inch (BSP Threaded)",
    specTag: '1" Heavy Brass · BSP Threaded',
    mrp: 145,
    price: 115,
    stock: true,
    rating: 4.9,
    reviews: 125,
    img: "assets/img/products/brass-elbow.jpg",
    desc: 'Heavy-duty forged solid brass 90-degree elbow fitting with 1" precision BSP male/female threads. Essential for geyser inlets, pressure booster pumps, and borewell connections.',
    highlights: [
      "100% solid forged brass with mirror polish",
      "Precision cut leak-free BSP threads",
      "Resists rust, lime scale, and extreme water pressure",
      "High temperature and vibration resistant"
    ],
    specs: {
      "Type": "90° Threaded Elbow",
      "Size": '1 Inch BSP',
      "Material": "Solid Forged Brass",
      "Finish": "Machined Brass",
      "Pressure Test": "Up to 25 Bar"
    },
    keywords: ["brass elbow", "brass fitting", '1 inch brass', "brass bend", "geyser fitting"]
  },
  {
    id: "p43",
    cat: "plumbing",
    brand: "Zoloto / Leader",
    name: "Brass 90° Elbow, 3/4 inch (BSP Threaded)",
    specTag: '3/4" Brass · BSP Threaded',
    mrp: 110,
    price: 88,
    stock: true,
    rating: 4.8,
    reviews: 104,
    img: "assets/img/products/brass-elbow.jpg",
    desc: '3/4 inch heavy brass elbow with BSP threads. Corrosion-resistant connector for bathroom taps, shower valves, and water heaters.',
    highlights: ['3/4" BSP threaded brass elbow', "Heavy wall thickness prevents cracking under wrench torque", "Anti-corrosion brass alloy"],
    specs: { "Size": '3/4 Inch BSP', "Material": "Solid Brass", "Application": "Plumbing & Geyser" },
    keywords: ["brass elbow", '3/4 brass', "brass 90 3/4", '3/4 brass elbow']
  },
  {
    id: "p44",
    cat: "plumbing",
    brand: "Supreme / Astral",
    name: "Brass MTA (Male Thread Adapter), 1 inch",
    specTag: '1" Brass Thread · CPVC/PVC Socket',
    mrp: 80,
    price: 64,
    stock: true,
    rating: 4.9,
    reviews: 88,
    img: "assets/img/products/brass-adapter.jpg",
    desc: 'Hybrid brass male thread adapter (MTA) with heavy-duty forged brass male thread insert and durable polymer socket. Connects solvent-weld pipes directly to metal valves and pumps.',
    highlights: [
      '1" male BSP brass thread insert',
      "Moulded brass insert won't spin or pull out under pressure",
      "Direct connection to pumps, brass valves, and water tanks"
    ],
    specs: {
      "Type": "Male Thread Adapter (MTA)",
      "Thread Size": '1 Inch BSP Male',
      "Insert Material": "Solid Brass",
      "Body Material": "Engineered Polymer / CPVC"
    },
    keywords: ["mta", "brass mta", "male adapter", "brass adapter", '1 inch mta']
  },
  {
    id: "p45",
    cat: "plumbing",
    brand: "Supreme / Astral",
    name: "Brass FTA (Female Thread Adapter), 1 inch",
    specTag: '1" Brass Female Thread · Socket',
    mrp: 80,
    price: 64,
    stock: true,
    rating: 4.8,
    reviews: 79,
    img: "assets/img/products/brass-adapter.jpg",
    desc: 'Brass female thread adapter (FTA) 1 inch BSP. Allows screwing in male bib cocks, angle valves, and shower arms to plastic supply pipes.',
    highlights: ['1" internal brass female threads', "Heavy brass insert prevents thread stripping", "Leak-tight seal with Teflon tape"],
    specs: { "Type": "Female Thread Adapter (FTA)", "Size": '1 Inch BSP Female', "Material": "Brass + Polymer" },
    keywords: ["fta", "female adapter", "brass fta", "thread adapter", '1 inch fta']
  },
  {
    id: "p10",
    cat: "pumps",
    brand: "Flowken / Sintex",
    name: "Flowken Water Storage Tank, 500L (Triple Layer)",
    specTag: "500 Litres · 3-Layer UV Protected",
    mrp: 4300,
    price: 3899,
    stock: true,
    rating: 4.9,
    reviews: 94,
    img: "assets/img/products/water-tank-500l.jpg",
    desc: "Premium 500-litre triple-layer overhead water storage tank. Made with 100% virgin food-grade polymer with outer carbon black UV barrier and inner antimicrobial white layer to keep stored water pure and cool.",
    highlights: [
      "Triple layer construction: UV protective outer + foam insulation + food-grade inner",
      "Keeps water cooler in summer and resists algae growth",
      "Pre-fitted threaded brass inlet and outlet fittings",
      "25-Year warranty against UV degradation and cracking"
    ],
    specs: {
      "Capacity": "500 Litres",
      "Layers": "3-Layer UV Protected",
      "Material": "100% Virgin LLDPE Food-Grade",
      "Warranty": "25 Years",
      "Lid Type": "Threaded Roto-Moulded Screw Lid"
    },
    keywords: ["water tank", "storage tank", "500 litre", "flowken", "overhead tank", "sintex"]
  },

  /* ===== WIRES & ELECTRICAL ===== */
  {
    id: "p1",
    cat: "electrical",
    brand: "KEI Wires",
    name: "KEI Homecab-FR Wire, 1.0 sq.mm (90m Coil)",
    specTag: "1.0 sq.mm · 90m · Flame Retardant",
    mrp: 1250,
    price: 1090,
    stock: true,
    rating: 4.9,
    reviews: 168,
    img: "assets/img/products/kei-wire-coil.jpg",
    desc: "KEI Homecab flame-retardant (FR) single-core copper house wire, 1.0 sq.mm gauge in 90-metre coil roll. Oxygen-free 99.97% pure electrolytic copper for lighting circuits and ceiling fans.",
    highlights: [
      "100% electrolytic grade pure copper (>100% conductivity)",
      "Flame Retardant (FR) PVC insulation self-extinguishes fire",
      "ISI certified to IS: 694 standard with genuine hologram",
      "Ideal for lighting, LED fittings, and fan circuits"
    ],
    specs: {
      "Brand": "KEI Industries Ltd",
      "Conductor Size": "1.0 sq.mm",
      "Length": "90 Metres",
      "Insulation": "Flame Retardant (FR) PVC",
      "Voltage Grade": "Up to 1100 Volts",
      "Standard": "IS: 694, ISI Marked"
    },
    keywords: ["kei", "wire", "cable", "1sqmm", "1.0 sq mm", "house wire", "copper wire", "kei wire"]
  },
  {
    id: "p2",
    cat: "electrical",
    brand: "KEI Wires",
    name: "KEI Homecab-FR Wire, 1.5 sq.mm (90m Coil)",
    specTag: "1.5 sq.mm · 90m · Standard Gauge",
    mrp: 1750,
    price: 1550,
    stock: true,
    rating: 4.9,
    reviews: 182,
    img: "assets/img/products/kei-wire-coil.jpg",
    desc: "The standard gauge for residential switchboard and 6A power socket circuits. KEI 1.5 sq.mm FR multi-strand copper wire offers high flexibility and superior heat resistance.",
    highlights: [
      "Standard gauge for house wiring switchboards and 6A plug points",
      "High grade FR insulation withstands up to 70°C operating temperature",
      "RoHS compliant and lead-free",
      "90 metres genuine sealed pack"
    ],
    specs: {
      "Brand": "KEI",
      "Conductor": "1.5 sq.mm Electrolytic Copper",
      "Length": "90 Metres",
      "Current Rating": "Up to 14 Amps",
      "Certification": "ISI Marked"
    },
    keywords: ["kei", "wire", "1.5sqmm", "1.5 sq mm", "plug wire", "switchboard wire"]
  },
  {
    id: "p3",
    cat: "electrical",
    brand: "KEI Wires",
    name: "KEI Homecab-FR Wire, 2.5 sq.mm (90m Coil)",
    specTag: "2.5 sq.mm · 90m · 16A Power Loads",
    mrp: 2850,
    price: 2550,
    stock: true,
    rating: 4.9,
    reviews: 140,
    img: "assets/img/products/kei-wire-coil.jpg",
    desc: "Heavy-duty 2.5 sq.mm copper wire for 16A power outlets, geysers, air conditioners, microwaves, and water pumps. Resists overheating and voltage drops.",
    highlights: [
      "For geysers, ACs, microwave ovens, and power sockets",
      "Prevents voltage drops over long residential conduit runs",
      "Flame retardant self-extinguishing PVC sheath",
      "Full 90-metre ISI certified coil"
    ],
    specs: {
      "Brand": "KEI",
      "Gauge": "2.5 sq.mm",
      "Length": "90 Metres",
      "Current Capacity": "Up to 20 Amps",
      "Standard": "IS: 694"
    },
    keywords: ["kei", "wire", "2.5sqmm", "geyser wire", "ac wire", "power wire"]
  },
  {
    id: "p5",
    cat: "electrical",
    brand: "GM Modular",
    name: "GM Modular Switch & 3-Pin Socket Combo (6A)",
    specTag: "6A Combo Plate · Gloss White · Brass Contacts",
    mrp: 220,
    price: 185,
    stock: true,
    rating: 4.8,
    reviews: 118,
    img: "assets/img/products/modular-switch.jpg",
    desc: "Premium GM Modular combined switch and 3-pin shuttered socket module plate. Made of flame-resistant virgin polycarbonate with solid brass contacts and child-safety shutter.",
    highlights: [
      "Smooth silent rocker switch mechanism",
      "Child safety socket shutter protects against accidental touch",
      "Rust-proof heavy brass internal terminal screws",
      "Glossy UV-stabilized white finish will not turn yellow"
    ],
    specs: {
      "Brand": "GM Modular",
      "Rating": "6 Amps, 240V AC",
      "Configuration": "1 Switch + 1 Socket with Combined Plate",
      "Contacts": "Solid Brass",
      "Material": "Polycarbonate",
      "Warranty": "5 Years"
    },
    keywords: ["switch", "socket", "modular", "gm switch", "plug point", "6a socket"]
  },
  {
    id: "p6",
    cat: "electrical",
    brand: "L&T / Legrand",
    name: "Single-Pole 16A MCB (Miniature Circuit Breaker)",
    specTag: "16A · C-Curve · 10kA Breaking",
    mrp: 420,
    price: 355,
    stock: true,
    rating: 4.9,
    reviews: 154,
    img: "assets/img/products/mcb-breaker.jpg",
    desc: "Single-pole 16 Amp C-Curve miniature circuit breaker for residential and commercial distribution boards. Fast-acting bi-metallic thermal and magnetic trip mechanism protects wiring from short circuits and overloads.",
    highlights: [
      "Reliable short-circuit and overload protection for home circuits",
      "10kA breaking capacity with silver-graphite contacts",
      "Standard 35mm DIN rail mounting clip",
      "ISI certified to IS/IEC 60898-1"
    ],
    specs: {
      "Current Rating": "16 Amps",
      "Poles": "Single Pole (1P)",
      "Trip Characteristic": "C Curve",
      "Breaking Capacity": "10 kA",
      "Standard": "IS/IEC 60898-1"
    },
    keywords: ["mcb", "circuit breaker", "16 amp", "breaker", "legrand", "lt mcb"]
  },

  /* ===== PUMPS ===== */
  {
    id: "p12",
    cat: "pumps",
    brand: "Sharp Pumps",
    name: "Sharp Ultra Gold Self-Priming Monoblock Pump, 1HP",
    specTag: "1HP (0.75kW) · 35m Head · 100% Copper",
    mrp: 4600,
    price: 4099,
    stock: true,
    rating: 4.9,
    reviews: 86,
    img: "assets/img/products/water-pump.jpg",
    desc: "High-efficiency Sharp 1HP self-priming regenerative water pump. 100% electrolytic copper winding with thermal overload protector (TOP) and forged brass impeller for lifting water to overhead tanks up to 4 storeys high.",
    highlights: [
      "100% pure copper motor winding with Class-F insulation",
      "Forged brass impeller prevents rusting and seizing",
      "High suction capacity with self-priming up to 8 metres",
      "Lifts water up to 35 metres head (suitable for G+3 buildings)",
      "2-Year manufacturer warranty"
    ],
    specs: {
      "Brand": "Sharp Ultra Gold",
      "Motor Power": "1.0 HP (0.75 kW)",
      "Head Range": "6 to 35 Metres",
      "Discharge Rate": "Up to 3200 Litres/Hour",
      "Pipe Size (Suction/Delivery)": '25mm × 25mm (1" × 1")',
      "Winding": "100% Pure Copper",
      "Warranty": "2 Years"
    },
    keywords: ["sharp pump", "water pump", "1hp pump", "motor pump", "monoblock pump", "self priming pump"]
  },

  /* ===== CCTV & SECURITY ===== */
  {
    id: "p15",
    cat: "cctv",
    brand: "CP Plus / Hikvision",
    name: "2MP Full HD Dome CCTV Camera (Night Vision IR 30m)",
    specTag: "2MP 1080P · 30m IR · Weatherproof",
    mrp: 1450,
    price: 1190,
    stock: true,
    rating: 4.8,
    reviews: 112,
    img: "assets/img/products/cctv-camera.jpg",
    desc: "High definition 2 Megapixel 1080P dome security surveillance camera. Built-in infrared array for clear night vision up to 30 metres even in total darkness. Compact ceiling dome housing suitable for shops, godowns, and homes.",
    highlights: [
      "1080P Full HD video clarity with wide-angle 2.8mm lens",
      "Smart IR Night Vision up to 30 metres",
      "Supports 4 video outputs: AHD / TVI / CVI / CVBS",
      "Vandal-resistant housing with 3-axis adjustment",
      "2-Year manufacturer warranty"
    ],
    specs: {
      "Resolution": "2 Megapixel (1920 × 1080)",
      "Lens": "2.8mm Wide Angle (103° FOV)",
      "Night Vision": "Smart IR 30 Metres",
      "Output": "4-in-1 (AHD / HDCVI / HDTVI / Analogue)",
      "Warranty": "2 Years"
    },
    keywords: ["cctv", "camera", "dome camera", "security camera", "cp plus", "hikvision", "2mp"]
  },

  /* ===== NETWORKING ===== */
  {
    id: "p19",
    cat: "network",
    brand: "TP-Link",
    name: "TP-Link Archer AC1200 Dual-Band Gigabit WiFi Router",
    specTag: "1200 Mbps · 4 Antennas · MU-MIMO",
    mrp: 2400,
    price: 1850,
    stock: true,
    rating: 4.8,
    reviews: 130,
    img: "assets/img/products/wifi-router.jpg",
    desc: "High-speed AC1200 dual-band WiFi router with 4 high-gain external antennas and Gigabit WAN/LAN ports. Delivers up to 867 Mbps on 5GHz band and 300 Mbps on 2.4GHz for whole-home 4K streaming and CCTV NVR connectivity.",
    highlights: [
      "AC1200 Dual-band: 867 Mbps (5GHz) + 300 Mbps (2.4GHz)",
      "4 high-gain antennas with Beamforming for maximum wall penetration",
      "Full Gigabit Ethernet ports for optical fiber broadband",
      "Easy setup with Tether mobile app or web browser",
      "3-Year TP-Link warranty"
    ],
    specs: {
      "Brand": "TP-Link",
      "Model": "Archer AC1200",
      "Speed": "Up to 1167 Mbps Concurrent",
      "Antennas": "4 × 5dBi External Omnidirectional",
      "Ethernet Ports": "1 × Gigabit WAN + 4 × Gigabit LAN",
      "Warranty": "3 Years"
    },
    keywords: ["wifi router", "router", "tp link", "tplink", "dual band", "archer", "gigabit router"]
  }
];

const PRODUCTS = {
  STORAGE_KEY: "mn_products_v5",
  getAll() {
    try {
      const s = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "null");
      return (s && s.length) ? s : SEED_PRODUCTS.slice();
    } catch {
      return SEED_PRODUCTS.slice();
    }
  },
  save(list) {
    try { localStorage.setItem(this.STORAGE_KEY, JSON.stringify(list)); } catch(e){}
  },
  findById(id) {
    return this.getAll().find(p => p.id === id);
  },
  byCat(cat) {
    return cat === "all" ? this.getAll() : this.getAll().filter(p => p.cat === cat);
  },
  getByCategory(cat) {
    return this.byCat(cat);
  },
  getBrands() {
    const brands = new Set();
    this.getAll().forEach(p => {
      if (p.brand && p.brand.trim()) {
        // Normalize compound brand names
        const b = p.brand.split("/")[0].trim();
        if (b) brands.add(b);
      }
    });
    return Array.from(brands).sort();
  },
  search(rawQ) {
    if (!rawQ || !rawQ.trim()) return this.getAll();
    let q = rawQ.toLowerCase().trim();

    // Kannada & Kanglish synonym / conversational stopword replacement
    const synonymMap = {
      "beku": "",
      "bekagide": "",
      "ideya": "",
      "idya": "",
      "rate": "",
      "bele": "",
      "eshtu": "",
      "kodi": "",
      "need": "",
      "want": "",
      "looking for": "",
      "price": "",
      "taare": "wire",
      "vaaru": "wire",
      "current": "emergency bulb",
      "powercut": "inverter bulb emergency",
      "deepa": "bulb light",
      "balb": "bulb",
      "gum": "solvent cement",
      "solution": "solvent cement",
      "pisunu": "solvent",
      "kannu": "cctv camera",
      "cam": "cctv camera",
      "pumpu": "pump",
      "motar": "pump",
      "motor": "pump"
    };

    // Replace known synonyms
    Object.entries(synonymMap).forEach(([word, replacement]) => {
      const reg = new RegExp(`\\b${word}\\b`, "gi");
      q = q.replace(reg, replacement);
    });

    const tokens = q.trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return this.getAll();

    return this.getAll().filter(p => {
      const hay = [
        p.name,
        p.brand || "",
        p.specTag || "",
        p.desc || "",
        (p.keywords || []).join(" "),
        (CATS.find(c => c.id === p.cat) || { name: "" }).name
      ].join(" ").toLowerCase();

      // Multi-token match: every token must match in the product text
      return tokens.every(tok => hay.includes(tok));
    });
  },
  getCompatibility(id) {
    const p = this.findById(id);
    if (!p) return null;
    if (p.compatibility) return p.compatibility;

    // Intelligent default compatibility according to product category and specs
    if (p.cat === "plumbing") {
      if (p.name.includes("CPVC")) {
        return "Compatible with standard 3/4\" or 1\" CPVC SDR-11 piping networks (hot & cold water). Requires CPVC solvent cement for permanent leakproof joints.";
      }
      return "Compatible with standard Schedule-40 PVC pipes (cold water & drainage). Standard ISI solvent-weld sockets.";
    }
    if (p.cat === "electrical") {
      if (p.name.includes("Switch") || p.name.includes("Socket")) {
        return "Fits all standard GM Modular switch plates and surface/concealed metal gang boxes.";
      }
      if (p.name.includes("Wire")) {
        return "ISI certified FR (Flame Retardant) copper conductor wire. Compatible with 20mm & 25mm PVC electrical conduit pipes.";
      }
      if (p.name.includes("MCB")) {
        return "Mounts directly onto standard 35mm DIN rails inside distribution boards (DB). Compatible with domestic single-phase supply.";
      }
    }
    if (p.cat === "lighting") {
      if (p.name.includes("B22")) {
        return "Standard Indian B22 bayonet cap. Fits all regular ceiling bulb holders and angle wall batten holders.";
      }
      if (p.name.includes("Tube")) {
        return "Direct 220V-240V AC connection. Retrofits standard 4-ft batten brackets without requiring an external choke or starter.";
      }
    }
    if (p.cat === "cctv") {
      return "Compatible with CP Plus, Dahua, and Hikvision HD DVR systems via coaxial 3+1 or Cat6 video balun cable.";
    }
    if (p.cat === "pumps") {
      return "Standard 1-inch outlet suitable for HDPE / PVC delivery pipes and 220V AC domestic power connection.";
    }
    return "Authorised hardware fitting guaranteed 100% genuine with local warranty at M N Enterprises Bangarapet.";
  },
  getRelated(id) {
    const p = this.findById(id);
    if (!p) return [];
    const all = this.getAll();

    // Map companion products
    const relatedMap = {
      // Bulbs -> companion bulbs & switches
      "p22": ["p23", "p25", "p40"],
      "p23": ["p22", "p24", "p40"],
      "p24": ["p23", "p26", "p40"],
      "p25": ["p26", "p22", "p40"],
      "p26": ["p25", "p22", "p40"],
      "p27": ["p28", "p37", "p42"],
      "p28": ["p27", "p37", "p42"],

      // Plumbing pipes & fittings -> elbows, tees, solvent
      "p29": ["p30", "p31", "p36"], // PVC elbow -> tee, mta, solvent
      "p30": ["p29", "p31", "p36"], // PVC tee -> elbow, mta, solvent
      "p31": ["p29", "p30", "p36"], // PVC mta -> elbow, tee, solvent
      "p32": ["p33", "p34", "p35", "p36"], // CPVC elbow -> brass elbow, pipe, solvent
      "p33": ["p32", "p34", "p35", "p36"], // CPVC brass elbow -> elbow, mta, pipe, solvent
      "p34": ["p32", "p33", "p35", "p36"], // CPVC brass mta
      "p35": ["p32", "p33", "p34", "p36"], // CPVC pipe -> elbows, tees, solvent
      "p36": ["p35", "p32", "p33", "p29"], // CPVC solvent -> pipes & fittings

      // Electrical wires & switches
      "p37": ["p38", "p40", "p42"], // 1.5mm wire -> 2.5mm wire, switches, MCB
      "p38": ["p37", "p39", "p41", "p42"], // 2.5mm wire -> 1.5mm, 4.0mm, power socket, MCB
      "p39": ["p38", "p42", "p41"], // 4.0mm wire -> 2.5mm, MCB
      "p40": ["p41", "p37", "p22"], // 6A switch -> 16A socket, wire, bulb
      "p41": ["p40", "p38", "p42"], // 16A combo -> 6A switch, 2.5mm wire, MCB
      "p42": ["p37", "p38", "p40"], // MCB -> wires & switches

      // CCTV & Networking
      "p43": ["p44", "p45", "p19"], // Dome camera -> DVR, power supply, Cat6
      "p44": ["p43", "p45", "p19"], // DVR -> Camera, power supply
      "p45": ["p43", "p44", "p19"], // Power supply -> Camera, DVR
      "p46": ["p47", "p19"],        // WiFi router -> Cat6 cable
      "p47": ["p46", "p43", "p44"], // Cat6 cable -> Router, CCTV
      "p12": ["p35", "p42", "p38"]  // Pump -> CPVC pipe, MCB, 2.5mm wire
    };

    const targetIds = relatedMap[id] || [];
    let list = targetIds.map(tid => all.find(x => x.id === tid)).filter(Boolean);
    if (!list.length) {
      // Fallback: pick 3 items in same category
      list = all.filter(x => x.cat === p.cat && x.id !== p.id).slice(0, 3);
    }
    return list.slice(0, 4);
  },
  catIcon(catId) {
    return (CATS.find(x => x.id === catId) || { icon: "" }).icon;
  },
  catName(catId) {
    return (CATS.find(x => x.id === catId) || { name: catId }).name;
  },
  add(p) {
    const l = this.getAll();
    l.push(p);
    this.save(l);
  },
  update(p) {
    const l = this.getAll();
    const i = l.findIndex(x => x.id === p.id);
    if (i >= 0) { l[i] = p; this.save(l); }
  },
  remove(id) {
    this.save(this.getAll().filter(x => x.id !== id));
  }
};
