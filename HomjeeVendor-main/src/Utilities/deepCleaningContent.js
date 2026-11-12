// deepCleaningContent.js
// Static Deep Cleaning package content ported VERBATIM from the Homjee
// website (src/pages/services/CleaningComparisonTable.jsx, tierIncludes.js,
// WhatWeCleanImages.jsx). Only package name/price/qty come from the API; the
// comparison tables, per-tier bullet lists and "what we clean" images are
// hardcoded front-end content on the website, so we replicate them here.
//
// Images are served from the live website's /media/ folder (public/media),
// referenced by URL so we don't have to bundle the binaries into the APK.

const MEDIA = 'https://homjee-website.netlify.app/media';

// ---------------------------------------------------------------------------
// 1) Comparison tables (Classic / Premium / Ultimate)
//    Furnished -> 3 flag columns; Unfurnished -> 2 flag columns.
// ---------------------------------------------------------------------------
export const FURNISHED_TABLE = [
  {
    section: 'Living & Bedroom',
    rows: [
      ['Machine floor scrubbing', 1, 1, 1],
      ['Cobweb removal & wall dusting', 1, 1, 1],
      ['Ceiling & fan dusting', 1, 1, 1],
      ['Balcony & utility area cleaning', 1, 1, 1],
      ['Sofa, carpet & mattress shampooing', 0, 0, 1],
      ['Doors, windows & mirrors', 1, 1, 1],
      ['Switch board & fixtures', 1, 1, 1],
      ['Cabinets and furniture exterior wiping', 1, 1, 1],
      ['Cupboard exterior cleaning', 1, 1, 1],
      ['Cupboard interior cleaning (if empty)', 0, 1, 1],
    ],
  },
  {
    section: 'Bathroom Cleaning',
    rows: [
      ['Machine floor scrubbing', 1, 1, 1],
      ['Washbasin & fixtures', 1, 1, 1],
      ['Toilet seat & fixtures', 1, 1, 1],
      ['Wall tiles cleaning', 1, 1, 1],
      ['Hard water stain removal', 1, 1, 1],
    ],
  },
  {
    section: 'Kitchen Cleaning',
    rows: [
      ['Cabinets interior with utensil removal', 0, 1, 1],
      ['Cabinets exterior & stove', 1, 1, 1],
      ['Kitchen sink & under the sink', 1, 1, 1],
      ['Removal of oil/grease stains', 1, 1, 1],
      ['Kitchen tiles & slabs', 1, 1, 1],
      ['Chimney & appliances (if added separately)', 1, 1, 1],
    ],
  },
];

export const UNFURNISHED_TABLE = [
  {
    section: 'Living & Bedroom',
    rows: [
      ['Machine floor scrubbing', 1, 1],
      ['Cobweb removal & wall dusting', 1, 1],
      ['Ceiling and fan dusting', 1, 1],
      ['Balcony cleaning', 1, 1],
      ['Doors, windows & mirrors', 1, 1],
      ['Switch board & fixtures', 1, 1],
      ['Cupboard exterior cleaning', 1, 1],
      ['Cupboard interior cleaning (if empty)', 0, 1],
    ],
  },
  {
    section: 'Bathroom Cleaning',
    rows: [
      ['Machine floor scrubbing', 1, 1],
      ['Washbasin & fixtures', 1, 1],
      ['Toilet seat & fixtures', 1, 1],
      ['Wall tiles cleaning', 1, 1],
      ['Hard water stain removal', 1, 1],
    ],
  },
  {
    section: 'Kitchen Cleaning',
    rows: [
      ['Cabinets interior with utensil removal', 0, 1],
      ['Cabinets exterior & stove', 1, 1],
      ['Kitchen sink & under the sink', 1, 1],
      ['Removal of oil/grease stains', 1, 1],
      ['Kitchen tiles & slabs', 1, 1],
      ['Chimney & appliances (if added separately)', 1, 1],
    ],
  },
];

export const tableTiers = variant =>
  variant === 'unfurnished'
    ? ['Classic', 'Premium']
    : ['Classic', 'Premium', 'Ultimate'];

// ---------------------------------------------------------------------------
// 2) Per-tier bullet "includes" lists
// ---------------------------------------------------------------------------
const TIER_FURNISHED = {
  Classic: [
    'Bathroom & Kitchen Deep Cleaning',
    'Machine Cleaning of floors, doors & windows',
    'Cobweb Removal, ceiling and fan dusting',
    'Cabinet & furniture exterior dusting and wet wiping',
    'Balcony & utility area cleaning',
  ],
  Premium: [
    'Includes everything in classic plan',
    'Cupboards cleaning (interior + exterior, if empty)',
    'Cabinets Interior with utensils removal',
  ],
  Ultimate: [
    'Includes everything in premium plan',
    'Sofa, carpet & mattress shampooing',
  ],
};

const TIER_UNFURNISHED = {
  Classic: [
    'Bathroom & Kitchen Deep Cleaning',
    'Machine Cleaning of floors, doors & windows',
    'Cobweb Removal, ceiling and fan dusting',
    'Cabinet & furniture exterior dusting and wet wiping',
    'Balcony & utility area cleaning',
  ],
  Premium: [
    'Includes everything in classic plan',
    'Modular Kitchen cleaning (interior + exterior, if empty)',
  ],
};

