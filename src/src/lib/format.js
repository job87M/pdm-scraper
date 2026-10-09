const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'GBP' });

export function formatPrice(price) {
  return Number.isFinite(price) ? currency.format(price) : 'Price unavailable';
}
