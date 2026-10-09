import { useState } from 'react';
import { downloadCsv, exportFilename, productsToCsv } from '../lib/exportCsv.js';

export default function ExportPanel({ products }) {
  const [category, setCategory] = useState('');
  const [live, setLive] = useState('yes');
  const [countries, setCountries] = useState('');
  const [includeEnds, setIncludeEnds] = useState(true);

  function handleExport(event) {
    event.preventDefault();
    downloadCsv(
      productsToCsv(products, { category, live: live === 'yes', countries, includeEndsAt: includeEnds }),
      exportFilename(),
    );
  }

  const count = products.length;

  return (
    <details className="export-panel">
      <summary>Export CSV</summary>
      <form onSubmit={handleExport}>
        <p className="export-hint">
          Uses the affiliate products template. Category, live and countries aren’t tracked here,
          so set them for this export.
        </p>
        <div className="export-fields">
          <label>
            Category
            <input
              type="text"
              value={category}
              placeholder="Recommended Gear > Microphones & Stands"
              onChange={(event) => setCategory(event.target.value)}
            />
          </label>
          <label>
            Live
            <select value={live} onChange={(event) => setLive(event.target.value)}>
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>
          <label>
            Countries
            <input
              type="text"
              value={countries}
              placeholder="Optional, e.g. GB"
              onChange={(event) => setCountries(event.target.value)}
            />
          </label>
        </div>
        <label className="export-check">
          <input type="checkbox" checked={includeEnds} onChange={(event) => setIncludeEnds(event.target.checked)} />
          Include deal end time (extra <code>ends_at</code> column after the template columns)
        </label>
        <button type="submit" className="button" disabled={count === 0}>
          Download CSV ({count} {count === 1 ? 'product' : 'products'})
        </button>
      </form>
    </details>
  );
}