export const getTierIncludes = (variant, tier) => {
  const src = variant === 'unfurnished' ? TIER_UNFURNISHED : TIER_FURNISHED;
  return src[tier] || [];
};

// ---------------------------------------------------------------------------
// 3) "What we clean" / "What is excluded" / "What we need" images
// ---------------------------------------------------------------------------
const IMG = {
  whatWeClean: `${MEDIA}/whatweclean.jpeg`, // Living & Bedroom
  floor: `${MEDIA}/floor.jpeg`,
  kitchen: `${MEDIA}/kitchen.jpeg`,
  bathroom: `${MEDIA}/bathroom.webp`,
  balcony: `${MEDIA}/bolcany.jpeg`,
  excludes: `${MEDIA}/Excludes.jpeg`, // furnished excludes
  excludesUnf: `${MEDIA}/unfurnishedexclude.webp`, // unfurnished excludes
  excludesBook: `${MEDIA}/bookbyexcluded.webp`, // book-by-room excludes
  whatWeNeed: `${MEDIA}/whatwedo.jpeg`,
};

const ALL_ROOMS = [
  { src: IMG.whatWeClean, alt: 'Living & Bedroom' },
  { src: IMG.floor, alt: 'Floor' },
  { src: IMG.kitchen, alt: 'Kitchen' },
  { src: IMG.bathroom, alt: 'Bathroom' },
  { src: IMG.balcony, alt: 'Balcony' },
];

// Book By Room: only that single room's image.
const ROOM_IMAGE = {
  'kitchen cleaning': [{ src: IMG.kitchen, alt: 'Kitchen' }],
  'bathroom cleaning': [{ src: IMG.bathroom, alt: 'Bathroom' }],
  'balcony cleaning': [{ src: IMG.balcony, alt: 'Balcony' }],
  'bedroom cleaning': [{ src: IMG.whatWeClean, alt: 'Bedroom' }],
  'living room cleaning': [{ src: IMG.whatWeClean, alt: 'Living Room' }],
};

// Returns { clean:[{src,alt}], excludes:{src,alt}, need:{src,alt} }
export const getWhatWeCleanImages = (variant, room) => {
  const roomKey = String(room || '').trim().toLowerCase();
  const clean = room
    ? ROOM_IMAGE[roomKey] || [{ src: IMG.whatWeClean, alt: 'What we clean' }]
    : ALL_ROOMS;
  const excludes = room
    ? { src: IMG.excludesBook, alt: 'What is excluded' }
    : variant === 'unfurnished'
    ? { src: IMG.excludesUnf, alt: 'What is excluded' }
    : { src: IMG.excludes, alt: 'What is excluded' };
  return {
    clean,
    excludes,
    need: { src: IMG.whatWeNeed, alt: 'What we need' },
  };
};

// ---------------------------------------------------------------------------
// 4) Detect the category/variant/tier of a booking's service line item.
//    The vendor booking stores the package in free-ish fields, so scan every
//    available string field defensively.
// ---------------------------------------------------------------------------
export const KIND = {
  MINI: 'mini',
  BOOK_BY_ROOM: 'bookByRoom',
  WHOLE_HOME: 'wholeHome', // furnished/unfurnished apartment or bungalow
  NONE: 'none',
};

export const detectDeepCleaningInfo = (item = {}) => {
  const fields = [
    item.serviceName,
    item.service,
    item.packageName,
    item.category,
    item.subCategory,
    item.name,
    item.serviceType,
  ]
    .filter(Boolean)
    .map(String);
  const text = fields.join(' | ').toLowerCase();

  if (!text) return { kind: KIND.NONE };

  // Mini services -> no rich popup content on the website.
  if (text.includes('mini')) return { kind: KIND.MINI };

  // Book by room -> single-room images, no table / tiers.
  if (/book\s*by\s*room/.test(text)) {
    // room base name = part before " - " of whatever field holds the room.
    const base =
      String(item.name || item.subCategory || item.serviceName || '')
        .split(' - ')[0]
        .trim();
    return { kind: KIND.BOOK_BY_ROOM, room: base };
  }

  const isUnfurnished = text.includes('unfurnished');
  const isFurnished = !isUnfurnished && text.includes('furnished');
  const looksWholeHome =
    isUnfurnished ||
    isFurnished ||
    text.includes('bhk') ||
    text.includes('apartment') ||
    text.includes('bungalow') ||
    text.includes('duplex') ||
    text.includes('cleaning');

  if (!looksWholeHome) return { kind: KIND.NONE };

  const variant = isUnfurnished ? 'unfurnished' : 'furnished';

  // Tier: try "<base> - <tier>" first, else scan for a known tier keyword.
  let tier = '';
  const nameTier = String(item.name || item.serviceName || '')
    .split(' - ')[1];
  const scan = `${nameTier || ''} ${text}`.toLowerCase();
  if (/ultimate/.test(scan)) tier = 'Ultimate';
  else if (/premium/.test(scan)) tier = 'Premium';
  else if (/classic/.test(scan)) tier = 'Classic';
  else if (nameTier) tier = nameTier.trim();

  return { kind: KIND.WHOLE_HOME, variant, tier };
};
