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
          <label className="field">
            <span className="label">Text / URL</span>
            <input
              className="text-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter text or URL"
            />
          </label>

          <div className="row">
            <div className="field small">
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
            </div>

            <div className="field small">
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
            </div>
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
              Generate
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
            {loading ? (
              <div className="loader">Generating...</div>
            ) : dataUrl ? (
              <>
                <img
                  className="qr-image"
                  src={dataUrl}
                  alt={`QR code for ${text}`}
                  width={size}
                  height={size}
                />
                <div className="preview-actions">
                  <a href={dataUrl} download={`qrcode-${Date.now()}.png`}>
                    <button className="btn primary big">Download</button>
                  </a>
                  <button
                    className={`btn ${isFavorited(text) ? 'active' : ''}`}
                    onClick={() => toggleFavorite(text)}
                  >
                    {isFavorited(text) ? '❤️' : '🤍'} Favorite
                  </button>
                </div>
              </>
            ) : (
              <div className="empty">Try an example: <span className="example">https://example.com</span></div>
            )}
          </div>
        </div>
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
