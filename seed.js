import dotenv from "dotenv";
import mongoose from "mongoose";
import Product from "./models/Product.js";

dotenv.config();

const mongoUri = process.env.MONGO_URI || "";

function makeImage(label) {
  const safeLabel = String(label || "Product").trim() || "Product";
  const initials = safeLabel
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0ea5e9" />
          <stop offset="100%" stop-color="#1d4ed8" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" fill="url(#bg)" />
      <circle cx="540" cy="110" r="82" fill="rgba(255,255,255,0.12)" />
      <circle cx="120" cy="380" r="120" fill="rgba(255,255,255,0.08)" />
      <rect x="180" y="118" width="280" height="170" rx="24" fill="rgba(255,255,255,0.18)" />
      <text x="320" y="220" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="700" fill="#ffffff">${initials}</text>
      <text x="320" y="342" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="600" fill="#e0f2fe">${safeLabel}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const rawProducts = [
  // Audio
  ["Wireless Bluetooth Headphones", 2499, "Bluetooth audio with clear sound, soft ear cushions, and long battery life.", "wireless bluetooth headphones studio product photo white background", 35],
  ["Noise Cancelling Earbuds", 3299, "Compact earbuds with deep bass, ANC, and a pocket friendly charging case.", "noise cancelling earbuds studio product photo white background", 42],
  ["Portable Bluetooth Speaker", 1899, "Portable speaker with punchy sound, strong battery backup, and splash resistance.", "portable bluetooth speaker studio product photo white background", 28],
  ["Gaming Headset Pro", 2799, "Over ear gaming headset with surround sound and noise reducing boom mic.", "gaming headset pro studio product photo white background", 22],
  ["Soundbar Mini", 4599, "Slim soundbar for TV and desktop setups with rich stereo output.", "mini soundbar studio product photo white background", 16],
  ["USB Podcast Microphone", 2199, "USB mic for podcasts, meetings, and streaming with clear voice pickup.", "usb podcast microphone studio product photo white background", 18],
  ["Smart Watch Active", 3999, "Fitness smartwatch with heart rate tracking, notifications, and multiple sport modes.", "smart watch active studio product photo white background", 31],
  ["Fitness Band Lite", 1499, "Lightweight fitness band with step tracking, sleep monitoring, and color display.", "fitness band lite studio product photo white background", 50],
  ["True Wireless Earbuds Max", 2899, "Low latency earbuds with touch controls and balanced sound for daily use.", "true wireless earbuds max studio product photo white background", 37],
  ["Neckband Earphones", 1199, "Comfort fit neckband earphones with magnetic buds and long battery life.", "neckband earphones studio product photo white background", 46],

  // Mobile
  ["5G Smartphone X1", 17999, "Fast 5G smartphone with AMOLED display, smooth performance, and great cameras.", "5g smartphone studio product photo white background", 14],
  ["Budget Smartphone A2", 8999, "Affordable smartphone with large screen, solid battery, and reliable daily performance.", "budget smartphone studio product photo white background", 21],
  ["Tablet 10 Inch Plus", 13999, "Large screen tablet for reading, browsing, classes, and entertainment.", "10 inch tablet studio product photo white background", 19],
  ["Phone Fast Charger 33W", 899, "Fast wall charger with safe charging support for modern devices.", "33w phone fast charger studio product photo white background", 70],
  ["Magnetic Power Bank 10000", 2199, "Portable power bank with 10000 mAh capacity and magnetic wireless charging.", "magnetic 10000mah power bank studio product photo white background", 29],
  ["USB C Cable Braided", 349, "Durable braided USB C cable for charging and fast data transfer.", "braided usb c cable studio product photo white background", 95],
  ["Phone Tripod Stand", 699, "Adjustable tripod stand for mobile photography, reels, and video calls.", "phone tripod stand studio product photo white background", 40],
  ["Mobile Gimbal Stabilizer", 5499, "Handheld gimbal stabilizer for smooth mobile video recording.", "mobile gimbal stabilizer studio product photo white background", 12],
  ["Wireless Charging Pad", 999, "Minimal charging pad with stable wireless charging and slim design.", "wireless charging pad studio product photo white background", 33],
  ["Car Phone Holder", 499, "Dashboard phone holder with firm grip and easy one hand placement.", "car phone holder studio product photo white background", 52],

  // Computing
  ["Laptop 14 Inch i5", 52999, "Portable laptop with Intel i5 performance for work, study, and browsing.", "14 inch laptop studio product photo white background", 9],
  ["Mechanical Keyboard RGB", 2499, "Mechanical keyboard with tactile keys, RGB lighting, and solid frame.", "mechanical keyboard rgb studio product photo white background", 27],
  ["Wireless Mouse Silent", 799, "Silent click wireless mouse with ergonomic shape and stable tracking.", "wireless silent mouse studio product photo white background", 48],
  ["Full HD Monitor 24 Inch", 8999, "24 inch monitor with crisp Full HD display and slim bezels.", "24 inch full hd monitor studio product photo white background", 17],
  ["Laptop Stand Aluminum", 1299, "Strong aluminum stand that improves laptop airflow and desk posture.", "aluminum laptop stand studio product photo white background", 39],
  ["Webcam 1080p Pro", 1899, "1080p webcam for online meetings, classes, and content recording.", "1080p webcam studio product photo white background", 26],
  ["External SSD 1TB", 6999, "Fast portable SSD with 1TB storage for files, photos, and backups.", "external ssd 1tb studio product photo white background", 15],
  ["USB C Hub 7 in 1", 1599, "Multiport USB C hub with HDMI, USB, SD card, and charging support.", "usb c 7 in 1 hub studio product photo white background", 30],
  ["Printer All in One", 10999, "All in one printer for printing, scanning, and home office tasks.", "all in one printer studio product photo white background", 8],
  ["Desk Lamp LED", 999, "LED desk lamp with adjustable brightness and eye comfort lighting.", "led desk lamp studio product photo white background", 41],

  // Smart home and home use
  ["Smart Bulb Color", 699, "App controlled smart bulb with color scenes and scheduling support.", "smart color bulb studio product photo white background", 64],
  ["WiFi Security Camera", 2499, "Indoor WiFi camera with night vision, alerts, and app monitoring.", "wifi security camera studio product photo white background", 24],
  ["Video Doorbell", 4999, "Smart video doorbell with motion alerts and two way audio.", "smart video doorbell studio product photo white background", 11],
  ["Smart Plug Mini", 799, "Compact smart plug with remote control, timer, and voice support.", "smart plug mini studio product photo white background", 58],
  ["Air Purifier Compact", 6499, "Compact air purifier with multi stage filtration for cleaner indoor air.", "compact air purifier studio product photo white background", 13],
  ["Robot Vacuum Cleaner", 14999, "Automatic robot vacuum for daily floor cleaning with smart navigation.", "robot vacuum cleaner studio product photo white background", 7],
  ["Tower Fan Remote", 5499, "Slim tower fan with remote control, timer, and quiet airflow.", "tower fan with remote studio product photo white background", 14],
  ["Room Heater Ceramic", 2799, "Ceramic room heater with quick warm up and compact safe design.", "ceramic room heater studio product photo white background", 20],
  ["Dehumidifier Home", 5999, "Home dehumidifier that helps reduce dampness and improve room comfort.", "home dehumidifier studio product photo white background", 10],
  ["Mattress Topper Queen", 3499, "Soft queen mattress topper that adds comfort and support to your bed.", "queen mattress topper studio product photo white background", 18],

  // Kitchen
  ["Air Fryer 4L", 4599, "4 liter air fryer for crispy meals with less oil and easy controls.", "4l air fryer studio product photo white background", 21],
  ["Mixer Grinder 750W", 3199, "750 watt mixer grinder for blending, grinding, and kitchen prep.", "750w mixer grinder studio product photo white background", 19],
  ["Electric Kettle Glass", 1299, "Glass electric kettle with fast boiling and elegant countertop design.", "glass electric kettle studio product photo white background", 34],
  ["Induction Cooktop Slim", 2399, "Slim induction cooktop with quick heating and easy touch settings.", "slim induction cooktop studio product photo white background", 23],
  ["Coffee Maker Drip", 2799, "Drip coffee maker for fresh daily brews with simple one touch use.", "drip coffee maker studio product photo white background", 17],
  ["Non Stick Cookware Set", 3499, "Durable non stick cookware set for everyday cooking with easy cleanup.", "non stick cookware set studio product photo white background", 20],
  ["Stainless Steel Water Bottle", 599, "Insulated steel bottle that keeps drinks hot or cold for hours.", "stainless steel water bottle studio product photo white background", 72],
  ["Knife Set Premium", 1599, "Premium kitchen knife set with sharp blades and ergonomic handles.", "premium knife set studio product photo white background", 27],
  ["Food Storage Container Set", 999, "Multi size food containers for neat storage and meal prep.", "food storage container set studio product photo white background", 43],
  ["Lunch Box Thermal", 799, "Thermal lunch box that helps keep meals fresh and ready to enjoy.", "thermal lunch box studio product photo white background", 49],

  // Fitness
  ["Yoga Mat Comfort", 899, "Comfortable yoga mat with non slip grip for workouts and stretching.", "comfortable yoga mat studio product photo white background", 38],
  ["Adjustable Dumbbells 20kg", 6999, "Space saving adjustable dumbbells for home strength training.", "adjustable dumbbells 20kg studio product photo white background", 12],
  ["Resistance Bands Set", 699, "Exercise band set for warm up, mobility, and strength workouts.", "resistance bands set studio product photo white background", 54],
  ["Treadmill Home Run", 28999, "Home treadmill with preset modes and foldable design for compact storage.", "home treadmill studio product photo white background", 5],
  ["Massage Gun Deep Tissue", 3299, "Deep tissue massage gun for post workout recovery and muscle relief.", "deep tissue massage gun studio product photo white background", 18],
  ["Protein Shaker Bottle", 399, "Easy mix shaker bottle for gym drinks and daily hydration.", "protein shaker bottle studio product photo white background", 67],
  ["Skipping Rope Speed", 299, "Lightweight speed rope for cardio, warm up, and endurance training.", "speed skipping rope studio product photo white background", 58],
  ["Exercise Bike Foldable", 12999, "Foldable exercise bike for low impact home cardio sessions.", "foldable exercise bike studio product photo white background", 9],
  ["Running Shoes Men", 2499, "Lightweight running shoes with cushioned sole and breathable upper.", "mens running shoes studio product photo white background", 32],
  ["Running Shoes Women", 2499, "Comfortable running shoes with support, grip, and everyday style.", "womens running shoes studio product photo white background", 30],

  // Fashion
  ["Cotton T Shirt Men", 499, "Soft cotton tee with clean fit for daily casual wear.", "mens cotton t shirt studio product photo white background", 80],
  ["Casual Shirt Men", 899, "Smart casual shirt with comfortable fabric and versatile style.", "mens casual shirt studio product photo white background", 45],
  ["Slim Fit Jeans Men", 1499, "Slim fit denim jeans with stretch comfort and everyday durability.", "mens slim fit jeans studio product photo white background", 36],
  ["Kurti Printed Women", 1199, "Printed kurti with elegant pattern and breathable fabric for daily wear.", "printed womens kurti studio product photo white background", 33],
  ["Handbag Classic Women", 1899, "Classic handbag with spacious compartments and polished finish.", "classic womens handbag studio product photo white background", 25],
  ["Sneakers Unisex Street", 2199, "Street style sneakers with cushioned comfort and clean modern look.", "unisex street sneakers studio product photo white background", 29],
  ["Analog Watch Leather", 1599, "Analog wristwatch with leather strap and timeless minimalist style.", "analog watch leather strap studio product photo white background", 24],
  ["Polarized Sunglasses", 999, "Polarized sunglasses with UV protection and lightweight frame.", "polarized sunglasses studio product photo white background", 47],
  ["Backpack Daily Carry", 1299, "Daily backpack with laptop sleeve, water resistant fabric, and roomy storage.", "daily carry backpack studio product photo white background", 40],
  ["Wallet RFID Leather", 799, "Leather wallet with RFID protection and slim pocket friendly build.", "rfid leather wallet studio product photo white background", 51],

  // Personal care
  ["Hair Dryer Ionic", 1799, "Ionic hair dryer with multiple heat settings and quick drying power.", "ionic hair dryer studio product photo white background", 22],
  ["Hair Straightener Ceramic", 1599, "Ceramic straightener with smooth glide plates and even heat control.", "ceramic hair straightener studio product photo white background", 26],
  ["Trimmer Groom Pro", 1299, "Rechargeable trimmer with precision blades and multiple length settings.", "grooming trimmer studio product photo white background", 39],
  ["Face Wash Vitamin C", 349, "Refreshing face wash with vitamin C for a clean and bright feel.", "vitamin c face wash studio product photo white background", 68],
  ["Sunscreen SPF 50", 499, "Daily sunscreen with SPF 50 and lightweight non greasy texture.", "spf 50 sunscreen studio product photo white background", 60],
  ["Moisturizer Gel Fresh", 449, "Hydrating gel moisturizer with fresh finish for daily skin care.", "gel moisturizer studio product photo white background", 57],
  ["Perfume Aqua Mist", 999, "Fresh aqua fragrance with clean notes for everyday wear.", "aqua mist perfume studio product photo white background", 31],
  ["Beard Care Kit", 899, "Beard care combo with oil, balm, comb, and grooming essentials.", "beard care kit studio product photo white background", 35],
  ["Oral Care Combo", 699, "Oral care set with toothbrushes, floss, and fresh daily essentials.", "oral care combo studio product photo white background", 44],
  ["Electric Toothbrush", 1699, "Electric toothbrush with soft cleaning action and long battery life.", "electric toothbrush studio product photo white background", 28],

  // Travel and outdoor
  ["Cabin Trolley Bag", 3499, "Cabin size trolley bag with smooth wheels and durable shell.", "cabin trolley bag studio product photo white background", 17],
  ["Travel Backpack 45L", 2499, "45 liter travel backpack with multiple compartments and padded support.", "45l travel backpack studio product photo white background", 23],
  ["Camping Tent 2 Person", 3999, "Lightweight two person tent for weekend camping and travel trips.", "2 person camping tent studio product photo white background", 11],
  ["Sleeping Bag Warm", 1999, "Warm sleeping bag with compact roll up design for outdoor stays.", "warm sleeping bag studio product photo white background", 19],
  ["Hiking Shoes Trek", 2999, "Rugged hiking shoes with grip outsole and ankle support.", "trekking hiking shoes studio product photo white background", 21],
  ["Stainless Steel Thermos", 899, "Vacuum insulated thermos for hot tea, coffee, or cold drinks.", "stainless steel thermos studio product photo white background", 36],
  ["Picnic Mat Waterproof", 799, "Waterproof picnic mat that folds easily for outdoor use.", "waterproof picnic mat studio product photo white background", 27],
  ["Flashlight Rechargeable", 699, "Rechargeable flashlight with bright beam and durable body.", "rechargeable flashlight studio product photo white background", 42],
  ["Multi Tool Pocket Kit", 1199, "Pocket multi tool kit for travel, repair work, and outdoor needs.", "pocket multi tool kit studio product photo white background", 24],
  ["Bicycle Helmet SafeRide", 1499, "Lightweight cycling helmet with ventilation and adjustable fit.", "bicycle helmet studio product photo white background", 20],

  // Furniture and decor
  ["Study Chair Ergonomic", 4999, "Ergonomic study chair with lumbar support and adjustable height.", "ergonomic study chair studio product photo white background", 13],
  ["Office Desk 120cm", 6999, "120 cm office desk with spacious top and sturdy metal frame.", "120cm office desk studio product photo white background", 9],
  ["Bookshelf 5 Tier", 3999, "Five tier bookshelf for books, decor, and home organization.", "5 tier bookshelf studio product photo white background", 12],
  ["Bean Bag Lounger", 2499, "Comfortable bean bag lounger for gaming, reading, and relaxing.", "bean bag lounger studio product photo white background", 15],
  ["Wall Clock Minimal", 799, "Minimal wall clock with clean design that suits modern interiors.", "minimal wall clock studio product photo white background", 34],
  ["Table Vase Ceramic", 599, "Ceramic table vase for flowers, shelves, and decorative styling.", "ceramic table vase studio product photo white background", 29],
  ["Bedside Lamp Warm Glow", 1199, "Bedside lamp with warm glow lighting for cozy evening ambience.", "bedside lamp warm glow studio product photo white background", 22],
  ["Curtain Set Blackout", 1799, "Blackout curtain set that improves privacy and blocks sunlight.", "blackout curtain set studio product photo white background", 18],
  ["Storage Organizer Drawer", 999, "Drawer organizer set for clothes, accessories, and neat storage.", "storage organizer drawer studio product photo white background", 37],
  ["Laundry Basket Foldable", 699, "Foldable laundry basket with handles and compact storage design.", "foldable laundry basket studio product photo white background", 33],

  // Miscellaneous
  ["Bluetooth Car Adapter", 899, "Bluetooth car adapter for music streaming and hands free calls.", "bluetooth car adapter studio product photo white background", 41],
  ["Action Camera 4K", 6499, "Compact 4K action camera for travel, biking, and outdoor recording.", "4k action camera studio product photo white background", 10],
  ["Portable Projector Mini", 8999, "Mini projector for movies, presentations, and bedroom entertainment.", "mini portable projector studio product photo white background", 8],
  ["Electric Hand Blender", 1399, "Hand blender for soups, smoothies, and quick kitchen prep.", "electric hand blender studio product photo white background", 26],
  ["Baby Diaper Bag", 1699, "Organized diaper bag with bottle pockets and easy carry design.", "baby diaper bag studio product photo white background", 19],
  ["Pet Feeding Bowl Set", 599, "Feeding bowl set for pets with stable base and easy cleaning.", "pet feeding bowl set studio product photo white background", 46],
  ["Garden Hose Spray Gun", 499, "Spray gun with adjustable flow for garden cleaning and watering.", "garden hose spray gun studio product photo white background", 39],
  ["Art Sketch Pen Set", 799, "Sketch pen set with rich colors for art, journaling, and design work.", "art sketch pen set studio product photo white background", 32],
  ["Kids Learning Tablet Toy", 1499, "Interactive learning tablet toy for letters, numbers, and early play.", "kids learning tablet toy studio product photo white background", 21],
  ["Portable Steam Iron", 1799, "Portable steam iron for wrinkle removal at home or while traveling.", "portable steam iron studio product photo white background", 17]
];

const variantConfigs = [
  {
    label: "Plus",
    priceMultiplier: 1.08,
    stockBoost: 4,
    descriptionSuffix: "Includes a few extra convenience features for everyday use.",
    promptSuffix: "plus edition",
  },
  {
    label: "Pro",
    priceMultiplier: 1.15,
    stockBoost: 3,
    descriptionSuffix: "A higher end version designed for more demanding buyers.",
    promptSuffix: "pro edition",
  },
  {
    label: "Max",
    priceMultiplier: 1.22,
    stockBoost: 2,
    descriptionSuffix: "Built as a premium option with upgraded performance and finish.",
    promptSuffix: "max edition",
  },
  {
    label: "Elite",
    priceMultiplier: 1.3,
    stockBoost: 1,
    descriptionSuffix: "An elevated catalog variant with a more premium appeal.",
    promptSuffix: "elite edition",
  },
];

const products = rawProducts.map(([title, price, description, _prompt, stock]) => ({
  title,
  price,
  description,
  image: makeImage(title),
  stock,
}));

const variantProducts = rawProducts.map(
  ([title, price, description, prompt, stock], index) => {
    const variant = variantConfigs[index % variantConfigs.length];

    return {
      title: `${title} ${variant.label}`,
      price: Math.round(price * variant.priceMultiplier),
      description: `${description} ${variant.descriptionSuffix}`,
      image: makeImage(`${title} ${variant.label}`),
      stock: stock + variant.stockBoost,
    };
  }
);

const allProducts = [...products, ...variantProducts];

async function seed() {
  if (!mongoUri) {
    throw new Error("MONGO_URI is required to run the seed script.");
  }

  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  await Product.deleteMany({});
  console.log("Cleared existing products");

  await Product.insertMany(allProducts);
  console.log(`Inserted ${allProducts.length} products`);
}

seed()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Seed complete");
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
