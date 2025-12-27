import { useState, useRef, useEffect } from 'react';

export default function ScannerTab() {
  const [scannedCode, setScannedCode] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setError('Unable to access camera. Make sure you have granted permission.');
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      setCameraActive(false);
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);

    // Simulate QR code detection (in production, use html5-qrcode library)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    console.log('Image captured for QR detection:', imageData);

    // Placeholder: simulate a detected code
    setScannedCode('https://example.com/detected');
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
          <button className="btn primary big" onClick={startCamera}>
            📱 Start Camera
          </button>
        ) : (
          <>
            <div className="camera-feed">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                style={{ width: '100%', borderRadius: '10px' }}
              />
              <div className="scanning-overlay">
                <div className="scan-box" />
              </div>
            </div>
            <div className="scanner-actions">
              <button className="btn primary" onClick={captureFrame}>
                📸 Capture & Scan
              </button>
              <button className="btn" onClick={stopCamera}>
                Stop Camera
              </button>
            </div>
          </>
        )}

        {scannedCode && (
          <div className="scanned-result">
            <div className="result-card">
              <h4>Scanned Code</h4>
              <p className="scanned-text">{scannedCode}</p>
              <div className="result-actions">
                <a href={scannedCode} target="_blank" rel="noopener noreferrer">
                  <button className="btn primary">🔗 Open Link</button>
                </a>
                <button className="btn" onClick={handleCopy}>
                  Copy
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="scanner-info info-box">
          <h4>💡 Tip</h4>
          <p>Point your camera at a QR code and tap "Capture & Scan" to decode it.</p>
        </div>
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
