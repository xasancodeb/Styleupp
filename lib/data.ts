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
    id: "amara-okafor",
    name: "Amara Okafor",
    tagline: "Bold colour, sharp tailoring, zero compromise.",
    bio: "Amara built her reputation dressing founders and broadcasters across Lagos and London. She specialises in colour-led capsule wardrobes that read as confident without shouting. Expect honest feedback, a clear plan, and a wardrobe that finally feels like yours.",
    city: "London",
    country: "United Kingdom",
    avatar: "https://i.pravatar.cc/400?img=47",
    cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80",
    specialties: ["Colour Analysis", "Capsule Wardrobe", "Corporate & Executive"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["English", "Yoruba"],
    rating: 4.9,
    reviewCount: 218,
    sessionsCompleted: 640,
    yearsExperience: 11,
    startingPrice: 95,
    featured: true,
    services: [
      svc("amara-colour", "Signature Colour Analysis", "A 90-minute deep dive into your colour season with a personalised digital palette to shop from.", 90, 140, "virtual"),
      svc("amara-capsule", "Capsule Wardrobe Build", "We audit what you own and map a 30-piece capsule that mixes into 100+ outfits.", 120, 240, "hybrid"),
      svc("amara-exec", "Executive Power Edit", "Boardroom-ready styling for leaders who want presence without fuss.", 150, 320, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Priya N.", rating: 5, date: "2026-04-18", comment: "Amara completely changed how I see colour. I get compliments every single week now." },
      { id: "r2", author: "Tom B.", rating: 5, date: "2026-03-02", comment: "Direct, warm and ridiculously good at her job. The capsule plan paid for itself." },
      { id: "r3", author: "Lena K.", rating: 4, date: "2026-01-29", comment: "Loved the session. Would have liked a longer shopping window, but the palette is spot on." },
    ],
  },
  {
    id: "kenji-mori",
    name: "Kenji Mori",
    tagline: "Quiet luxury and Japanese minimalism, refined.",
    bio: "Trained in Tokyo and Milan, Kenji believes in fewer, better things. His clients leave with a calm, intentional wardrobe built around impeccable fit and natural fabrics. He is a fit obsessive and a gentle but exacting editor.",
    city: "Tokyo",
    country: "Japan",
    avatar: "https://i.pravatar.cc/400?img=12",
    cover: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&q=80",
    specialties: ["Capsule Wardrobe", "Menswear", "Sustainable Fashion"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["Japanese", "English", "Italian"],
    rating: 4.95,
    reviewCount: 167,
    sessionsCompleted: 503,
    yearsExperience: 14,
    startingPrice: 110,
    featured: true,
    services: [
      svc("kenji-foundation", "Foundation Fit Session", "We establish your core silhouette and the fabrics that flatter you most.", 75, 130, "virtual"),
      svc("kenji-minimal", "Minimalist Capsule", "A tightly edited seasonless wardrobe of natural fibres and perfect proportions.", 120, 280, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Daniel R.", rating: 5, date: "2026-05-11", comment: "I own half as much and look twice as good. Kenji is a master of restraint." },
      { id: "r2", author: "Sofia M.", rating: 5, date: "2026-02-20", comment: "Every fabric recommendation was perfect. Worth every penny." },
    ],
  },
  {
    id: "isabella-rossi",
    name: "Isabella Rossi",
    tagline: "Italian glamour for occasions that matter.",
    bio: "Isabella has dressed brides and red-carpet guests across Europe for over a decade. She blends old-world elegance with a modern eye, and she is happiest solving the impossible last-minute occasion brief.",
    city: "Milan",
    country: "Italy",
    avatar: "https://i.pravatar.cc/400?img=45",
    cover: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&q=80",
    specialties: ["Occasion & Event", "Bridal Styling", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Italian", "English", "French"],
    rating: 4.88,
    reviewCount: 142,
    sessionsCompleted: 388,
    yearsExperience: 13,
    startingPrice: 120,
    featured: true,
    services: [
      svc("isabella-occasion", "Occasion Styling", "Head-to-toe styling for a wedding, gala or milestone event.", 90, 180, "hybrid"),
      svc("isabella-bridal", "Bridal Edit", "From the dress to the going-away look, styled with calm and care.", 180, 420, "in-person"),
      svc("isabella-shop", "Personal Shopping Day", "A guided day in Milan's boutiques, curated entirely around you.", 240, 480, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Claire H.", rating: 5, date: "2026-04-30", comment: "I felt like the most elegant version of myself at my sister's wedding." },
      { id: "r2", author: "Marco T.", rating: 5, date: "2026-03-15", comment: "Isabella found a suit that fit like couture in a single afternoon." },
      { id: "r3", author: "Yuki S.", rating: 4, date: "2026-02-02", comment: "Wonderful eye. The shopping day ran a little long but the results were stunning." },
    ],
  },
  {
    id: "noah-bennett",
    name: "Noah Bennett",
    tagline: "Menswear that works from Monday to Saturday night.",
    bio: "A former tailor turned stylist, Noah helps men dress with intention without spending their weekends shopping. He focuses on versatile pieces, sharp fit and a grooming-adjacent attention to detail.",
    city: "New York",
    country: "United States",
    avatar: "https://i.pravatar.cc/400?img=15",
    cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",
    specialties: ["Menswear", "Capsule Wardrobe", "Corporate & Executive"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English"],
    rating: 4.82,
    reviewCount: 96,
    sessionsCompleted: 271,
    yearsExperience: 8,
    startingPrice: 90,
    featured: false,
    services: [
      svc("noah-refresh", "Wardrobe Refresh", "We modernise your everyday rotation and fix the fit issues holding you back.", 75, 120, "virtual"),
      svc("noah-suit", "Suiting & Tailoring", "Find the right suit and the tailor to make it perfect.", 120, 260, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "James P.", rating: 5, date: "2026-05-01", comment: "Noah made getting dressed effortless. Best money I've spent on myself." },
      { id: "r2", author: "Andre L.", rating: 4, date: "2026-03-22", comment: "Great practical advice. Helped me stop buying things I never wear." },
    ],
  },
  {
    id: "chloe-laurent",
    name: "Chloé Laurent",
    tagline: "Parisian ease, edited with intention.",
    bio: "Chloé champions the effortless French wardrobe: a handful of beautiful pieces, worn well. She is a sustainability advocate and a natural teacher who leaves clients with skills, not just outfits.",
    city: "Paris",
    country: "France",
    avatar: "https://i.pravatar.cc/400?img=20",
    cover: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=1200&q=80",
    specialties: ["Sustainable Fashion", "Capsule Wardrobe", "Wardrobe Detox"],
    sessionTypes: ["virtual", "hybrid"],
    languages: ["French", "English"],
    rating: 4.91,
    reviewCount: 130,
    sessionsCompleted: 342,
    yearsExperience: 10,
    startingPrice: 85,
    featured: true,
    services: [
      svc("chloe-detox", "Wardrobe Detox", "We clear the clutter and rediscover the pieces you already love.", 90, 110, "virtual"),
      svc("chloe-capsule", "Conscious Capsule", "A sustainable capsule built around longevity and lower impact.", 120, 220, "hybrid"),
    ],
    reviews: [
      { id: "r1", author: "Mia F.", rating: 5, date: "2026-04-10", comment: "Chloé gave me permission to keep it simple. My wardrobe finally makes sense." },
      { id: "r2", author: "Olivia G.", rating: 5, date: "2026-02-28", comment: "Thoughtful, kind and genuinely sustainable advice. Highly recommend." },
    ],
  },
  {
    id: "diego-fernandez",
    name: "Diego Fernández",
    tagline: "Colour, confidence and a little Latin flair.",
    bio: "Based in Barcelona, Diego is known for joyful, colour-forward styling that helps clients stop hiding. His sessions are equal parts technical colour theory and pep talk.",
    city: "Barcelona",
    country: "Spain",
    avatar: "https://i.pravatar.cc/400?img=33",
    cover: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
    specialties: ["Colour Analysis", "Body Confidence", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Spanish", "Catalan", "English"],
    rating: 4.86,
    reviewCount: 108,
    sessionsCompleted: 299,
    yearsExperience: 9,
    startingPrice: 80,
    featured: false,
    services: [
      svc("diego-colour", "Colour Confidence", "Find your palette and learn to wear colour without fear.", 75, 100, "virtual"),
      svc("diego-shop", "Guided Shop", "A relaxed personal shopping session through Barcelona's best.", 150, 240, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Rosa B.", rating: 5, date: "2026-05-09", comment: "Diego is pure sunshine and a brilliant stylist. I wear colour now!" },
      { id: "r2", author: "Pablo M.", rating: 4, date: "2026-03-30", comment: "Fun, encouraging and genuinely useful. Loved the session." },
    ],
  },
  {
    id: "aisha-rahman",
    name: "Aisha Rahman",
    tagline: "Modest fashion that never sacrifices style.",
    bio: "Aisha is a leading voice in modest styling, dressing clients for everything from boardrooms to weddings in Dubai and beyond. She combines luxury sensibility with deep cultural fluency.",
    city: "Dubai",
    country: "United Arab Emirates",
    avatar: "https://i.pravatar.cc/400?img=44",
    cover: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1200&q=80",
    specialties: ["Occasion & Event", "Personal Shopping", "Corporate & Executive"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Arabic", "English", "Urdu"],
    rating: 4.93,
    reviewCount: 154,
    sessionsCompleted: 410,
    yearsExperience: 12,
    startingPrice: 115,
    featured: true,
    services: [
      svc("aisha-occasion", "Occasion & Event Styling", "Elegant, modest looks for the moments that matter.", 90, 170, "hybrid"),
      svc("aisha-capsule", "Modern Modest Capsule", "A versatile capsule that takes you from work to celebration.", 120, 260, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Fatima A.", rating: 5, date: "2026-04-25", comment: "Aisha understood exactly what I needed. Flawless from start to finish." },
      { id: "r2", author: "Hana Z.", rating: 5, date: "2026-03-08", comment: "Beautiful, respectful and incredibly stylish. A rare talent." },
    ],
  },
  {
    id: "lucas-silva",
    name: "Lucas Silva",
    tagline: "Effortless São Paulo cool, anywhere you are.",
    bio: "Lucas brings a relaxed, climate-smart sensibility to styling. He is brilliant with travel wardrobes and dressing for warm weather without losing polish.",
    city: "São Paulo",
    country: "Brazil",
    avatar: "https://i.pravatar.cc/400?img=51",
    cover: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
    specialties: ["Capsule Wardrobe", "Personal Shopping", "Menswear"],
    sessionTypes: ["virtual", "hybrid"],
    languages: ["Portuguese", "English", "Spanish"],
    rating: 4.79,
    reviewCount: 71,
    sessionsCompleted: 188,
    yearsExperience: 7,
    startingPrice: 70,
    featured: false,
    services: [
      svc("lucas-travel", "Travel Capsule", "Pack light, look sharp — a capsule built for life on the move.", 75, 95, "virtual"),
      svc("lucas-warm", "Warm Weather Edit", "Stay cool and stylish in heat and humidity.", 60, 80, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Bruno C.", rating: 5, date: "2026-05-02", comment: "My travel wardrobe has never been better. Lucas gets it." },
      { id: "r2", author: "Ines D.", rating: 4, date: "2026-02-14", comment: "Great value and lovely energy. Practical advice that stuck." },
    ],
  },
  {
    id: "freya-nilsson",
    name: "Freya Nilsson",
    tagline: "Scandinavian calm meets confident tailoring.",
    bio: "Freya's Stockholm studio is a haven of considered, functional style. She loves a strong neutral palette, beautiful outerwear and wardrobes built to last through long winters.",
    city: "Stockholm",
    country: "Sweden",
    avatar: "https://i.pravatar.cc/400?img=24",
    cover: "https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=1200&q=80",
    specialties: ["Capsule Wardrobe", "Sustainable Fashion", "Wardrobe Detox"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["Swedish", "English"],
    rating: 4.84,
    reviewCount: 89,
    sessionsCompleted: 234,
    yearsExperience: 9,
    startingPrice: 95,
    featured: false,
    services: [
      svc("freya-neutral", "Neutral Capsule", "A timeless palette of neutrals layered for any season.", 90, 130, "virtual"),
      svc("freya-outerwear", "Outerwear Edit", "Invest in the coats and layers that define your look.", 75, 120, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Erik L.", rating: 5, date: "2026-04-19", comment: "Calm, clear and exactly what my chaotic wardrobe needed." },
      { id: "r2", author: "Astrid P.", rating: 4, date: "2026-01-30", comment: "Lovely session. My winter wardrobe finally feels intentional." },
    ],
  },
  {
    id: "mei-lin",
    name: "Mei Lin",
    tagline: "Modern Shanghai polish with a creative streak.",
    bio: "Mei works with creatives and entrepreneurs who want to stand out for the right reasons. She balances statement pieces with wearable foundations and is a wizard with proportion.",
    city: "Shanghai",
    country: "China",
    avatar: "https://i.pravatar.cc/400?img=32",
    cover: "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?w=1200&q=80",
    specialties: ["Personal Shopping", "Body Confidence", "Occasion & Event"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Mandarin", "English"],
    rating: 4.87,
    reviewCount: 121,
    sessionsCompleted: 318,
    yearsExperience: 10,
    startingPrice: 100,
    featured: false,
    services: [
      svc("mei-statement", "Statement Styling", "Learn to wear bold pieces with balance and ease.", 90, 150, "virtual"),
      svc("mei-shop", "Curated Shopping", "A personal shopping session through Shanghai's best boutiques.", 150, 260, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Wei C.", rating: 5, date: "2026-05-06", comment: "Mei has an incredible eye for proportion. I finally feel put together." },
      { id: "r2", author: "Grace T.", rating: 4, date: "2026-03-11", comment: "Creative and thoughtful. Pushed me out of my comfort zone in the best way." },
    ],
  },
  {
    id: "olivia-grant",
    name: "Olivia Grant",
    tagline: "Confidence-first styling for every body.",
    bio: "Olivia's work centres body confidence and joyful dressing. She is especially loved by clients navigating big life changes — new roles, new bodies, new chapters — who want to feel like themselves again.",
    city: "Melbourne",
    country: "Australia",
    avatar: "https://i.pravatar.cc/400?img=27",
    cover: "https://images.unsplash.com/photo-1483181957632-8bda974cbc91?w=1200&q=80",
    specialties: ["Body Confidence", "Wardrobe Detox", "Capsule Wardrobe"],
    sessionTypes: ["virtual", "hybrid"],
    languages: ["English"],
    rating: 4.92,
    reviewCount: 113,
    sessionsCompleted: 287,
    yearsExperience: 8,
    startingPrice: 75,
    featured: false,
    services: [
      svc("olivia-confidence", "Confidence Reset", "Rebuild your relationship with your wardrobe and your reflection.", 90, 110, "virtual"),
      svc("olivia-capsule", "Feel-Good Capsule", "A capsule chosen for how it makes you feel, not just how it looks.", 120, 190, "hybrid"),
    ],
    reviews: [
      { id: "r1", author: "Sarah W.", rating: 5, date: "2026-05-13", comment: "Olivia helped me love getting dressed again after a really hard year." },
      { id: "r2", author: "Nadia R.", rating: 5, date: "2026-02-19", comment: "Warm, wise and brilliant at her job. I can't recommend her enough." },
    ],
  },
  {
    id: "raj-mehta",
    name: "Raj Mehta",
    tagline: "Where heritage textiles meet sharp tailoring.",
    bio: "Raj fuses Indian craftsmanship with contemporary tailoring, dressing clients for weddings, festivals and everyday confidence. He is a passionate advocate for artisan textiles.",
    city: "Mumbai",
    country: "India",
    avatar: "https://i.pravatar.cc/400?img=59",
    cover: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&q=80",
    specialties: ["Occasion & Event", "Menswear", "Sustainable Fashion"],
    sessionTypes: ["virtual", "in-person", "hybrid"],
    languages: ["Hindi", "English", "Marathi"],
    rating: 4.85,
    reviewCount: 97,
    sessionsCompleted: 256,
    yearsExperience: 11,
    startingPrice: 85,
    featured: false,
    services: [
      svc("raj-occasion", "Festive & Occasion", "Styling for weddings and celebrations with a modern heritage twist.", 120, 180, "hybrid"),
      svc("raj-fusion", "Fusion Wardrobe", "Blend traditional and contemporary pieces with confidence.", 90, 140, "virtual"),
    ],
    reviews: [
      { id: "r1", author: "Arjun S.", rating: 5, date: "2026-04-27", comment: "Raj styled my entire wedding wardrobe and every look was perfect." },
      { id: "r2", author: "Divya K.", rating: 4, date: "2026-03-05", comment: "Beautiful textile knowledge and a great eye. Truly enjoyed it." },
    ],
  },
  {
    id: "sophie-dubois",
    name: "Sophie Dubois",
    tagline: "Corporate polish for the modern executive.",
    bio: "Based in Toronto, Sophie specialises in executive presence. She helps leaders and rising professionals build authoritative, comfortable wardrobes that travel and perform under pressure.",
    city: "Toronto",
    country: "Canada",
    avatar: "https://i.pravatar.cc/400?img=23",
    cover: "https://images.unsplash.com/photo-1521334884684-d80222895322?w=1200&q=80",
    specialties: ["Corporate & Executive", "Capsule Wardrobe", "Personal Shopping"],
    sessionTypes: ["virtual", "in-person"],
    languages: ["English", "French"],
    rating: 4.89,
    reviewCount: 102,
    sessionsCompleted: 274,
    yearsExperience: 12,
    startingPrice: 105,
    featured: false,
    services: [
      svc("sophie-presence", "Executive Presence", "Command the room with a wardrobe built for leadership.", 90, 160, "virtual"),
      svc("sophie-travel", "Business Travel Capsule", "A wrinkle-resistant capsule for the frequent flyer.", 75, 130, "in-person"),
    ],
    reviews: [
      { id: "r1", author: "Michelle D.", rating: 5, date: "2026-05-04", comment: "Sophie transformed how I show up at work. Promotion incoming, I hope!" },
      { id: "r2", author: "Robert F.", rating: 4, date: "2026-02-22", comment: "Practical, polished and professional. Exactly what I needed." },
    ],
  },
];

export function getStylist(id: string): Stylist | undefined {
  return STYLISTS.find((s) => s.id === id);
}

export function getFeatured(): Stylist[] {
  return STYLISTS.filter((s) => s.featured);
}

export function getService(stylistId: string, serviceId: string): Service | undefined {
  return getStylist(stylistId)?.services.find((svc) => svc.id === serviceId);
}
