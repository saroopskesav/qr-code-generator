import { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';
import './App.css';
import SimpleTab from './tabs/SimpleTab';
import FormatsTab from './tabs/FormatsTab';
import ScannerTab from './tabs/ScannerTab';
import HistoryTab from './tabs/HistoryTab';
import AdvancedTab from './tabs/AdvancedTab';

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

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="brand">
            <img src="/logo.svg" alt="QR" className="logo" />
            <div>
              <h1>QR Generator Pro</h1>
              <p className="tagline">Create, scan, and manage QR codes - everything in one place.</p>
            </div>
          </div>
          <button
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <span className="toggle-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
        </header>

        <nav className="tabs">
          {[
            { id: 'simple', label: '✨ Simple', icon: '◆' },
            { id: 'formats', label: '📋 Formats', icon: '◆' },
            { id: 'advanced', label: '⚙️ Advanced', icon: '◆' },
            { id: 'scanner', label: '📱 Scanner', icon: '◆' },
            { id: 'history', label: '⏱️ History', icon: '◆' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              aria-selected={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <main className="tab-content">
          {activeTab === 'simple' && <SimpleTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'formats' && <FormatsTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'advanced' && <AdvancedTab addToHistory={addToHistory} toggleFavorite={toggleFavorite} isFavorited={isFavorited} />}
          {activeTab === 'scanner' && <ScannerTab />}
          {activeTab === 'history' && <HistoryTab history={history} setHistory={setHistory} />}
        </main>
      </div>
    </div>
  );
}

export default App;
