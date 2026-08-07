import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form);
      login(data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">S</div>
        <h2>Mr. Solomon's Dashboard</h2>
        <p className="login-sub">Private access only</p>
        {error && <div className="login-error">❌ {error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-field">
            <label>Username</label>
            <input
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="Enter username" required autoFocus
            />
          </div>
          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Enter password" required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <a href="/" className="login-back">← Back to Portfolio</a>
      </div>
    </div>
  );
}
