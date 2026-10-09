export const MAX_HTML_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(html?|xhtml|txt)$/i;

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error message, or '' if the file can be scraped. */
export function validateHtmlFile(file) {
  if (!ALLOWED_EXTENSIONS.test(file.name) && !/html|text\/plain/i.test(file.type)) {
    return 'Please choose an .html, .htm or .txt file.';
  }
  if (file.size === 0) return 'That file is empty.';
  if (file.size > MAX_HTML_FILE_BYTES) {
    return `That file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_HTML_FILE_BYTES)}.`;
  }
  return '';
}

export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Unable to read that file.'));
    reader.readAsText(file);
  });
}
