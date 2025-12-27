export default function HistoryTab({ history, setHistory }) {
  const clearHistory = () => {
    if (window.confirm('Clear all history?')) {
      setHistory([]);
    }
  };

  const removeItem = (id) => {
    console.log('Deleting item:', id);
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      console.log('New history:', filtered);
      return filtered;
    });
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      console.error('copy failed', e);
    }
  };

  return (
    <section className="tab-panel">
      <div className="history-container">
        <div className="history-header">
          <h3>Generated QR Code History</h3>
          <button className="btn" onClick={clearHistory} disabled={history.length === 0}>
            🗑️ Clear All
          </button>
        </div>

        {history.length === 0 ? (
          <div className="empty-history">
            <p>No QR codes generated yet.</p>
            <p>Go to Simple or Formats tab to create and save history.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="item-content">
                  <p className="item-text">{item.data}</p>
                  <p className="item-time">{item.timestamp}</p>
                </div>
                <div className="item-actions">
                  <button
                    className="history-item-btn"
                    onClick={() => copyToClipboard(item.data)}
                    type="button"
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                  <button
                    className="history-item-btn"
                    onClick={() => {
                      const body = encodeURIComponent(`Check this out: ${item.data}`);
                      window.open(`mailto:?body=${body}`, '_blank');
                    }}
                    type="button"
                    title="Share via email"
                  >
                    📤
                  </button>
                  <button
                    className="history-item-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeItem(item.id);
                    }}
                    type="button"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
