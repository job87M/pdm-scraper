export function validateProduct(product) {
  if (!product || typeof product !== 'object' || Array.isArray(product)) {
    throw new Error('Product must be an object');
  }

  const title = typeof product.title === 'string' ? product.title.trim() : '';
  if (!title) throw new Error('Product title is required');

  let sourceUrl;
  try {
    sourceUrl = new URL(product.source_url);
  } catch {
    throw new Error('A valid product URL is required');
  }
  if (!['http:', 'https:'].includes(sourceUrl.protocol)) {
    throw new Error('Product URL must use HTTP or HTTPS');
  }

  const price = product.price ?? null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    throw new Error('Price must be a non-negative number or null');
  }

  const dealPercentage = product.deal_percentage ?? null;
  if (
    dealPercentage !== null &&
    (!Number.isFinite(dealPercentage) || dealPercentage < 0 || dealPercentage > 100)
  ) {
    throw new Error('Deal percentage must be between 0 and 100 or null');
  }

  return {
    source_url: sourceUrl.href,
    title,
    image_url: product.image_url ?? null,
    deal_percentage: dealPercentage,
    description: product.description ?? null,
    price,
  };
}

export const sampleProducts = [
  {
    id: 'sample-tv',
    source_url: 'https://www.amazon.co.uk/dp/B0GV57GHGL',
    title: 'Hisense 55-inch 4K Ultra HD Smart TV',
    image_url: 'https://m.media-amazon.com/images/I/711BZ55BvnL._AC_SF226,226_QL85_.jpg',
    deal_percentage: 43,
    description: '4K smart TV with Dolby Vision and voice control.',
    price: 330,
    created_at: '2026-10-07T09:00:00Z',
  },
  {
    id: 'sample-headphones',
    source_url: 'https://www.amazon.co.uk/dp/B0CXJBH48R',
    title: 'Bose QuietComfort SC Wireless Noise Cancelling Headphones',
    image_url: 'https://m.media-amazon.com/images/I/51aw022aEaL._AC_SF226,226_QL85_.jpg',
    deal_percentage: 44,
    description: 'Bluetooth over-ear headphones with up to 24 hours of battery life.',
    price: 161.45,
    created_at: '2026-10-07T09:05:00Z',
  },
  {
    id: 'sample-watch',
    source_url: 'https://www.amazon.co.uk/dp/B0FQFNPWC8',
    title: 'Apple Watch Series 11 GPS 42mm',
    image_url: 'https://m.media-amazon.com/images/I/71vJYtPpFsL._AC_SF226,226_QL85_.jpg',
    deal_percentage: 19,
    description: 'Smartwatch with sleep score, fitness tracking, and health monitoring.',
    price: 259,
    created_at: '2026-10-07T09:10:00Z',
  },
];
