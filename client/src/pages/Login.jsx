import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed.');
        return;
      }
      login(data);
      navigate('/inventory');
    } catch {
      setError('Could not reach the server. Is it running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-coffee-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-coffee-800 rounded-2xl mb-4">
            <span className="text-white font-bold text-lg">OEC</span>
          </div>
          <h1 className="text-xl font-bold text-coffee-900">One Estate Coffee</h1>
          <p className="text-coffee-400 text-sm mt-1">Ops Platform</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-coffee-100 p-8">
          <h2 className="text-lg font-semibold text-coffee-900 mb-6">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Email</label>
              <input
                type="email" autoComplete="email" required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full border border-coffee-200 rounded-xl px-3 py-2.5 text-coffee-900 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-1.5">Password</label>
              <input
                type="password" autoComplete="current-password" required
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                className="w-full border border-coffee-200 rounded-xl px-3 py-2.5 text-coffee-900 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400 focus:border-transparent"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full bg-coffee-700 text-white py-2.5 rounded-xl hover:bg-coffee-800 disabled:opacity-50 transition-colors font-medium text-sm mt-2"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
