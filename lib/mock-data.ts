// Mock inventory for local UI development. Replace with Supabase queries
// (see lib/supabase/client.ts) once the `properties` table is live.
// Images are Unsplash stock placeholders — swap for real project photography.

export type PropertyCity = "Ahmedabad" | "Gandhinagar" | "GIFT City";

export type PropertyTypology =
  | "3BHK Sky Villa"
  | "4BHK Sky Villa"
  | "5BHK Sky Villa"
  | "Luxury Penthouse"
  | "Duplex"
  | "Commercial Office"
  | "Plot / Land Parcel";

export type ListingStatus = "Ready to Move" | "Under Construction" | "Off-Plan";

export type PossessionYear = "Ready" | 2026 | 2027 | 2028;

export interface Corridor {
  slug: string;
  name: string;
  city: PropertyCity;
  blurb: string;
}

export const CORRIDORS: Corridor[] = [
  {
    slug: "ambli-sbr",
    name: "Ambli-Sindhu Bhavan Road (SBR)",
    city: "Ahmedabad",
    blurb: "Ahmedabad's most premium residential spine, anchored by sky villas and gated estates.",
  },
  {
    slug: "sg-highway",
    name: "S.G. Highway",
    city: "Ahmedabad",
    blurb: "High-street commercial frontage meets premium high-rise residences.",
  },
  {
    slug: "science-city-road",
    name: "Science City Road",
    city: "Ahmedabad",
    blurb: "Emerging luxury corridor with expansive low-density penthouse developments.",
  },
  {
    slug: "gift-city-sez",
    name: "GIFT City SEZ",
    city: "GIFT City",
    blurb: "India's first operational smart city — tax-advantaged SEZ office & residential towers.",
  },
  {
    slug: "gift-city-domestic",
    name: "GIFT City Domestic",
    city: "GIFT City",
    blurb: "Domestic tariff area residences serving GIFT City's financial workforce.",
  },
  {
    slug: "bodakdev",
    name: "Bodakdev",
    city: "Ahmedabad",
    blurb: "Established address of choice for Ahmedabad's business elite.",
  },
  {
    slug: "thaltej",
    name: "Thaltej",
    city: "Ahmedabad",
    blurb: "Well-connected residential enclave bridging SBR and S.G. Highway.",
  },
  {
    slug: "vaishnodevi-circle",
    name: "Vaishnodevi Circle",
    city: "Ahmedabad",
    blurb: "Fast-growing peripheral corridor with large-format plotted developments.",
  },
  {
    slug: "shela",
    name: "Shela",
    city: "Ahmedabad",
    blurb: "Low-rise villa townships in a quiet, greenery-forward setting.",
  },
  {
    slug: "south-bopal",
    name: "South Bopal",
    city: "Ahmedabad",
    blurb: "Value-luxury corridor popular with young HNI families.",
  },
];

export const DEVELOPERS = [
  "Adani Realty",
  "Goyal & Co",
  "Shivalik Group",
  "HN Safal",
  "Ganesh Housing",
  "Sun Builders",
  "Gala Group",
  "Bakeri",
] as const;

export type Developer = (typeof DEVELOPERS)[number];

export interface Property {
  id: string;
  slug: string;
  title: string;
  developer: Developer;
  corridorSlug: string;
  corridorName: string;
  locality: string;
  city: PropertyCity;
  typology: PropertyTypology;
  status: ListingStatus;
  possessionYear: PossessionYear;
  priceInCr: number;
  bedrooms: number;
  bathrooms: number;
  carpetAreaSqFt: number;
  carpetAreaSqYd: number;
  gujreraNumber: string;
  /** False for a small number of pre-launch off-plan listings awaiting registration. */
  gujreraVerified: boolean;
  amenities: string[];
  heroImage: string;
  images: string[];
  description: string;
  featured: boolean;
  giftCitySpecial: boolean;
  lat: number;
  lng: number;
}

/** 1 Sq. Yard (Gaj) = 9 Sq. Ft. Used to derive carpetAreaSqYd from Sq. Ft. */
export const SQFT_PER_SQYD = 9;

