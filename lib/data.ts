// Static catalogue data for StyleUp — stylists, services, reviews and the
// reference vocabularies used across explore filters and onboarding.

export interface Review {
  id: string;
  author: string;
  rating: number; // 1-5
  date: string; // ISO date
  comment: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number; // GBP, base price before platform fee
  sessionType: SessionType;
}

export type SessionType = "virtual" | "in-person" | "hybrid";

export interface Stylist {
  id: string;
  name: string;
  tagline: string;
  bio: string;
  city: string;
  country: string;
  avatar: string;
  cover: string;
  specialties: string[];
  sessionTypes: SessionType[];
  languages: string[];
  rating: number;
  reviewCount: number;
  sessionsCompleted: number;
  yearsExperience: number;
  startingPrice: number;
  featured: boolean;
  services: Service[];
  reviews: Review[];
}

export const SPECIALTIES = [
  "Capsule Wardrobe",
  "Colour Analysis",
  "Personal Shopping",
  "Occasion & Event",
  "Bridal Styling",
  "Corporate & Executive",
  "Sustainable Fashion",
  "Body Confidence",
  "Wardrobe Detox",
  "Menswear",
] as const;

export const SESSION_TYPES: { value: SessionType; label: string; blurb: string }[] = [
  { value: "virtual", label: "Virtual", blurb: "Video sessions from anywhere in the world." },
  { value: "in-person", label: "In person", blurb: "Meet your stylist in their home city." },
  { value: "hybrid", label: "Hybrid", blurb: "A blend of video planning and in-person shopping." },
];

// Style archetypes surfaced after the quiz to frame recommendations.
export const ARCHETYPES = [
  {
    id: "classic",
    name: "The Classic",
    description: "Timeless, polished and considered. You invest in pieces that outlast trends.",
  },
  {
    id: "creative",
    name: "The Creative",
    description: "Expressive and bold. You treat dressing as a daily act of self-expression.",
  },
  {
    id: "minimalist",
    name: "The Minimalist",
    description: "Clean lines, quiet luxury, and a wardrobe that works as hard as you do.",
  },
  {
    id: "romantic",
    name: "The Romantic",
    description: "Soft textures, flowing silhouettes and details that feel personal.",
  },
  {
    id: "edge",
    name: "The Edge",
    description: "Sharp, modern and unafraid. You like contrast, structure and statement pieces.",
  },
] as const;

function svc(
  id: string,
  name: string,
  description: string,
  durationMinutes: number,
  price: number,
  sessionType: SessionType
): Service {
  return { id, name, description, durationMinutes, price, sessionType };
}

