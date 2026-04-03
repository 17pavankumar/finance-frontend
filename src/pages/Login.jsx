import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('users/login/', { username, password });
            localStorage.setItem('access', res.data.access);
            localStorage.setItem('refresh', res.data.refresh);
            navigate('/');
        } catch {
            setError('Incorrect username or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-box">
                <div className="login-logo">
                    <i className="bi bi-graph-up-arrow"></i>
                </div>
                <h1 className="login-title">Welcome back</h1>
                <p className="login-sub">Sign in to your Finance Dashboard</p>

                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-14">
                        <label className="login-label">Username</label>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-14">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Signing in…</>
                            : 'Sign In →'
                        }
                    </button>
                </form>

                <div className="login-hint">
                    <i className="bi bi-shield-check me-1"></i>
                    Demo: <strong>admin</strong> / <strong>admin</strong>
                </div>
            </div>
        </div>
    );
};

export default Login;
