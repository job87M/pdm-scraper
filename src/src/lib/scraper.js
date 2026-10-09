/**
 * Client-side Amazon product card scraper.
 * Parses pasted/uploaded HTML of product cards (data-testid="product-card")
 * using the browser DOMParser. No backend required.
 */

const AMAZON_IMAGE_HOST = 'https://m.media-amazon.com';
const TIMER_COMPONENT = 'badge-countdown-timer';
const UNIT_SECONDS = { d: 86400, h: 3600, m: 60, s: 1 };
const UNIT_RE = /(\d+)\s*(days?|d|hours?|hrs?|h|minutes?|mins?|m|seconds?|secs?|s)\b/gi;
const CLOCK_RE = /^\d+(?::\d+){1,3}$/;
const ENDS_IN_RE = /ends?\s+in\s+(\d+(?::\d+){1,3}|(?:\d+\s*[a-z]+\s*)+)/i;
const DESCRIPTOR_RE = /^(\d*\.?\d+)([xw])$/i;

function parseCountdownSeconds(text) {
  if (!text) return null;
  const value = text.trim();
  if (CLOCK_RE.test(value)) {
    const parts = value.split(':').map(Number);
    const multipliers = {
      2: [60, 1],
      3: [3600, 60, 1],
      4: [86400, 3600, 60, 1],
    };
    const mults = multipliers[parts.length];
    if (!mults) return null;
    return parts.reduce((sum, part, i) => sum + part * mults[i], 0);
  }
  let total = 0;
  let match;
  const re = new RegExp(UNIT_RE.source, 'gi');
  while ((match = re.exec(value)) !== null) {
    const unit = match[2][0].toLowerCase();
    total += parseInt(match[1], 10) * (UNIT_SECONDS[unit] || 0);
  }
  return total || null;
}

