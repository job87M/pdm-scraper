const STORAGE_KEY = 'am-scraper.associateId';

/** Valid-looking Amazon Associate tag (letters, numbers, hyphens; typically ends in -20, -21, etc.). */
const TAG_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,48}[a-zA-Z0-9]$/;

export function getAssociateId() {
  try {
    return (localStorage.getItem(STORAGE_KEY) || '').trim();
  } catch {
    return '';
  }
}

export function setAssociateId(value) {
  const tag = (value || '').trim();
  try {
    if (tag) localStorage.setItem(STORAGE_KEY, tag);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode / quota — ignore */
  }
  return tag;
}

export function isValidAssociateId(value) {
  const tag = (value || '').trim();
  if (!tag) return true; // empty is allowed (clears the tag)
  return TAG_PATTERN.test(tag);
}

/**
 * Inject or replace the Amazon affiliate `tag` query parameter on a product URL.
 * Returns the original string if the URL is invalid or tag is empty.
 */
export function applyAssociateTag(url, tag) {
  const cleanTag = (tag || '').trim();
  if (!cleanTag || !url) return url;
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('tag', cleanTag);
    return parsed.href;
  } catch {
    return url;
  }
}