/** Price per Sq. Yard, derived from priceInCr and carpetAreaSqYd. */
export function pricePerSqYd(property: Pick<Property, "priceInCr" | "carpetAreaSqYd">) {
  return Math.round((property.priceInCr * 1e7) / property.carpetAreaSqYd);
}

/** Formats a price in Crores as an Indian-locale ₹ Lakh/Cr label. */
export function formatIndianPrice(priceInCr: number) {
  if (priceInCr >= 1) {
    return `₹${priceInCr.toFixed(2).replace(/\.?0+$/, "")} Cr`;
  }
  const lakhs = priceInCr * 100;
  return `₹${lakhs.toFixed(0)} Lakh`;
}

type RawProperty = Omit<Property, "gujreraVerified">;

const RAW_PROPERTIES: RawProperty[] = [
  {
    id: "p01",
    slug: "adani-shantigram-sky-villa-ambli-sbr",
    title: "Adani Shantigram Sky Villa",
    developer: "Adani Realty",
    corridorSlug: "ambli-sbr",
    corridorName: "Ambli-Sindhu Bhavan Road (SBR)",
    locality: "Ambli",
    city: "Ahmedabad",
    typology: "5BHK Sky Villa",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 8.75,
    bedrooms: 5,
    bathrooms: 6,
    carpetAreaSqFt: 5400,
    carpetAreaSqYd: 600,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA10234/210324",
    amenities: ["Private Elevator", "Infinity Pool Deck", "Home Theatre", "5-Car Garage", "Smart Home"],
    heroImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
    ],
    description:
      "A five-bedroom sky villa perched above Ambli-SBR with private elevator access and panoramic skyline views.",
    featured: true,
    giftCitySpecial: false,
    lat: 23.0295,
    lng: 72.4661,
  },
  {
    id: "p02",
    slug: "goyal-orchid-penthouse-sbr",
    title: "Goyal Orchid Ridgewood Penthouse",
    developer: "Goyal & Co",
    corridorSlug: "ambli-sbr",
    corridorName: "Ambli-Sindhu Bhavan Road (SBR)",
    locality: "Sindhu Bhavan Road",
    city: "Ahmedabad",
    typology: "Luxury Penthouse",
    status: "Under Construction",
    possessionYear: 2027,
    priceInCr: 6.2,
    bedrooms: 4,
    bathrooms: 5,
    carpetAreaSqFt: 4100,
    carpetAreaSqYd: 456,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA10567/150524",
    amenities: ["Private Terrace", "Jacuzzi", "Concierge Desk", "Clubhouse", "EV Charging"],
    heroImage: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
    ],
    description: "Duplex penthouse with a private terrace overlooking the SBR skyline, targeted for 2027 handover.",
    featured: true,
    giftCitySpecial: false,
    lat: 23.0378,
    lng: 72.4855,
  },
  {
    id: "p03",
    slug: "gift-city-imperial-towers-sez-residence",
    title: "GIFT City Imperial Towers",
    developer: "Sun Builders",
    corridorSlug: "gift-city-sez",
    corridorName: "GIFT City SEZ",
    locality: "GIFT SEZ, Sector 8",
    city: "GIFT City",
    typology: "3BHK Sky Villa",
    status: "Off-Plan",
    possessionYear: 2028,
    priceInCr: 2.35,
    bedrooms: 3,
    bathrooms: 3,
    carpetAreaSqFt: 1850,
    carpetAreaSqYd: 206,
    gujreraNumber: "PR/GJ/GANDHINAGAR/GIFT CITY/GIFT SEZ/CAA20112/010724",
    amenities: ["SEZ Tax Benefits", "Sky Lounge", "Co-working Deck", "Riverfront View"],
    heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
    ],
    description: "Off-plan SEZ residence in GIFT City with projected high rental yield from IFSC workforce demand.",
    featured: true,
    giftCitySpecial: true,
    lat: 23.1610,
    lng: 72.6849,
  },
  {
    id: "p04",
    slug: "gift-city-domestic-crescent-residences",
    title: "GIFT City Crescent Residences",
    developer: "HN Safal",
    corridorSlug: "gift-city-domestic",
    corridorName: "GIFT City Domestic",
    locality: "GIFT Domestic, Sector 4",
    city: "GIFT City",
    typology: "4BHK Sky Villa",
    status: "Under Construction",
    possessionYear: 2027,
    priceInCr: 3.1,
    bedrooms: 4,
    bathrooms: 4,
    carpetAreaSqFt: 2600,
    carpetAreaSqYd: 289,
    gujreraNumber: "PR/GJ/GANDHINAGAR/GIFT CITY/DTA/CAA20198/200824",
    amenities: ["Clubhouse", "Infinity Pool", "Landscaped Gardens", "24x7 Security"],
    heroImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
    ],
    description: "Domestic tariff area residences steps from GIFT City's financial district, popular with IFSC professionals.",
    featured: false,
    giftCitySpecial: true,
    lat: 23.1652,
    lng: 72.6821,
  },
  {
    id: "p05",
    slug: "science-city-skyline-penthouse",
    title: "Shivalik Skyline Penthouse",
    developer: "Shivalik Group",
    corridorSlug: "science-city-road",
    corridorName: "Science City Road",
    locality: "Science City Road",
    city: "Ahmedabad",
    typology: "Luxury Penthouse",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 6.4,
    bedrooms: 4,
    bathrooms: 5,
    carpetAreaSqFt: 4500,
    carpetAreaSqYd: 500,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA09876/051023",
    amenities: ["Rooftop Pool", "Home Automation", "Private Lift Lobby", "4-Car Garage"],
    heroImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
    ],
    description: "Ready-to-move penthouse with a private rooftop pool on the emerging Science City corridor.",
    featured: true,
    giftCitySpecial: false,
    lat: 23.0731,
    lng: 72.4832,
  },
  {
    id: "p06",
    slug: "ganesh-glory-duplex-science-city",
    title: "Ganesh Glory Duplex Residences",
    developer: "Ganesh Housing",
    corridorSlug: "science-city-road",
    corridorName: "Science City Road",
    locality: "Science City Road",
    city: "Ahmedabad",
    typology: "Duplex",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 3.8,
    bedrooms: 4,
    bathrooms: 4,
    carpetAreaSqFt: 3200,
    carpetAreaSqYd: 356,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA08765/120223",
    amenities: ["Duplex Layout", "Private Garden", "Clubhouse", "Kids Play Area"],
    heroImage: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1600&q=80",
    ],
    description: "Spacious duplex with a private garden in a mature, amenity-rich Science City Road township.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.0689,
    lng: 72.4917,
  },
  {
    id: "p07",
    slug: "bakeri-elementa-bodakdev",
    title: "Bakeri Elementa Residences",
    developer: "Bakeri",
    corridorSlug: "bodakdev",
    corridorName: "Bodakdev",
    locality: "Bodakdev",
    city: "Ahmedabad",
    typology: "3BHK Sky Villa",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 2.9,
    bedrooms: 3,
    bathrooms: 3,
    carpetAreaSqFt: 2150,
    carpetAreaSqYd: 239,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA07654/300123",
    amenities: ["Rooftop Garden", "Gymnasium", "24x7 Security", "Covered Parking"],
    heroImage: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
    ],
    description: "Established Bodakdev address offering ready-to-move 3BHK sky villas with rooftop gardens.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.0325,
    lng: 72.5083,
  },
  {
    id: "p08",
    slug: "gala-empire-commercial-sg-highway",
    title: "Gala Empire Business Hub",
    developer: "Gala Group",
    corridorSlug: "sg-highway",
    corridorName: "S.G. Highway",
    locality: "S.G. Highway",
    city: "Ahmedabad",
    typology: "Commercial Office",
    status: "Under Construction",
    possessionYear: 2026,
    priceInCr: 1.85,
    bedrooms: 0,
    bathrooms: 2,
    carpetAreaSqFt: 1200,
    carpetAreaSqYd: 133,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA11023/180624",
    amenities: ["Grade-A Lobby", "High-Speed Elevators", "Food Court", "Ample Parking"],
    heroImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
    ],
    description: "Grade-A commercial office space fronting S.G. Highway with high footfall visibility.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.0395,
    lng: 72.5066,
  },
  {
    id: "p09",
    slug: "adani-brahma-corp-sg-highway-tower",
    title: "Adani Brahma Vision Tower",
    developer: "Adani Realty",
    corridorSlug: "sg-highway",
    corridorName: "S.G. Highway",
    locality: "S.G. Highway",
    city: "Ahmedabad",
    typology: "4BHK Sky Villa",
    status: "Under Construction",
    possessionYear: 2026,
    priceInCr: 4.5,
    bedrooms: 4,
    bathrooms: 4,
    carpetAreaSqFt: 3050,
    carpetAreaSqYd: 339,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA10899/090424",
    amenities: ["Sky Lounge", "Infinity Pool", "Valet Parking", "Smart Home"],
    heroImage: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80",
    ],
    description: "High-rise 4BHK residences on S.G. Highway with a sky lounge and infinity pool deck.",
    featured: true,
    giftCitySpecial: false,
    lat: 23.0412,
    lng: 72.5041,
  },
  {
    id: "p10",
    slug: "shivalik-parkscape-thaltej",
    title: "Shivalik Parkscape Residences",
    developer: "Shivalik Group",
    corridorSlug: "thaltej",
    corridorName: "Thaltej",
    locality: "Thaltej",
    city: "Ahmedabad",
    typology: "3BHK Sky Villa",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 2.6,
    bedrooms: 3,
    bathrooms: 3,
    carpetAreaSqFt: 1980,
    carpetAreaSqYd: 220,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA06543/151222",
    amenities: ["Landscaped Podium", "Gymnasium", "Amphitheatre", "Jogging Track"],
    heroImage: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80",
    ],
    description: "Family-first 3BHK residences in Thaltej bridging SBR and S.G. Highway.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.0508,
    lng: 72.5058,
  },
  {
    id: "p11",
    slug: "sun-builders-westgate-vaishnodevi-plots",
    title: "Sun Westgate Plotted Estate",
    developer: "Sun Builders",
    corridorSlug: "vaishnodevi-circle",
    corridorName: "Vaishnodevi Circle",
    locality: "Vaishnodevi Circle",
    city: "Ahmedabad",
    typology: "Plot / Land Parcel",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 1.45,
    bedrooms: 0,
    bathrooms: 0,
    carpetAreaSqFt: 2700,
    carpetAreaSqYd: 300,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA05432/100822",
    amenities: ["Gated Township", "Underground Utilities", "Clubhouse Access", "24x7 Security"],
    heroImage: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1600&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
    ],
    description: "Freehold residential plots (300 Sq. Yd / ~0.62 Vigha) in a gated Vaishnodevi Circle township.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.1187,
    lng: 72.5661,
  },
  {
    id: "p12",
    slug: "hn-safal-greens-shela-villa",
    title: "HN Safal Greens Villa",
    developer: "HN Safal",
    corridorSlug: "shela",
    corridorName: "Shela",
    locality: "Shela",
    city: "Ahmedabad",
    typology: "4BHK Sky Villa",
    status: "Ready to Move",
    possessionYear: "Ready",
    priceInCr: 3.35,
    bedrooms: 4,
    bathrooms: 4,
    carpetAreaSqFt: 2850,
    carpetAreaSqYd: 317,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA04321/050622",
    amenities: ["Private Garden", "Clubhouse", "Swimming Pool", "Tree-lined Streets"],
    heroImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
    ],
    description: "Low-rise villa township in Shela, set among mature tree-lined streets.",
    featured: false,
    giftCitySpecial: false,
    lat: 22.9762,
    lng: 72.4569,
  },
  {
    id: "p13",
    slug: "goyal-and-co-south-bopal-residences",
    title: "Goyal Riviera South Bopal",
    developer: "Goyal & Co",
    corridorSlug: "south-bopal",
    corridorName: "South Bopal",
    locality: "South Bopal",
    city: "Ahmedabad",
    typology: "3BHK Sky Villa",
    status: "Under Construction",
    possessionYear: 2026,
    priceInCr: 1.95,
    bedrooms: 3,
    bathrooms: 3,
    carpetAreaSqFt: 1650,
    carpetAreaSqYd: 183,
    gujreraNumber: "PR/GJ/AHMEDABAD/AHMEDABAD CITY/AUDA/CAA10456/280324",
    amenities: ["Kids Play Area", "Multipurpose Hall", "Landscaped Garden", "Power Backup"],
    heroImage: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
    ],
    description: "Value-luxury 3BHK residences in South Bopal, popular among young HNI families.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.0089,
    lng: 72.4633,
  },
  {
    id: "p14",
    slug: "gift-city-sez-financial-square-office",
    title: "GIFT City Financial Square",
    developer: "Adani Realty",
    corridorSlug: "gift-city-sez",
    corridorName: "GIFT City SEZ",
    locality: "GIFT SEZ, Sector 5",
    city: "GIFT City",
    typology: "Commercial Office",
    status: "Off-Plan",
    possessionYear: 2028,
    priceInCr: 3.75,
    bedrooms: 0,
    bathrooms: 3,
    carpetAreaSqFt: 2400,
    carpetAreaSqYd: 267,
    gujreraNumber: "PR/GJ/GANDHINAGAR/GIFT CITY/GIFT SEZ/CAA20245/151024",
    amenities: ["SEZ Tax Benefits", "IFSC Proximity", "Grade-A Lobby", "Riverfront View"],
    heroImage: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1600&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
    ],
    description: "Off-plan SEZ office square in GIFT City, structured for IFSC-linked tax benefits and strong off-plan yield.",
    featured: true,
    giftCitySpecial: true,
    lat: 23.1598,
    lng: 72.6862,
  },
  {
    id: "p15",
    slug: "ganesh-housing-genesis-gandhinagar",
    title: "Ganesis Genesis Residences",
    developer: "Ganesh Housing",
    corridorSlug: "gift-city-domestic",
    corridorName: "GIFT City Domestic",
    locality: "Kudasan, Gandhinagar",
    city: "Gandhinagar",
    typology: "5BHK Sky Villa",
    status: "Under Construction",
    possessionYear: 2027,
    priceInCr: 5.9,
    bedrooms: 5,
    bathrooms: 6,
    carpetAreaSqFt: 4800,
    carpetAreaSqYd: 533,
    gujreraNumber: "PR/GJ/GANDHINAGAR/GANDHINAGAR/GUDA/CAA20077/200424",
    amenities: ["Private Elevator", "Home Theatre", "Infinity Pool", "5-Car Garage", "Smart Home"],
    heroImage: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
    images: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
      "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1600&q=80",
    ],
    description: "Expansive 5BHK sky villas in Kudasan, Gandhinagar — a short commute from GIFT City.",
    featured: false,
    giftCitySpecial: false,
    lat: 23.1867,
    lng: 72.6269,
  },
];

