import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function AdvancedTab({ addToHistory, toggleFavorite, isFavorited }) {
  const [advancedSection, setAdvancedSection] = useState('preview'); // 'preview', 'batch', 'logo'
  
  // Preview section states
  const [input, setInput] = useState('');
  const [text, setText] = useState('');
  const [size, setSize] = useState(400);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [darkColor, setDarkColor] = useState('#000000');
  const [errorLevel, setErrorLevel] = useState('M');
  const [previewSizes, setPreviewSizes] = useState([200, 300, 400, 600]);
  const [dataUrl, setDataUrl] = useState('');
  const [previewUrls, setPreviewUrls] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Batch section states
  const [batchInput, setBatchInput] = useState('');
  const [batchQrCodes, setBatchQrCodes] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState('');
  
  // Logo section states
  const [logoText, setLogoText] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [logoSize, setLogoSize] = useState(80);
  const [logoDataUrl, setLogoDataUrl] = useState('');
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoError, setLogoError] = useState('');

  // Preview QR generation
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

  // Generate preview grid
  useEffect(() => {
    const generatePreviews = async () => {
      if (!text) return;
      const urls = {};
      for (const sz of previewSizes) {
        try {
          const url = await QRCode.toDataURL(text, {
            width: sz,
            color: { dark: darkColor, light: bgColor },
            errorCorrectionLevel: errorLevel,
          });
          urls[sz] = url;
        } catch (err) {
          console.error(`Failed to generate preview for size ${sz}`, err);
        }
      }
      setPreviewUrls(urls);
    };
    generatePreviews();
  }, [text, previewSizes, bgColor, darkColor, errorLevel]);

  // Preview section handlers
  function handleGeneratePreview() {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter text or a URL.');
      setText('');
      return;
    }
    setError('');
    setText(trimmed);
    addToHistory(trimmed);
  }

  // Batch section handlers
  const generateBatch = async () => {
    const lines = batchInput.split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      setBatchError('Please enter data to batch generate.');
      return;
    }
    
    setBatchError('');
    setBatchLoading(true);
    
    try {
      const qrCodes = [];
      for (let i = 0; i < lines.length; i++) {
        const data = lines[i];
        const url = await QRCode.toDataURL(data, {
          width: 300,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        qrCodes.push({ id: i, text: data, url });
        addToHistory(data);
      }
      setBatchQrCodes(qrCodes);
    } catch (err) {
      console.error('Batch generation failed:', err);
      setBatchError('Failed to generate QR codes. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  const downloadBatchQRs = () => {
    if (batchQrCodes.length === 0) return;
    
    // Create a simple HTML page with all QR codes
    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Batch QR Codes</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    .qr-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-top: 20px; }
    .qr-item { border: 1px solid #ccc; padding: 15px; text-align: center; break-inside: avoid; }
    .qr-item img { max-width: 300px; margin: 10px 0; }
    .qr-item p { margin: 10px 0; word-break: break-all; }
    @media print { .qr-container { grid-template-columns: repeat(3, 1fr); } }
  </style>
</head>
<body>
  <h1>Generated QR Codes</h1>
  <div class="qr-container">`;
    
    batchQrCodes.forEach((qr) => {
      html += `
    <div class="qr-item">
      <img src="${qr.url}" alt="QR Code">
      <p><strong>${qr.text}</strong></p>
    </div>`;
    });
    
    html += `</div></body></html>`;
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `batch-qr-codes-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Logo section handlers
  const generateLogoQR = async () => {
    if (!logoText.trim()) {
      setLogoError('Please enter text or URL');
      return;
    }
    
    setLogoError('');
    setLogoLoading(true);
    
    try {
      const url = await QRCode.toDataURL(logoText, {
        width: 400,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'H', // High error correction for logo overlay
      });
      setLogoDataUrl(url);
    } catch (err) {
      console.error('Logo QR generation failed:', err);
      setLogoError('Failed to generate QR code');
    } finally {
      setLogoLoading(false);
    }
  };

  const downloadLogoQR = () => {
    if (!logoDataUrl) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Add logo image if provided
      if (logoUrl) {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        logoImg.onload = () => {
          const logoWidth = (logoSize / 100) * canvas.width;
          const logoHeight = (logoSize / 100) * canvas.height;
          const x = (canvas.width - logoWidth) / 2;
          const y = (canvas.height - logoHeight) / 2;
          
          // Draw white background for logo
          ctx.fillStyle = 'white';
          ctx.fillRect(x - 5, y - 5, logoWidth + 10, logoHeight + 10);
          
          // Draw logo
          ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
          
          // Download
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-with-logo-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          });
        };
        logoImg.onerror = () => {
          // If logo fails to load, just download the QR code
          canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `qr-code-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
          });
        };
        logoImg.src = logoUrl;
      } else {
        // Download QR code without logo
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qr-code-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
        });
      }
    };
    
    img.src = logoDataUrl;
  };

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
      <div className="advanced-container">
        <div className="advanced-tabs">
          <button 
            className={`advanced-tab-btn ${advancedSection === 'preview' ? 'active' : ''}`}
            onClick={() => setAdvancedSection('preview')}
          >
            📊 Multi-Size Preview
          </button>
          <button 
            className={`advanced-tab-btn ${advancedSection === 'batch' ? 'active' : ''}`}
            onClick={() => setAdvancedSection('batch')}
          >
            📦 Batch Generation
          </button>
          <button 
            className={`advanced-tab-btn ${advancedSection === 'logo' ? 'active' : ''}`}
            onClick={() => setAdvancedSection('logo')}
          >
            🎨 Logo Overlay
          </button>
        </div>

        {/* Multi-Size Preview */}
        <div className="advanced-section" style={{ display: advancedSection === 'preview' ? 'flex' : 'none' }}>
          <div className="content-row">
            <div className="controls-panel">
              <label className="field">
                <span className="label">Text / URL</span>
                <input
                  className="text-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGeneratePreview()}
                  placeholder="Enter text or URL"
                />
              </label>

              <div className="row">
                <div className="field small">
                  <span className="label">Main Size</span>
                  <input
                    className="range"
                    type="range"
                    min="200"
                    max="800"
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                  />
                  <div className="value">{size}px</div>
                </div>

                <div className="field small">
                  <span className="label">Error Level</span>
                  <select className="select" value={errorLevel} onChange={(e) => setErrorLevel(e.target.value)}>
                    <option value="L">L (7%)</option>
                    <option value="M">M (15%)</option>
                    <option value="Q">Q (25%)</option>
                    <option value="H">H (30%)</option>
                  </select>
                </div>
              </div>

              <div className="row">
                <div className="field small color-field">
                  <span className="label">Dark</span>
                  <input
                    className="color-input"
                    type="color"
                    value={darkColor}
                    onChange={(e) => setDarkColor(e.target.value)}
                  />
                </div>
                <div className="field small color-field">
                  <span className="label">Light</span>
                  <input
                    className="color-input"
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="actions">
                <button className="btn primary" onClick={handleGeneratePreview} disabled={!input.trim()}>
                  Generate Previews
                </button>
              </div>

              {error && <div className="error">{error}</div>}
            </div>

            <div className="preview-section">
              {text && (
                <div className="grid-preview">
                  <h4>Preview Grid</h4>
                  <div className="grid">
                    {previewSizes.map((sz) => (
                      <div key={sz} className="grid-item">
                        {previewUrls[sz] && (
                          <>
                            <img src={previewUrls[sz]} alt={`${sz}px QR`} />
                            <p>{sz}px</p>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Batch Generation */}
        <div className="advanced-section" style={{ display: advancedSection === 'batch' ? 'flex' : 'none', flexDirection: 'column' }}>
          <label className="field">
            <span className="label">Data (one per line)</span>
            <textarea
              className="text-input"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="https://example.com&#10;test@example.com&#10;+1-555-1234"
              rows="6"
            />
          </label>
          <div className="actions">
            <button className="btn primary" onClick={generateBatch} disabled={batchLoading || !batchInput.trim()}>
              {batchLoading ? 'Generating...' : `Generate ${batchInput.split('\n').filter((l) => l.trim()).length} QR Codes`}
            </button>
          </div>

          {batchError && <div className="error">{batchError}</div>}

          {batchQrCodes.length > 0 && (
            <>
              <div className="actions" style={{ marginTop: '16px' }}>
                <button className="btn primary" onClick={downloadBatchQRs}>
                  Download All as HTML ({batchQrCodes.length})
                </button>
              </div>
              <div className="batch-grid">
                {batchQrCodes.slice(0, 8).map((qr) => (
                  <div key={qr.id} className="batch-item">
                    <img src={qr.url} alt={`QR ${qr.id}`} />
                    <p title={qr.text}>{qr.text.substring(0, 30)}{qr.text.length > 30 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
              {batchQrCodes.length > 8 && (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '12px' }}>
                  Showing first 8 of {batchQrCodes.length} QR codes
                </p>
              )}
            </>
          )}
        </div>

        {/* Logo Overlay */}
        <div className="advanced-section" style={{ display: advancedSection === 'logo' ? 'flex' : 'none', flexDirection: 'column' }}>
          <label className="field">
            <span className="label">Text / URL</span>
            <input
              className="text-input"
              type="text"
              value={logoText}
              onChange={(e) => setLogoText(e.target.value)}
              placeholder="https://example.com"
            />
          </label>

          <label className="field">
            <span className="label">Logo Image URL</span>
            <input
              className="text-input"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </label>

          <label className="field small">
            <span className="label">Logo Size (%)</span>
            <input
              className="range"
              type="range"
              min="10"
              max="40"
              value={logoSize}
              onChange={(e) => setLogoSize(Number(e.target.value))}
            />
            <div className="value">{logoSize}%</div>
          </label>

          <div className="actions">
            <button className="btn primary" onClick={generateLogoQR} disabled={logoLoading || !logoText.trim()}>
              {logoLoading ? 'Generating...' : 'Generate QR with Logo'}
            </button>
          </div>

          {logoError && <div className="error">{logoError}</div>}

          {logoDataUrl && (
            <>
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <img src={logoDataUrl} alt="QR with Logo" style={{ maxWidth: '300px', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }} />
              </div>
              <div className="actions" style={{ marginTop: '16px' }}>
                <button className="btn primary" onClick={downloadLogoQR}>
                  Download
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
