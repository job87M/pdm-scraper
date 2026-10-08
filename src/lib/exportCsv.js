// Column order matches affiliate-products-template.csv.
export const CSV_COLUMNS = [
  'name',
  'url',
  'description',
  'image_url',
  'category',
  'discount_percent',
  'indicative_price',
  'live',
  'countries',
];

// Spreadsheet apps run cells starting with these characters as formulas.
const FORMULA_START = /^[=+@\t\r]/;

function csvCell(value, { text = false } = {}) {
  let cell = value === null || value === undefined ? '' : String(value);
  if (text && FORMULA_START.test(cell)) cell = `'${cell}`;
  return /[",\r\n]/.test(cell) ? `"${cell.replaceAll('"', '""')}"` : cell;
}

const formatDiscount = (value) => (Number.isFinite(value) ? String(Number(value.toFixed(2))) : '');
const formatPrice = (value) => (Number.isFinite(value) ? value.toFixed(2) : '');

/**
 * Build the CSV text for the affiliate products import template.
 * `options` fills columns the tracker does not store: category, live, countries.
 */
export const ENDS_AT_COLUMN = 'ends_at';

// Deal end time as UTC ISO 8601 without milliseconds, e.g. 2026-10-08T14:30:00Z.
function formatEndsAt(value) {
  const time = value ? Date.parse(value) : NaN;
  return Number.isNaN(time) ? '' : new Date(time).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

export function productsToCsv(
  products,
  { category = '', live = true, countries = '', includeEndsAt = false } = {},
) {
  const rows = products.map((product) => [
    csvCell(product.title, { text: true }),
    csvCell(product.source_url),
    csvCell(product.description, { text: true }),
    csvCell(product.image_url),
    csvCell(category.trim(), { text: true }),
    csvCell(formatDiscount(product.deal_percentage)),
    csvCell(formatPrice(product.price)),
    live ? 'yes' : 'no',
    csvCell(countries.trim()),
    ...(includeEndsAt ? [csvCell(formatEndsAt(product.deal_ends_at))] : []),
  ]);
  const header = includeEndsAt ? [...CSV_COLUMNS, ENDS_AT_COLUMN] : CSV_COLUMNS;
  return [header.join(','), ...rows.map((row) => row.join(','))].join('\r\n') + '\r\n';
}

export function exportFilename(date = new Date()) {
  return `affiliate-products-${date.toISOString().slice(0, 10)}.csv`;
}

export function downloadCsv(csv, filename) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
