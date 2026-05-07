import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';
import { apiJson, formatApiMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';

type UrlRow = {
  id: string;
  shortCode: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
};

export function DashboardPage() {
  const { token, user } = useAuth();
  const [originalUrl, setOriginalUrl] = useState('https://');
  const [items, setItems] = useState<UrlRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);

  const loadUrls = useCallback(async () => {
    if (!token) return;
    setListLoading(true);
    setError(null);
    try {
      const data = await apiJson<UrlRow[]>('/urls');
      setItems(data);
    } catch (err) {
      setError(formatApiMessage(err));
    } finally {
      setListLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadUrls();
  }, [loadUrls]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiJson('/urls', {
        method: 'POST',
        body: JSON.stringify({ originalUrl }),
      });
      toast.success('URL shortened successfully');
      setOriginalUrl('https://');
      await loadUrls();
    } catch (err) {
      setError(formatApiMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="layout dashboard-layout">
      <section className="dashboard-hero" aria-label="Welcome">
        <p className="dashboard-hero-eyebrow">Zaplink</p>
        <h2 className="dashboard-hero-title">Short links, clear focus</h2>
        <p className="dashboard-hero-sub">
          Paste a URL below — your Zaplink list updates instantly.
        </p>
        {user && (
          <p className="dashboard-hero-welcome">Signed in as {user.email}</p>
        )}
      </section>

      <div className="card">
        <h1>Shorten a link</h1>
        <form onSubmit={onSubmit} className="form row">
          <label className="grow">
            Original URL
            <input
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Shorten'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="card">
        <h2>Your links</h2>
        {listLoading ? (
          <p className="muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted">No shortened URLs yet.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Short</th>
                  <th>Original</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <a href={row.shortUrl} target="_blank" rel="noreferrer">
                        {row.shortUrl}
                      </a>
                    </td>
                    <td className="ellipsis" title={row.originalUrl}>
                      {row.originalUrl}
                    </td>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