export const STYLISTS: Stylist[] = [
  {
    id: "maya-thompson",
    name: "Maya Thompson",
    tagline: "Your colours, your budget, your actual life.",
    bio: "Maya spent eight years as a buyer before switching to styling people instead of racks. She's known for colour-led capsules that work in real Canadian weather and real budgets — school runs, office days and date nights included. Clients call her honest, warm and scarily accurate.",
    city: "Toronto",
    country: "Canada",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    specialties: ["Colour Analysis", "Capsule Wardrobe", "Body Confidence"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English"],
    rating: 4.9,
    reviewCount: 187,
    sessionsCompleted: 512,
    yearsExperience: 8,
    startingPrice: 85,
    featured: true,
    services: [
      svc("maya-colour", "Colour Analysis", "A 90-minute session that finds your season, with a digital palette you can shop from forever.", 90, 120, "virtual"),
      svc("maya-capsule", "Real-Life Capsule", "We audit what you own and build a 30-piece wardrobe that mixes into 100+ outfits.", 120, 195, "hybrid"),
      svc("maya-refresh", "Season Refresh", "A quick tune-up before a new season — what to keep, add and skip.", 60, 85, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Sarah M.", rating: 5, date: "2026-05-14", comment: "Maya found my colours and suddenly shopping is easy. Best money I've spent on myself in years." },
      { id: "r2", author: "Jenn P.", rating: 5, date: "2026-03-28", comment: "Zero judgement, total transformation. My closet finally makes sense." },
    ],
  },
  {
    id: "jess-carter",
    name: "Jess Carter",
    tagline: "Great style shouldn't require a big city.",
    bio: "Jess styles real people in Winnipeg — teachers, nurses, new mums, retirees — and proves you don't need designer budgets or a downtown postcode to look put together. She's the stylist you text a fitting-room photo to. Practical, kind and allergic to fuss.",
    city: "Winnipeg",
    country: "Canada",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=1200&q=80",
    specialties: ["Body Confidence", "Wardrobe Detox", "Capsule Wardrobe"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English"],
    rating: 4.95,
    reviewCount: 94,
    sessionsCompleted: 246,
    yearsExperience: 6,
    startingPrice: 65,
    featured: true,
    services: [
      svc("jess-detox", "Closet Detox", "Two hours in your closet. We keep what works, release what doesn't, and list what's missing.", 120, 95, "in-person"),
      svc("jess-confidence", "Confidence Reset", "For new chapters — new job, new body, new you. Gentle, practical, transformative.", 90, 80, "virtual"),
      svc("jess-shop", "Shop Together", "We hit Polo Park or wherever you shop. You leave with outfits, not orphans.", 120, 110, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Amanda K.", rating: 5, date: "2026-05-02", comment: "Jess gets that I live in Winnipeg, not a magazine. Everything she picked, I actually wear." },
      { id: "r2", author: "Nicole T.", rating: 5, date: "2026-02-18", comment: "After my second baby I hated getting dressed. Jess fixed that in one afternoon. I cried, honestly." },
    ],
  },
  {
    id: "rachel-kim",
    name: "Rachel Kim",
    tagline: "Fewer pieces, better mornings.",
    bio: "Rachel builds quiet, hardworking wardrobes for busy women on the west coast. Ex-tech, so she understands the 'I have money but no time and everything is a hoodie' problem intimately. Sustainable choices without the lecture.",
    city: "Vancouver",
    country: "Canada",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80",
    specialties: ["Capsule Wardrobe", "Sustainable Fashion", "Wardrobe Detox"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English", "Korean"],
    rating: 4.87,
    reviewCount: 121,
    sessionsCompleted: 330,
    yearsExperience: 7,
    startingPrice: 90,
    featured: false,
    services: [
      svc("rachel-capsule", "The 5-Minute-Morning Capsule", "A wardrobe where everything goes with everything. Decision fatigue, deleted.", 120, 210, "hybrid"),
      svc("rachel-audit", "Wardrobe Audit", "A video walkthrough of your closet with a keep/tailor/release plan.", 75, 90, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Priya R.", rating: 5, date: "2026-04-22", comment: "I get dressed in five minutes now and look better than I did with a full closet." },
      { id: "r2", author: "Dana W.", rating: 4, date: "2026-01-30", comment: "Practical and kind. Wish I'd done this years ago." },
    ],
  },
  {
    id: "andre-silva",
    name: "Andre Silva",
    tagline: "Menswear without the mystery.",
    bio: "Andre helps men who 'don't care about clothes' discover they actually do — they just hated shopping. Fit-first, low-maintenance wardrobes for work, weekends and weddings. He'll meet you at the mall so you never have to go alone again.",
    city: "Toronto",
    country: "Canada",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    specialties: ["Menswear", "Personal Shopping", "Capsule Wardrobe"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English", "Portuguese"],
    rating: 4.84,
    reviewCount: 78,
    sessionsCompleted: 205,
    yearsExperience: 6,
    startingPrice: 75,
    featured: false,
    services: [
      svc("andre-fit", "Fit Fix", "We solve the fit issues holding your whole look back. Includes a tailor referral list.", 75, 95, "virtual"),
      svc("andre-shop", "Shop With Me", "Two hours in the stores. In, out, done for the season.", 120, 140, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Mike D.", rating: 5, date: "2026-05-08", comment: "My girlfriend booked this for me. Now I recommend Andre to other guys unprompted." },
      { id: "r2", author: "Chris L.", rating: 5, date: "2026-03-12", comment: "Two hours of shopping replaced ten years of guessing." },
    ],
  },
  {
    id: "emily-sinclair",
    name: "Emily Sinclair",
    tagline: "Dress like the promotion already happened.",
    bio: "A former magazine market editor, Emily styles New York's rising professionals — first big job, first board seat, first time on stage. She builds authoritative wardrobes that stay comfortable through fourteen-hour days and travel without wrinkling.",
    city: "New York",
    country: "United States",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1521334884684-d80222895322?w=1200&q=80",
    specialties: ["Corporate & Executive", "Capsule Wardrobe", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English"],
    rating: 4.91,
    reviewCount: 163,
    sessionsCompleted: 428,
    yearsExperience: 11,
    startingPrice: 120,
    featured: true,
    services: [
      svc("emily-presence", "Executive Presence", "Command the room. A head-to-toe working wardrobe for leaders.", 90, 185, "virtual"),
      svc("emily-interview", "Big Moment Prep", "Interview, keynote, press day — styled and camera-checked.", 60, 130, "virtual"),
      svc("emily-shop", "Madison Ave in a Morning", "A ruthless, brilliant personal shopping sprint.", 180, 320, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Lauren B.", rating: 5, date: "2026-05-11", comment: "Wore Emily's picks to my final-round interview. Got the job. Coincidence? Maybe. Worth it? Absolutely." },
      { id: "r2", author: "Katie F.", rating: 5, date: "2026-04-01", comment: "She understands what 'senior but not stuffy' means. Rare gift." },
    ],
  },
  {
    id: "danielle-brooks",
    name: "Danielle Brooks",
    tagline: "Main-character energy, on demand.",
    bio: "Danielle came up dressing music-video sets in LA and brings that eye to real people's big moments — birthdays, galas, engagement shoots, red-carpet-adjacent everything. If you want to be looked at, she's your girl. If you want to hide, she'll fix that too.",
    city: "Los Angeles",
    country: "United States",
    avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    specialties: ["Occasion & Event", "Personal Shopping", "Colour Analysis"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English"],
    rating: 4.88,
    reviewCount: 142,
    sessionsCompleted: 366,
    yearsExperience: 9,
    startingPrice: 110,
    featured: true,
    services: [
      svc("dani-event", "Event Styling", "Head-to-toe for the night that matters. Fittings included.", 120, 220, "hybrid"),
      svc("dani-shoot", "Photoshoot Ready", "Engagement, branding, birthday shoot — styled for camera.", 90, 175, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Tiana W.", rating: 5, date: "2026-04-26", comment: "My 30th birthday outfit stopped the room. Danielle is a cheat code." },
      { id: "r2", author: "Maria G.", rating: 4, date: "2026-02-20", comment: "Bold picks I'd never have tried. She was right about every one." },
    ],
  },
  {
    id: "marcus-reid",
    name: "Marcus Reid",
    tagline: "Sharp enough for the boardroom, easy enough for Sunday.",
    bio: "A former college athlete who had to learn dressing a changing body the hard way, Marcus now does it for clients across Chicago. Suiting, smart-casual and the mysterious middle ground — decoded, fitted and photographed so you can repeat it.",
    city: "Chicago",
    country: "United States",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    specialties: ["Menswear", "Corporate & Executive"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English"],
    rating: 4.82,
    reviewCount: 87,
    sessionsCompleted: 231,
    yearsExperience: 7,
    startingPrice: 80,
    featured: false,
    services: [
      svc("marcus-suit", "Suit Sorted", "Find the right suit, the right fit and the tailor to perfect it.", 120, 160, "in-person"),
      svc("marcus-rotation", "The Rotation", "A two-week everyday rotation you can put on without thinking.", 75, 100, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "James O.", rating: 5, date: "2026-05-05", comment: "Finally own a suit that fits. Groomsmen asked for his number." },
      { id: "r2", author: "Derek H.", rating: 4, date: "2026-03-15", comment: "Straightforward, no fluff, great results." },
    ],
  },
  {
    id: "grace-adeyemi",
    name: "Grace Adeyemi",
    tagline: "London's colour whisperer.",
    bio: "Grace trained in colour theory before it was a trend and has analysed over a thousand faces since. Her sessions are famous for the drape reveal — the moment the right colour goes up and the whole room says 'oh'. Warm, exact and completely addictive.",
    city: "London",
    country: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    specialties: ["Colour Analysis", "Occasion & Event", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English", "Yoruba"],
    rating: 4.93,
    reviewCount: 208,
    sessionsCompleted: 585,
    yearsExperience: 12,
    startingPrice: 95,
    featured: true,
    services: [
      svc("grace-colour", "Signature Colour Analysis", "The full drape experience, in person or over video, with a shoppable palette.", 90, 135, "hybrid"),
      svc("grace-palette", "Palette Refresh", "Already know your season? We take it deeper — contrast, combinations, makeup tones.", 60, 95, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Charlotte E.", rating: 5, date: "2026-05-16", comment: "The drape moment is real. I gasped. My mum gasped. Book her." },
      { id: "r2", author: "Adaeze N.", rating: 5, date: "2026-03-03", comment: "Grace found colours for my skin tone that no chart ever did. Life-changing is overused, but…" },
    ],
  },
  {
    id: "hannah-whitfield",
    name: "Hannah Whitfield",
    tagline: "High-street budgets, high-end results.",
    bio: "Hannah is proof you don't need designer prices to look expensive. She works magic on M&S, Zara and charity-shop finds across Manchester, and her wardrobe detoxes are booked weeks out. The most down-to-earth stylist you'll ever meet.",
    city: "Manchester",
    country: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
    specialties: ["Wardrobe Detox", "Capsule Wardrobe", "Body Confidence"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English"],
    rating: 4.89,
    reviewCount: 116,
    sessionsCompleted: 298,
    yearsExperience: 8,
    startingPrice: 60,
    featured: false,
    services: [
      svc("hannah-detox", "The Big Detox", "Three hours, your whole wardrobe, zero mercy, endless kindness.", 180, 120, "in-person"),
      svc("hannah-highstreet", "High Street Hero", "A shoppable plan built entirely from stores you already know.", 75, 70, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Gemma S.", rating: 5, date: "2026-04-18", comment: "Spent £200 on clothes after our session and look like I spent £2,000." },
      { id: "r2", author: "Beth C.", rating: 5, date: "2026-02-27", comment: "Funny, honest and brilliant. Like shopping with your most stylish mate." },
    ],
  },
  {
    id: "tom-ellison",
    name: "Tom Ellison",
    tagline: "Savile Row standards, real-world wardrobes.",
    bio: "Tom apprenticed on Savile Row before going independent, and it shows: he can tell your jacket size across a room. Weddings, work and everything in between, built on fit, fabric and a very calm manner. Grooms fight over his calendar.",
    city: "London",
    country: "United Kingdom",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
    specialties: ["Menswear", "Occasion & Event", "Corporate & Executive"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English"],
    rating: 4.9,
    reviewCount: 132,
    sessionsCompleted: 344,
    yearsExperience: 13,
    startingPrice: 100,
    featured: false,
    services: [
      svc("tom-groom", "Groom & Party", "The groom, the party, the fathers — coordinated and impeccable.", 150, 260, "in-person"),
      svc("tom-tailoring", "Tailoring Consult", "What to buy, what to alter, and exactly what to ask your tailor for.", 60, 110, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Will H.", rating: 5, date: "2026-05-09", comment: "Our wedding photos look like a menswear campaign. Thank you, Tom." },
      { id: "r2", author: "Ollie P.", rating: 5, date: "2026-03-21", comment: "Learned more about fit in one hour than in twenty years of buying suits." },
    ],
  },
  {
    id: "sofia-marchetti",
    name: "Sofia Marchetti",
    tagline: "Milanese elegance, wherever you are.",
    bio: "Sofia has dressed brides and gala guests across Europe for fifteen years, and her video sessions are legendary — clients in Toronto and Texas book her for the Italian eye alone. If the moment is once-in-a-lifetime, this is who you fly in. Or video in.",
    city: "Milan",
    country: "Italy",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80",
    specialties: ["Bridal Styling", "Occasion & Event", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Italian", "English", "French"],
    rating: 4.94,
    reviewCount: 176,
    sessionsCompleted: 451,
    yearsExperience: 15,
    startingPrice: 130,
    featured: true,
    services: [
      svc("sofia-bridal", "Bridal Edit", "From the dress to the going-away look, styled with calm and care.", 180, 380, "hybrid"),
      svc("sofia-occasion", "Occasion Styling", "Galas, milestone birthdays, the wedding you're attending, not starring in.", 90, 180, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Claire H.", rating: 5, date: "2026-04-30", comment: "Planned my whole bridal wardrobe over video from Calgary. Flawless. FLAWLESS." },
      { id: "r2", author: "Vanessa D.", rating: 5, date: "2026-02-14", comment: "Sofia's taste is worth every penny and every time zone." },
    ],
  },
  {
    id: "camille-moreau",
    name: "Camille Moreau",
    tagline: "The French wardrobe, translated for your life.",
    bio: "Camille teaches the thing everyone wants and no one can pin down: effortlessness. A handful of beautiful pieces, worn well, bought once. Her video clients around the world call her sessions 'therapy, but you leave with outfits'.",
    city: "Paris",
    country: "France",
    avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=750&fit=crop&crop=faces&auto=format&q=70",
    cover: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1200&q=80",
    specialties: ["Capsule Wardrobe", "Sustainable Fashion", "Colour Analysis"],
    sessionTypes: ["virtual", "hybrid"],
    languages: ["French", "English"],
    rating: 4.92,
    reviewCount: 148,
    sessionsCompleted: 389,
    yearsExperience: 10,
    startingPrice: 90,
    featured: false,
    services: [
      svc("camille-capsule", "La Garde-Robe", "The classic French capsule — fewer, better, forever — built around your life.", 120, 200, "virtual"),
      svc("camille-edit", "The Edit", "A one-hour video edit of your closet with a Parisian eye.", 60, 90, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Hilary M.", rating: 5, date: "2026-05-01", comment: "Booked from Ottawa for the vibe. The vibe delivered. Ma garde-robe est parfaite." },
      { id: "r2", author: "Olivia G.", rating: 5, date: "2026-03-07", comment: "Camille is the chicest person I've ever spoken to and somehow makes it teachable." },
    ],
  },
];

// ───────────────────────── Profile extras (the vibe) ────────────────────────
// The parts of a complete profile that let a client feel a stylist's aesthetic
// before booking — especially for international video sessions, where the
// profile IS the meeting.
export interface StylistExtras {
  vibes: string[];
  philosophy: string;
  brands: string[];
}

const EXTRAS: Record<string, StylistExtras> = {
  "maya-thompson": {
    vibes: ["Colour-confident", "Real-life ready", "Warm & honest"],
    philosophy: "The right colour does more than a whole new wardrobe.",
    brands: ["Aritzia", "COS", "Banana Republic", "Simons"],
  },
  "jess-carter": {
    vibes: ["Down-to-earth", "Feel-good", "Zero fuss"],
    philosophy: "Style isn't a city thing. It's a you thing.",
    brands: ["Old Navy", "Reitmans", "Marshalls finds", "Roots"],
  },
  "rachel-kim": {
    vibes: ["Quiet luxury", "Minimal", "Effortless"],
    philosophy: "A five-minute morning is the real luxury.",
    brands: ["Everlane", "Oak + Fort", "Toteme", "Uniqlo U"],
  },
  "andre-silva": {
    vibes: ["Fit-first", "Low-maintenance", "Weekend-proof"],
    philosophy: "Most men don't hate clothes. They hate clothes that don't fit.",
    brands: ["Suitsupply", "J.Crew", "Sunspel", "Levi's"],
  },
  "emily-sinclair": {
    vibes: ["Executive polish", "Power minimal", "Travel-proof"],
    philosophy: "Walk in looking like the decision already went your way.",
    brands: ["Theory", "The Row-ish", "Babaton", "Hugo Boss"],
  },
  "danielle-brooks": {
    vibes: ["Statement-making", "Camera-ready", "Bold colour"],
    philosophy: "You're the main character. Dress like the plot depends on it.",
    brands: ["Revolve", "Cult Gaia", "Norma Kamali", "Zara Studio"],
  },
  "marcus-reid": {
    vibes: ["Sharp", "Athletic-friendly", "Straightforward"],
    philosophy: "One great suit, three great shirts, zero excuses.",
    brands: ["Suitsupply", "Bonobos", "Todd Snyder", "Nike (off duty)"],
  },
  "grace-adeyemi": {
    vibes: ["Colour-brave", "Joyful", "Precise"],
    philosophy: "When the right colour goes up, the whole room says 'oh'.",
    brands: ["Roksanda", "Kemi Telford", "ME+EM", "Arket"],
  },
  "hannah-whitfield": {
    vibes: ["High-street hero", "Honest", "Thrift-smart"],
    philosophy: "Looking expensive is a skill, not a budget.",
    brands: ["M&S", "Zara", "COS", "charity-shop gold"],
  },
  "tom-ellison": {
    vibes: ["Tailored", "Timeless", "Calm"],
    philosophy: "Fit is 90% of style. The last 10% is knowing it.",
    brands: ["Drake's", "Private White V.C.", "Marks on Row", "Sunspel"],
  },
  "sofia-marchetti": {
    vibes: ["Old-world glamour", "Romantic", "Once-in-a-lifetime"],
    philosophy: "An occasion is a stage. Dress for the memory, not the mirror.",
    brands: ["Max Mara", "Alessandra Rich", "Self-Portrait", "Zimmermann"],
  },
  "camille-moreau": {
    vibes: ["Parisian ease", "Effortless", "Forever pieces"],
    philosophy: "Style is what remains when you stop trying so hard.",
    brands: ["Sézane", "A.P.C.", "Rouje", "Veja"],
  },
};

export function extrasOf(s: Stylist | string): StylistExtras {
  const id = typeof s === "string" ? s : s.id;
  return (
    EXTRAS[id] ?? {
      vibes: ["Personal", "Considered"],
      philosophy: "Great style is personal. Let's find yours.",
      brands: [],
    }
  );
}

// ─────────────────────────── Service menu ───────────────────────────────
// The marketplace-level menu of what you can book, shown on the landing page.
// Each entry deep-links into explore pre-filtered to the matching specialty.
export const SERVICE_MENU = [
  {
    name: "Colour Analysis",
    specialty: "Colour Analysis",
    from: 100,
    blurb: "Find your season and get a personal palette you can shop from forever.",
  },
  {
    name: "Capsule Wardrobe",
    specialty: "Capsule Wardrobe",
    from: 95,
    blurb: "A tightly edited wardrobe where everything goes with everything.",
  },
  {
    name: "Shopping Trip",
    specialty: "Personal Shopping",
    from: 100,
    blurb: "Your stylist joins you in the stores. Two hours, zero wasted purchases.",
  },
  {
    name: "Occasion & Bridal",
    specialty: "Occasion & Event",
    from: 170,
    blurb: "Weddings, galas, milestone moments. Show up unforgettable.",
  },
  {
    name: "Executive Presence",
    specialty: "Corporate & Executive",
    from: 130,
    blurb: "Command the room. Styling for leaders and the about-to-be-promoted.",
  },
  {
    name: "Wardrobe Detox",
    specialty: "Wardrobe Detox",
    from: 110,
    blurb: "Clear the clutter, rediscover what you love, and see what's missing.",
  },
] as const;

/** Deterministic "slots left this week" (2–5) so scarcity is stable per
    stylist and identical between server and client renders. */
export function slotsLeftThisWeek(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 2 + (h % 4);
}

export function getStylist(id: string): Stylist | undefined {
  return STYLISTS.find((s) => s.id === id);
}

export function getFeatured(): Stylist[] {
  return STYLISTS.filter((s) => s.featured);
}

export function getService(stylistId: string, serviceId: string): Service | undefined {
  return getStylist(stylistId)?.services.find((svc) => svc.id === serviceId);
}

// ───────────────────────────── Stylist gender ───────────────────────────────
// Clients can choose the gender of their stylist. StyleUp's audience is mainly
// women (men are welcome too), and the roster reflects that balance.
export type Gender = "female" | "male";

const STYLIST_GENDER: Record<string, Gender> = {
  "maya-thompson": "female",
  "jess-carter": "female",
  "rachel-kim": "female",
  "andre-silva": "male",
  "emily-sinclair": "female",
  "danielle-brooks": "female",
  "marcus-reid": "male",
  "grace-adeyemi": "female",
  "hannah-whitfield": "female",
  "tom-ellison": "male",
  "sofia-marchetti": "female",
  "camille-moreau": "female",
};

/** The gender a stylist presents/styles as, used for the "stylist gender" filter. */
export function genderOf(s: Stylist | string): Gender {
  const id = typeof s === "string" ? s : s.id;
  return STYLIST_GENDER[id] ?? "female";
}

// ─────────────────────────── Portfolio "looks" ──────────────────────────────
// Each stylist shows a small lookbook so clients can judge whether the
// aesthetic is right for them. Images are themed to the stylist's vibe and
// drawn from a curated, reliable set of editorial fashion photography.
const LOOK_THEMES: Record<string, string[]> = {
  colour: [
    "1490481651871-ab68de25d43d",
    "1483985988355-763728e1935b",
    "1502716119720-b23a93e5fe1b",
    "1492707892479-7bc8d5a4ee93",
    "1483181957632-8bda974cbc91",
    "1485968579580-b6d095142e6e",
  ],
  minimal: [
    "1445205170230-053b83016050",
    "1490578474895-699cd4e2cf59",
    "1441986300917-64674bd600d8",
    "1507003211169-0a1dd7228f2d",
    "1539109136881-3be0616acf4b",
    "1521334884684-d80222895322",
  ],
  occasion: [
    "1469334031218-e382a71b716b",
    "1512436991641-6745cdb1723f",
    "1469371670807-013ccf25f16a",
    "1485462537746-965f33f7f6a7",
    "1490481651871-ab68de25d43d",
    "1492707892479-7bc8d5a4ee93",
  ],
  menswear: [
    "1507003211169-0a1dd7228f2d",
    "1445205170230-053b83016050",
    "1441986300917-64674bd600d8",
    "1521334884684-d80222895322",
    "1490578474895-699cd4e2cf59",
    "1469371670807-013ccf25f16a",
  ],
  editorial: [
    "1483985988355-763728e1935b",
    "1490481651871-ab68de25d43d",
    "1496747611176-843222e1e57c",
    "1483181957632-8bda974cbc91",
    "1502716119720-b23a93e5fe1b",
    "1512436991641-6745cdb1723f",
  ],
};

function vibeFor(stylist: Stylist): keyof typeof LOOK_THEMES {
  const sp = stylist.specialties;
  if (sp.includes("Menswear")) return "menswear";
  if (sp.includes("Occasion & Event") || sp.includes("Bridal Styling")) return "occasion";
  if (sp.includes("Colour Analysis") || sp.includes("Body Confidence")) return "colour";
  if (sp.includes("Sustainable Fashion") || sp.includes("Wardrobe Detox") || sp.includes("Capsule Wardrobe"))
    return "minimal";
  return "editorial";
}

/** Returns a stylist's lookbook image URLs (their cover + themed looks). */
export function getPortfolio(stylist: Stylist): string[] {
  const ids = LOOK_THEMES[vibeFor(stylist)];
  const coverId = stylist.cover.match(/photo-([^?]+)/)?.[1];
  const unique = Array.from(new Set([coverId, ...ids].filter(Boolean) as string[])).slice(0, 6);
  return unique.map((id) => `https://images.unsplash.com/photo-${id}?w=640&h=800&fit=crop&auto=format&q=70`);
}


// ──────────────────────── Location & format helpers ─────────────────────────
// Region groupings so "near me" is meaningful even with a global roster: a
// client can realistically meet a stylist in person within the same region.
const REGION_BY_COUNTRY: Record<string, string> = {
  "United Kingdom": "Europe",
  France: "Europe",
  Italy: "Europe",
  Spain: "Europe",
  Sweden: "Europe",
  "United States": "North America",
  Canada: "North America",
  Brazil: "South America",
  "United Arab Emirates": "Middle East",
  India: "South Asia",
  Japan: "East Asia",
  China: "East Asia",
};

export const COUNTRIES: string[] = Array.from(new Set(STYLISTS.map((s) => s.country))).sort();

export function regionFor(country: string | null | undefined): string | null {
  if (!country) return null;
  return REGION_BY_COUNTRY[country] ?? null;
}

/** A stylist offers in-person sessions (in their city). */
export function offersInPerson(s: Stylist): boolean {
  return s.sessionTypes.includes("in-person") || s.sessionTypes.includes("hybrid");
}

/** A stylist will accompany you shopping in store (personal shopping). */
export function offersInStoreShopping(s: Stylist): boolean {
  return (
    offersInPerson(s) &&
    (s.specialties.includes("Personal Shopping") || s.services.some((v) => /shop/i.test(v.name)))
  );
}

export type Proximity = "same-city" | "same-country" | "same-region" | "remote";

/** How reachable a stylist is in person for a client in `country`/`city`. */
export function proximity(
  s: Stylist,
  country: string | null,
  city?: string | null
): Proximity {
  if (!country) return "remote";
  if (city && s.city.toLowerCase() === city.toLowerCase()) return "same-city";
  if (s.country.toLowerCase() === country.toLowerCase()) return "same-country";
  const r = regionFor(country);
  if (r && regionFor(s.country) === r) return "same-region";
  return "remote";
}

const PROXIMITY_RANK: Record<Proximity, number> = {
  "same-city": 0,
  "same-country": 1,
  "same-region": 2,
  remote: 3,
};

export function proximityRank(p: Proximity): number {
  return PROXIMITY_RANK[p];
}