/** Shared pool of stock interior/exterior photos used to round every
 * listing's gallery out to a consistent size without hand-typing arrays. */
const IMAGE_POOL = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=80",
  "https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=1600&q=80",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1600&q=80",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1600&q=80",
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1600&q=80",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1600&q=80",
  "https://images.unsplash.com/photo-1571055107559-3e67626fa8be?w=1600&q=80",
  "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1600&q=80",
];

const GALLERY_SIZE = 6;

function buildGallery(seed: string[], index: number): string[] {
  const gallery = [...seed];
  let i = index;
  while (gallery.length < GALLERY_SIZE) {
    const candidate = IMAGE_POOL[i % IMAGE_POOL.length];
    if (!gallery.includes(candidate)) gallery.push(candidate);
    i++;
  }
  return gallery;
}

/** Pre-launch off-plan listings still awaiting GUJRERA registration approval. */
const PENDING_GUJRERA_IDS = new Set(["p03", "p14"]);

export const PROPERTIES: Property[] = RAW_PROPERTIES.map((property, index) => ({
  ...property,
  images: buildGallery(property.images, index),
  gujreraVerified: !PENDING_GUJRERA_IDS.has(property.id),
}));

export const ALL_AMENITIES = Array.from(
  new Set(PROPERTIES.flatMap((p) => p.amenities))
).sort();

export function getPropertyBySlug(slug: string) {
  return PROPERTIES.find((p) => p.slug === slug);
}

export function getFeaturedProperties() {
  return PROPERTIES.filter((p) => p.featured);
}

export function getGiftCityProperties() {
  return PROPERTIES.filter((p) => p.giftCitySpecial);
}

export function getPropertiesByCorridor(corridorSlug: string) {
  return PROPERTIES.filter((p) => p.corridorSlug === corridorSlug);
}
