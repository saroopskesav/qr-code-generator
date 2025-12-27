import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

export default function FormatsTab({ addToHistory, toggleFavorite, isFavorited }) {
  const [format, setFormat] = useState('email');
  const [qrData, setQrData] = useState('');
  const [dataUrl, setDataUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email
  const [email, setEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  // Phone
  const [phone, setPhone] = useState('');

  // SMS
  const [smsPhone, setSmsPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // WiFi
  const [wifiSSID, setWifiSSID] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiSecurity, setWifiSecurity] = useState('WPA');

  // vCard
  const [vcardName, setVcardName] = useState('');
  const [vcardPhone, setVcardPhone] = useState('');
  const [vcardEmail, setVcardEmail] = useState('');
  const [vcardOrg, setVcardOrg] = useState('');
  const [vcardURL, setVcardURL] = useState('');

  useEffect(() => {
    let cancelled = false;
    const generate = async () => {
      if (!qrData) {
        setDataUrl('');
        return;
      }
      console.log('Starting QR generation for:', qrData);
      setLoading(true);
      try {
        const url = await QRCode.toDataURL(qrData, {
          width: 400,
          color: { dark: '#000000', light: '#ffffff' },
          errorCorrectionLevel: 'M',
        });
        if (!cancelled) {
          console.log('QR generated successfully');
          setDataUrl(url);
          addToHistory(qrData);
        }
      } catch (err) {
        console.error('QR generation failed', err);
        if (!cancelled) setDataUrl('');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    generate();
    return () => { cancelled = true; };
  }, [qrData]);

  const generateEmail = () => {
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    const subject = emailSubject ? `subject=${encodeURIComponent(emailSubject)}` : '';
    const body = emailBody ? `body=${encodeURIComponent(emailBody)}` : '';
    const params = [subject, body].filter(Boolean).join('&');
    const link = `mailto:${email}${params ? '?' + params : ''}`;
    console.log('Generating Email QR:', link);
    setQrData(link);
  };

  const generatePhone = () => {
    if (!phone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    const data = `tel:${phone.replace(/\s/g, '')}`;
    console.log('Generating Phone QR:', data);
    setQrData(data);
  };

  const generateSMS = () => {
    if (!smsPhone.trim()) {
      alert('Please enter a phone number');
      return;
    }
    const encoded = `sms:${smsPhone.replace(/\s/g, '')}?body=${encodeURIComponent(smsMessage)}`;
    console.log('Generating SMS QR:', encoded);
    setQrData(encoded);
  };

  const generateWiFi = () => {
    if (!wifiSSID.trim()) {
      alert('Please enter WiFi SSID');
      return;
    }
    const encoded = `WIFI:T:${wifiSecurity};S:${wifiSSID};P:${wifiPassword};;`;
    console.log('Generating WiFi QR:', encoded);
    setQrData(encoded);
  };

  const generateVCard = () => {
    if (!vcardName.trim()) {
      alert('Please enter a name');
      return;
    }
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${vcardName}`,
      vcardPhone && `TEL:${vcardPhone}`,
      vcardEmail && `EMAIL:${vcardEmail}`,
      vcardOrg && `ORG:${vcardOrg}`,
      vcardURL && `URL:${vcardURL}`,
      'END:VCARD',
    ].filter(Boolean).join('\n');
    console.log('Generating vCard QR:', vcard);
    setQrData(vcard);
  };

  async function handleCopy() {
    if (!dataUrl) return;
    try {
      await navigator.clipboard.writeText(qrData);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (e) {
      console.error('copy failed', e);
    }
  }

  return (
    <section className="tab-panel">
      <div className="format-selector">
        {['email', 'phone', 'sms', 'wifi', 'vcard'].map((fmt) => (
          <button
            key={fmt}
            className={`format-btn ${format === fmt ? 'active' : ''}`}
            onClick={() => setFormat(fmt)}
          >
            {fmt === 'email' && '✉️ Email'}
            {fmt === 'phone' && '☎️ Phone'}
            {fmt === 'sms' && '💬 SMS'}
            {fmt === 'wifi' && '📶 WiFi'}
            {fmt === 'vcard' && '👤 vCard'}
          </button>
        ))}
      </div>

      <div className="content-row">
        <div className="controls-panel">
          {format === 'email' && (
            <>
              <label className="field">
                <span className="label">Email Address</span>
                <input
                  className="text-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </label>
              <label className="field">
                <span className="label">Subject (optional)</span>
                <input
                  className="text-input"
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </label>
              <label className="field">
                <span className="label">Message (optional)</span>
                <textarea
                  className="text-input"
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Email body"
                  rows="3"
                />
              </label>
              <button className="btn primary" onClick={generateEmail} disabled={!email}>
                Generate Email QR
              </button>
            </>
          )}

          {format === 'phone' && (
            <>
              <label className="field">
                <span className="label">Phone Number</span>
                <input
                  className="text-input"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </label>
              <button className="btn primary" onClick={generatePhone} disabled={!phone}>
                Generate Phone QR
              </button>
            </>
          )}

          {format === 'sms' && (
            <>
              <label className="field">
                <span className="label">Phone Number</span>
                <input
                  className="text-input"
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </label>
              <label className="field">
                <span className="label">Message (optional)</span>
                <textarea
                  className="text-input"
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="SMS message"
                  rows="3"
                />
              </label>
              <button className="btn primary" onClick={generateSMS} disabled={!smsPhone}>
                Generate SMS QR
              </button>
            </>
          )}

          {format === 'wifi' && (
            <>
              <label className="field">
                <span className="label">Network SSID</span>
                <input
                  className="text-input"
                  type="text"
                  value={wifiSSID}
                  onChange={(e) => setWifiSSID(e.target.value)}
                  placeholder="Network name"
                />
              </label>
              <label className="field">
                <span className="label">Password</span>
                <input
                  className="text-input"
                  type="password"
                  value={wifiPassword}
                  onChange={(e) => setWifiPassword(e.target.value)}
                  placeholder="Network password"
                />
              </label>
              <label className="field">
                <span className="label">Security</span>
                <select className="select" value={wifiSecurity} onChange={(e) => setWifiSecurity(e.target.value)}>
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None</option>
                </select>
              </label>
              <button className="btn primary" onClick={generateWiFi} disabled={!wifiSSID}>
                Generate WiFi QR
              </button>
            </>
          )}

          {format === 'vcard' && (
            <>
              <label className="field">
                <span className="label">Full Name *</span>
                <input
                  className="text-input"
                  type="text"
                  value={vcardName}
                  onChange={(e) => setVcardName(e.target.value)}
                  placeholder="John Doe"
                />
              </label>
              <label className="field">
                <span className="label">Phone (optional)</span>
                <input
                  className="text-input"
                  type="tel"
                  value={vcardPhone}
                  onChange={(e) => setVcardPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </label>
              <label className="field">
                <span className="label">Email (optional)</span>
                <input
                  className="text-input"
                  type="email"
                  value={vcardEmail}
                  onChange={(e) => setVcardEmail(e.target.value)}
                  placeholder="john@example.com"
                />
              </label>
              <label className="field">
                <span className="label">Organization (optional)</span>
                <input
                  className="text-input"
                  type="text"
                  value={vcardOrg}
                  onChange={(e) => setVcardOrg(e.target.value)}
                  placeholder="Company name"
                />
              </label>
              <label className="field">
                <span className="label">Website (optional)</span>
                <input
                  className="text-input"
                  type="url"
                  value={vcardURL}
                  onChange={(e) => setVcardURL(e.target.value)}
                  placeholder="https://example.com"
                />
              </label>
              <button className="btn primary" onClick={generateVCard} disabled={!vcardName}>
                Generate vCard QR
              </button>
            </>
          )}
        </div>

        <div className="preview-section">
          <div className="preview-card">
            {loading ? (
              <div className="loader">Generating...</div>
            ) : dataUrl ? (
              <>
                <img className="qr-image" src={dataUrl} alt={`${format} QR code`} />
                <div className="preview-actions">
                  <a href={dataUrl} download={`qrcode-${format}-${Date.now()}.png`}>
                    <button className="btn primary big">Download</button>
                  </a>
                  <button className="btn outline" onClick={handleCopy}>
                    Copy
                  </button>
                </div>
              </>
            ) : (
              <div className="empty">Fill in the form to generate a {format} QR code.</div>
            )}
          </div>
        </div>
      </div>

      {copied && <div className="toast" role="status">Copied!</div>}
    </section>
  );
}
