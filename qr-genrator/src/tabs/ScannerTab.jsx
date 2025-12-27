import { useState, useRef, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function ScannerTab() {
  const [scannedCode, setScannedCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const startCamera = async () => {
    try {
      setError('');
      setIsInitializing(true);
      setCameraActive(true);

      // Wait for DOM to render the qr-reader element
      setTimeout(async () => {
        try {
          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1.0,
              rememberLastUsedCamera: true,
              showTorchButtonIfSupported: true,
            },
            false
          );

          scannerRef.current = scanner;

          await scanner.render(
            (decodedText) => {
              // Success callback
              setScannedCode(decodedText);
              console.log('QR Code detected:', decodedText);
            },
            (error) => {
              // Error callback - silently continue scanning
              console.log('Scanning for QR codes...');
            }
          );

          setIsInitializing(false);
        } catch (err) {
          console.error('Scanner render error:', err);
          setError(`Camera Error: ${err.message || 'Unable to start camera. Make sure you have granted camera permission in your browser settings.'}`);
          setCameraActive(false);
          setIsInitializing(false);
        }
      }, 100);
    } catch (err) {
      console.error('Scanner error:', err);
      setError(`Camera Error: ${err.message || 'Unable to start camera. Make sure you have granted camera permission.'}`);
      setCameraActive(false);
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => {
          scannerRef.current = null;
          setCameraActive(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
          scannerRef.current = null;
          setCameraActive(false);
        });
    }
  };

  async function handleCopy() {
    if (!scannedCode) return;
    try {
      await navigator.clipboard.writeText(scannedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <section className="tab-panel">
      <div className="scanner-container">
        <div className="scanner-info">
          <h3>QR Code Scanner</h3>
          <p>Use your camera to scan QR codes and decode the data.</p>
        </div>

        {error && <div className="error">{error}</div>}

        {!cameraActive ? (
          <button className="btn primary big" onClick={startCamera} disabled={isInitializing}>
            {isInitializing ? '⏳ Initializing...' : '📱 Start Camera'}
          </button>
        ) : (
          <>
            {isInitializing && <p style={{ textAlign: 'center', color: '#888' }}>Loading camera...</p>}
            <div className="camera-feed" id="qr-reader" style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }} />
            <div className="scanner-actions">
              <button className="btn" onClick={stopCamera}>
                ⏹️ Stop Camera
              </button>
            </div>
          </>
        )}

        {scannedCode && (
          <div className="scanned-result">
            <div className="result-card">
              <h4>✅ Scanned Code</h4>
              <p className="scanned-text">{scannedCode}</p>
              <div className="result-actions">
                <a href={scannedCode} target="_blank" rel="noopener noreferrer">
                  <button className="btn primary">🔗 Open Link</button>
                </a>
                <button className="btn" onClick={handleCopy}>
                  {copied ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!cameraActive && (
          <div className="scanner-info info-box">
            <h4>💡 Tip</h4>
            <p>Point your camera at a QR code and the scanner will automatically detect it.</p>
          </div>
        )}
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
