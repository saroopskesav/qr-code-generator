import { useEffect, useState, useCallback } from 'react';
import './App.css';
import SimpleTab from './tabs/SimpleTab';
import FormatsTab from './tabs/FormatsTab';
import ScannerTab from './tabs/ScannerTab';
import HistoryTab from './tabs/HistoryTab';
import AdvancedTab from './tabs/AdvancedTab';

const tabs = [
  { id: 'simple', label: 'Create', icon: '✳', eyebrow: 'THE QR STUDIO', title: 'Make a little magic.', description: 'Turn any link or idea into a QR code worth sharing.' },
  { id: 'formats', label: 'Formats', icon: '▦', eyebrow: 'MADE FOR MORE', title: 'There’s a code for that.', description: 'Share contact details, WiFi, messages, and more in a scan.' },
  { id: 'advanced', label: 'Advanced', icon: '◇', eyebrow: 'CREATIVE CONTROL', title: 'Take it further.', description: 'Explore different sizes, create in batches, or add your own branding.' },
  { id: 'scanner', label: 'Scanner', icon: '◎', eyebrow: 'READY TO DISCOVER', title: 'See where it leads.', description: 'Scan a QR code with your camera and reveal what’s inside.' },
  { id: 'history', label: 'History', icon: '◷', eyebrow: 'YOUR RECENT WORK', title: 'Good to see you again.', description: 'Pick up where you left off with your recently generated codes.' },
];

function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('qr-theme') || 'dark';
    }
    return 'dark';
  });
  const [activeTab, setActiveTab] = useState('simple');
  const [history, setHistory] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('qr-history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('qr-favorites');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Sync theme to DOM and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('qr-theme', theme);
    }
  }, [theme]);

  // Save history to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('qr-history', JSON.stringify(history));
    }
  }, [history]);

  // Save favorites to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('qr-favorites', JSON.stringify(favorites));
    }
  }, [favorites]);

  const addToHistory = useCallback((data) => {
    const item = {
      id: Date.now(),
      data,
      timestamp: new Date().toLocaleString(),
    };
    setHistory((prev) => [item, ...prev.slice(0, 49)]);
  }, []);

  const toggleFavorite = useCallback((data) => {
    setFavorites((prev) => {
      const exists = prev.find((f) => f.data === data);
      if (exists) {
        return prev.filter((f) => f.data !== data);
      }
      return [{ id: Date.now(), data, timestamp: new Date().toLocaleString() }, ...prev];
    });
  }, []);

  const isFavorited = useCallback((data) => favorites.some((f) => f.data === data), [favorites]);
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="brand">
            <img src="/logo.svg" alt="" className="logo" />
            <div>
              <span className="brand-name">QR<span>STUDIO</span></span>
              <span className="brand-caption">MAKE YOUR MARK</span>
            </div>
          </div>
          <div className="header-actions">
            <span className="header-note"><span className="status-dot" /> MADE IN YOUR BROWSER</span>
            <button
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              className="theme-toggle"
              onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
            </button>
          </div>
        </header>

        <div className="intro">
          <div className="intro-copy">
            <p className="eyebrow"><span /> {currentTab.eyebrow}</p>
            <h1>{currentTab.title}</h1>
            <p className="intro-description">{currentTab.description}</p>
          </div>
          <div className="intro-mark" aria-hidden="true">✳</div>
        </div>

        <nav className="tabs" aria-label="QR tools">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-pressed={activeTab === tab.id}
            >
              <span className="tab-icon" aria-hidden="true">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <div className="workspace-heading">
          <span>YOUR WORKSPACE</span>
          <span className="workspace-heading-right"><span className="status-dot" /> READY WHEN YOU ARE</span>
        </div>
        <main className="tab-content">
          {activeTab === 'simple' && <SimpleTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'formats' && <FormatsTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'advanced' && <AdvancedTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'scanner' && <ScannerTab />}
          {activeTab === 'history' && <HistoryTab history={history} setHistory={setHistory} />}
        </main>
        <footer className="footer">
          <span>Designed and developed by Saroop S Kesav</span>
          <span>© 2026 SK Inc. All rights reserved.</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
