import { useState } from 'react';
import { isValidAssociateId } from '../lib/associateId.js';

export default function Settings({ associateId, onSave }) {
  const [value, setValue] = useState(associateId);
  const [status, setStatus] = useState({ type: '', message: '' });

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!isValidAssociateId(trimmed)) {
      setStatus({
        type: 'error',
        message:
          'That does not look like a valid Associate ID. Use letters, numbers and hyphens only (e.g. myblog-20).',
      });
      return;
    }
    onSave(trimmed);
    setValue(trimmed);
    setStatus({
      type: 'success',
      message: trimmed
        ? `Associate ID saved. Product links will include tag=${trimmed}.`
        : 'Associate ID cleared. Product links will be exported without a tag.',
    });
  }

  function handleClear() {
    setValue('');
    onSave('');
    setStatus({
      type: 'success',
      message: 'Associate ID cleared. Product links will be exported without a tag.',
    });
  }

  return (
    <section id="settings" className="panel" aria-labelledby="settings-title">
      <h2 id="settings-title">Settings</h2>
      <p className="panel-lede">
        Set your Amazon Associates tracking ID once. It is stored in this browser and applied to
        every product link (on-screen and in CSV exports).
      </p>

      <form id="settings-form" onSubmit={handleSubmit}>
        <label htmlFor="associate-id">Amazon Associate ID (tag)</label>
        <input
          id="associate-id"
          type="text"
          name="associateId"
          autoComplete="off"
          spellCheck={false}
          placeholder="e.g. myblog-20"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setStatus({ type: '', message: '' });
          }}
        />
        <p className="field-hint">
          Found in your Amazon Associates account. It is added as{' '}
          <code>?tag=your-id</code> (or replaces an existing <code>tag</code> parameter).
        </p>

        <div className="form-actions">
          <button type="submit" className="button">
            Save
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={handleClear}
            disabled={!value && !associateId}
          >
            Clear
          </button>
        </div>

        {status.message && (
          <p
            className={`form-status ${status.type}`}
            role={status.type === 'error' ? 'alert' : 'status'}
          >
            {status.message}
          </p>
        )}

        {associateId && !status.message && (
          <p className="form-status success" role="status">
            Currently using <code>tag={associateId}</code>
          </p>
        )}
      </form>
    </section>
  );
}
