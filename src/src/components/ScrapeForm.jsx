import { useRef, useState } from 'react';
import { scrape } from '../lib/scraper.js';
import { formatBytes, readFileAsText, validateHtmlFile } from '../lib/readFile.js';

export default function ScrapeForm({ onSaved }) {
  const [element, setElement] = useState('');
  const [file, setFile] = useState(null); // { name, size, text, capturedAt }
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const fileInput = useRef(null);

  async function chooseFile(candidate) {
    if (!candidate) return;
    const problem = validateHtmlFile(candidate);
    if (problem) {
      setStatus({ type: 'error', message: problem });
      return;
    }
    try {
      const text = await readFileAsText(candidate);
      setFile({
        name: candidate.name,
        size: candidate.size,
        text,
        capturedAt: candidate.lastModified
          ? new Date(candidate.lastModified).toISOString()
          : undefined,
      });
      setStatus({ type: '', message: '' });
    } catch (error) {
      setStatus({ type: 'error', message: error.message });
    }
  }

  function clearFile() {
    setFile(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pending) return;

    const html = file ? file.text : element;
    if (!html.trim()) {
      setStatus({
        type: 'error',
        message: 'Paste a product element or upload an HTML file to continue.',
      });
      return;
    }

    setPending(true);
    setStatus({
      type: 'loading',
      message: file ? `Scraping ${file.name}…` : 'Scraping product element…',
    });

    try {
      // Pure client-side scrape — no network call
      const saved = scrape(html, file?.capturedAt);
      onSaved(saved);
      setElement('');
      clearFile();
      setStatus({
        type: 'success',
        message:
          saved.length === 1
            ? 'Product added successfully.'
            : `${saved.length} products added successfully.`,
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to scrape this product element.',
      });
    } finally {
      setPending(false);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    chooseFile(event.dataTransfer.files?.[0]);
  }

  return (
    <section id="scrape" className="panel" aria-labelledby="scrape-title">
      <h2 id="scrape-title">Scrape a webpage element</h2>
      <p className="panel-lede">
        Paste the HTML for a product card, or upload a saved HTML page. Every product card
        (<code>data-testid="product-card"</code>) found is added. Data lives only in this browser
        session — export to CSV when ready.
      </p>
      <form id="scrape-form" onSubmit={handleSubmit}>
        <div
          className={`dropzone${dragging ? ' dragging' : ''}${file ? ' has-file' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="file-chip">
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatBytes(file.size)}</span>
              <button type="button" className="link-button" onClick={clearFile} disabled={pending}>
                Remove
              </button>
            </div>
          ) : (
            <>
              <span>Drop an HTML file here or</span>
              <label className="button button-secondary file-button" htmlFor="html-file">
                Choose HTML file
              </label>
            </>
          )}
          <input
            ref={fileInput}
            id="html-file"
            className="visually-hidden"
            type="file"
            accept=".html,.htm,.xhtml,.txt,text/html,text/plain"
            onChange={(event) => chooseFile(event.target.files?.[0])}
          />
        </div>

        <label htmlFor="product-element">
          {file
            ? 'Product element HTML (ignored while a file is attached)'
            : 'Or paste product element HTML'}
        </label>
        <textarea
          id="product-element"
          name="element"
          rows={file ? 3 : 8}
          value={element}
          disabled={Boolean(file)}
          onChange={(event) => setElement(event.target.value)}
          placeholder="Paste the product element HTML here"
        />
        <button type="submit" className="button" disabled={pending}>
          {pending ? 'Scraping…' : file ? 'Scrape file' : 'Scrape product'}
        </button>
        {status.message && (
          <p
            className={`form-status ${status.type}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.message}
          </p>
        )}
      </form>
    </section>
  );
}
