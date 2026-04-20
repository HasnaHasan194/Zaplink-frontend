import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatApiMessage, ApiError } from '../api/client';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(formatApiMessage(err));
      if (err instanceof ApiError && err.status === 401) {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card-shell">
      <div className="card">
        <h1>Sign in</h1>
        <form onSubmit={onSubmit} className="form">
          <label>
            Email
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={1}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="muted">
          No account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
