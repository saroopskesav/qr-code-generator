import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function SimpleTab({ addToHistory, toggleFavorite, isFavorited }) {
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const [size, setSize] = useState(400);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [darkColor, setDarkColor] = useState('#000000');
  const [errorLevel, setErrorLevel] = useState('M');
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!text) {
        setDataUrl('');
        return;
      }
      setLoading(true);
      try {
        const opts = {
          width: Number(size),
          color: { dark: darkColor, light: bgColor },
          errorCorrectionLevel: errorLevel,
        };
        const url = await QRCode.toDataURL(text, opts);
        if (!cancelled) setDataUrl(url);
      } catch (err) {
        console.error('QR generation failed', err);
        if (!cancelled) setDataUrl('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    generate();
    return () => { cancelled = true; };
  }, [text, size, bgColor, darkColor, errorLevel]);

  function handleGenerate() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter text or a URL to generate a QR code.');
      setText('');
      return;
    }
    setError('');
    setText(trimmed);
    addToHistory(trimmed);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleGenerate();
  }

  async function handleCopy() {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  return (
    <section className="tab-panel">
      <div className="content-row">
        <div className="controls-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">01 / THE DETAILS</span>
              <h2>Create your code</h2>
              <p>Start with something you want to share.</p>
            </div>
            <span className="panel-symbol" aria-hidden="true">↗</span>
          </div>
          <label className="field">
            <span className="label">Your link or text</span>
            <input
              className="text-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://example.com"
            />
          </label>

          <div className="row">
            <label className="field small">
              <span className="label">Size</span>
              <input
                className="range"
                type="range"
                min="200"
                max="800"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                aria-label="QR size"
              />
              <div className="value">{size}px</div>
            </label>

            <label className="field small">
              <span className="label">Error Correction</span>
              <select
                className="select"
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value)}
              >
                <option value="L">L (7%)</option>
                <option value="M">M (15%)</option>
                <option value="Q">Q (25%)</option>
                <option value="H">H (30%)</option>
              </select>
            </label>
          </div>

          <div className="row">
            <div className="field small color-field">
              <span className="label">Dark Modules</span>
              <div className="color-row">
                <input
                  className="color-input"
                  type="color"
                  value={darkColor}
                  onChange={(e) => setDarkColor(e.target.value)}
                  aria-label="Dark modules color"
                />
                <div className="hex">{darkColor.toUpperCase()}</div>
              </div>
            </div>

            <div className="field small color-field">
              <span className="label">Background</span>
              <div className="color-row">
                <input
                  className="color-input"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  aria-label="Background color"
                />
                <div className="hex">{bgColor.toUpperCase()}</div>
              </div>
            </div>
          </div>

          <div className="actions">
            <button
              className="btn primary pulse"
              onClick={handleGenerate}
              disabled={!input.trim()}
            >
              Generate QR code <span aria-hidden="true">↗</span>
            </button>
            <button
              className="btn"
              onClick={() => { setInput(''); setText(''); setDataUrl(''); setError(''); }}
            >
              Clear
            </button>
            <button className="btn outline" onClick={handleCopy} disabled={!dataUrl}>
              Copy Text
            </button>
          </div>

          <div className="status-row" aria-live="polite">
            {error && <div className="error">{error}</div>}
          </div>
        </div>

        <div className="preview-section">
          <div className="preview-card" role="region" aria-label="QR preview">
            <div className="preview-heading">
              <span>02 / THE PREVIEW</span>
              <span className="preview-badge"><span className="status-dot" /> {dataUrl ? 'READY' : 'WAITING'}</span>
            </div>
            {loading ? (
              <div className="loader">Generating...</div>
            ) : dataUrl ? (
              <div className="preview-result">
                <img
                  className="qr-image"
                  src={dataUrl}
                  alt={`QR code for ${text}`}
                  width={size}
                  height={size}
                />
                <div className="preview-actions">
                  <a className="btn primary big" href={dataUrl} download={`qrcode-${Date.now()}.png`}>Download <span aria-hidden="true">↓</span></a>
                  <button
                    className={`btn ${isFavorited(text) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(text)}
                  >
                    {isFavorited(text) ? '❤️' : '🤍'} Favorite
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <div className="empty-art" aria-hidden="true">
                  <svg viewBox="0 0 120 120" fill="none">
                    <rect x="11" y="11" width="36" height="36" rx="5" stroke="currentColor" strokeWidth="6" />
                    <rect x="22" y="22" width="14" height="14" rx="2" fill="currentColor" />
                    <rect x="73" y="11" width="36" height="36" rx="5" stroke="currentColor" strokeWidth="6" />
                    <rect x="84" y="22" width="14" height="14" rx="2" fill="currentColor" />
                    <rect x="11" y="73" width="36" height="36" rx="5" stroke="currentColor" strokeWidth="6" />
                    <rect x="22" y="84" width="14" height="14" rx="2" fill="currentColor" />
                    <path d="M61 14v12M61 39v19H47M13 60h22M61 72v13h14v-13h12M98 61h11v14H98v12h11v22H91M61 99v10h15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="empty-sparkle">✳</span>
                </div>
                <h3>A little square, a lot of possibility.</h3>
                <p>Your QR code will appear here once you hit generate.</p>
              </div>
            )}
            <div className="preview-footnote"><span aria-hidden="true">✦</span> YOUR NEXT GREAT IDEA STARTS HERE</div>
          </div>
        </div>
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