function toIso(date) {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function resolveCapturedAt(value) {
  const now = new Date();
  if (!value) return now;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return now;
  return parsed > now ? now : parsed;
}

function targetTime(value) {
  if (value == null) return null;
  let number = Number(value);
  if (!Number.isFinite(number) || number === 0) return null;
  if (number > 1e11) number /= 1000; // ms
  if (number > 1e9) return new Date(number * 1000);
  return null;
}

function dealEndTime(root, capturedAt) {
  const timers = root.querySelectorAll(`[data-component="${TIMER_COMPONENT}"]`);
  for (const node of timers) {
    const absolute = targetTime(node.getAttribute('data-target-time'));
    if (absolute) return toIso(absolute);
    const seconds = parseCountdownSeconds(node.textContent);
    if (seconds != null) {
      return toIso(new Date(capturedAt.getTime() + seconds * 1000));
    }
  }
  const text = root.textContent || '';
  const match = ENDS_IN_RE.exec(text);
  if (match) {
    const seconds = parseCountdownSeconds(match[1]);
    if (seconds != null) {
      return toIso(new Date(capturedAt.getTime() + seconds * 1000));
    }
  }
  return null;
}

function parseSrcset(srcset) {
  const candidates = [];
  const tokens = srcset.split(/\s+/);
  let i = 0;
  while (i < tokens.length) {
    let url = tokens[i++];
    let weight = 1;
    if (url.endsWith(',')) {
      url = url.replace(/,$/, '');
    } else if (i < tokens.length) {
      const desc = tokens[i].replace(/,$/, '');
      const m = DESCRIPTOR_RE.exec(desc);
      if (m) {
        weight = parseFloat(m[1]);
        i++;
      }
    }
    if (url) candidates.push({ weight, url });
  }
  return candidates.sort((a, b) => b.weight - a.weight).map((c) => c.url);
}

function normalizeImageUrl(value) {
  if (typeof value !== 'string') return null;
  let raw = value.trim();
  if (!raw || raw === 'about:blank' || /^(data|blob|javascript):/i.test(raw)) return null;
  if (raw.startsWith('//')) raw = `https:${raw}`;
  if (raw.startsWith('/images/')) return `${AMAZON_IMAGE_HOST}${raw}`;

  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname) return null;
    const host = parsed.hostname.toLowerCase();
    if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(host)) {
      if (parsed.pathname.startsWith('/images/')) {
        return `${AMAZON_IMAGE_HOST}${parsed.pathname}${parsed.search}`;
      }
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

function firstImageUrl(candidates) {
  for (const c of candidates) {
    const n = normalizeImageUrl(c);
    if (n) return n;
  }
  return null;
}

function imageCandidates(el) {
  const candidates = [];
  const srcset = el.getAttribute('srcset') || el.getAttribute('data-srcset');
  if (srcset) candidates.push(...parseSrcset(srcset));
  for (const key of ['data-old-hires', 'data-a-hires', 'src', 'data-src']) {
    const v = el.getAttribute(key);
    if (v) candidates.push(v);
  }
  const dynamic = el.getAttribute('data-a-dynamic-image');
  if (dynamic) {
    try {
      const images = JSON.parse(dynamic);
      if (images) {
        if (Array.isArray(images)) candidates.push(images[0]);
        else candidates.push(Object.keys(images)[0]);
      }
    } catch {
      /* ignore */
    }
  }
  return candidates;
}

function parsePrice(text) {
  if (text == null) return null;
  if (typeof text === 'number' && Number.isFinite(text)) return text;
  const str = String(text);
  const match = str.match(/\d[\d,]*(?:\.\d{1,2})?/);
  if (!match) return null;
  const n = parseFloat(match[0].replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function extractProduct(card, capturedAt) {
  // Title: prefer a-truncate-full, fallback to img alt
  let titleEl = card.querySelector('.a-truncate-full');
  let title = titleEl ? titleEl.textContent.trim() : '';
  if (!title) {
    const img = card.querySelector('img');
    title = (img && img.getAttribute('alt')) || '';
    title = title.trim();
  }

  // Link
  const link = card.querySelector('a[data-testid="product-card-link"][href]');
  let sourceUrl = link ? link.getAttribute('href') : null;
  if (sourceUrl && sourceUrl.startsWith('/')) {
    sourceUrl = `https://www.amazon.com${sourceUrl}`;
  }
  // Make absolute if relative amazon path
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
    try {
      sourceUrl = new URL(sourceUrl, 'https://www.amazon.com').href;
    } catch {
      /* keep as-is */
    }
  }

  if (!title || !sourceUrl) return null;

  // Deal %
  let dealPercentage = null;
  const dealBadge = Array.from(card.querySelectorAll('[class*="style_filledRoundedBadgeLabel__"]')).find(
    (n) => n.textContent,
  );
  if (dealBadge) {
    const m = dealBadge.textContent.match(/([\d.]+)\s*%/);
    if (m) dealPercentage = parseFloat(m[1]);
  }
  if (dealPercentage == null) {
    const m = (card.textContent || '').match(/(\d+(?:\.\d+)?)\s*%\s*off/i);
    if (m) dealPercentage = parseFloat(m[1]);
  }

  // Price
  let price = null;
  const priceToPay = card.querySelector('[class*="ProductCard-module__priceToPay"]');
  if (priceToPay) {
    const offscreen = priceToPay.querySelector('.a-offscreen');
    const text = offscreen ? offscreen.textContent : priceToPay.textContent;
    price = parsePrice((text || '').replace(/^With deal:\s*/i, ''));
  }
  if (price == null) {
    const priceSection = card.querySelector('[data-testid="price-section"]');
    if (priceSection) {
      const off = priceSection.querySelector('.a-offscreen');
      if (off) price = parsePrice(off.textContent);
    }
  }

  // Image
  let imageUrl = null;
  for (const img of card.querySelectorAll('img')) {
    imageUrl = firstImageUrl(imageCandidates(img));
    if (imageUrl) break;
  }

  return {
    source_url: sourceUrl,
    title,
    image_url: imageUrl,
    deal_percentage: dealPercentage,
    description: title, // cards rarely have separate description
    price,
    deal_ends_at: dealEndTime(card, capturedAt),
  };
}

/**
 * Scrape one or more product cards from HTML string.
 * @param {string} html
 * @param {string|null} capturedAtIso - ISO timestamp when HTML was captured
 * @returns {Array<object>} scraped products (without id/created_at)
 */
export function scrapeProductCards(html, capturedAtIso = null) {
  const capturedAt = resolveCapturedAt(capturedAtIso);
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const cards = doc.querySelectorAll('[data-testid="product-card"]');
  const products = [];
  for (const card of cards) {
    const product = extractProduct(card, capturedAt);
    if (product) products.push(product);
  }
  return products;
}

/**
 * Validate & normalize a scraped product, adding id + created_at.
 */
export function finalizeProduct(raw) {
  const title = typeof raw.title === 'string' ? raw.title.trim() : '';
  if (!title) throw new Error('Product title is required');

  let sourceUrl;
  try {
    sourceUrl = new URL(raw.source_url);
  } catch {
    throw new Error('A valid product URL is required');
  }
  if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
    throw new Error('Product URL must use HTTP or HTTPS');
  }
  const host = sourceUrl.hostname.toLowerCase();
  if (
    !(
      host === 'amazon.com' ||
      host.startsWith('www.amazon.') ||
      host.includes('.amazon.')
    )
  ) {
    throw new Error('source_url must be an Amazon product URL');
  }

  const price = raw.price ?? null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    throw new Error('Price must be a non-negative number or null');
  }

  const dealPercentage = raw.deal_percentage ?? null;
  if (
    dealPercentage !== null &&
    (!Number.isFinite(dealPercentage) || dealPercentage < 0 || dealPercentage > 100)
  ) {
    throw new Error('Deal percentage must be between 0 and 100 or null');
  }

  return {
    id: crypto.randomUUID(),
    source_url: sourceUrl.href,
    title,
    image_url: normalizeImageUrl(raw.image_url) || null,
    deal_percentage: dealPercentage,
    description: raw.description ?? null,
    price,
    deal_ends_at: raw.deal_ends_at ?? null,
    created_at: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'),
  };
}

/**
 * Main entry: scrape HTML and return finalized products.
 */
export function scrape(html, capturedAtIso = null) {
  const element = (html || '').trim();
  if (!element) throw new Error('element is required');

  let scraped = scrapeProductCards(element, capturedAtIso);
  if (scraped.length === 0) {
    // Fallback: try treating the whole document as a single card context
    // (for older single-product HTML that still has data-testid)
    throw new Error(
      'No product card found. Paste the full product card HTML (the element with data-testid="product-card").',
    );
  }

  const results = [];
  for (const raw of scraped) {
    try {
      results.push(finalizeProduct(raw));
    } catch {
      // skip invalid
    }
  }
  if (results.length === 0) {
    throw new Error('Element is missing required product details');
  }
  return results;
}
