import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Login = () => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [username, setUsername] = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMsg('');
        try {
            if (isRegistering) {
                // Register flow
                await api.post('users/register/', { username, email, password });
                setMsg('Account created successfully! Please sign in.');
                setIsRegistering(false);
                setPassword('');
            } else {
                // Login flow
                const res = await api.post('users/login/', { username, password });
                localStorage.setItem('access', res.data.access);
                localStorage.setItem('refresh', res.data.refresh);
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.detail || 'An error occurred. Please try again.');
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
                <h1 className="login-title">{isRegistering ? 'Create an Account' : 'Welcome back'}</h1>
                <p className="login-sub">
                    {isRegistering ? 'Sign up for your Finance Dashboard' : 'Sign in to your Finance Dashboard'}
                </p>

                {error && <div className="alert alert-error">{error}</div>}
                {msg && <div className="alert alert-info">{msg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-14">
                        <label className="login-label">Username</label>
                        <input
                            className="login-input"
                            type="text"
                            placeholder="Choose a username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    {isRegistering && (
                        <div className="mb-14">
                            <label className="login-label">Email Address</label>
                            <input
                                className="login-input"
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    )}
                    <div className="mb-14">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder={isRegistering ? 'Create a secure password' : 'Enter your password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading
                            ? <><span className="spinner-border spinner-border-sm me-2"></span>Please wait…</>
                            : (isRegistering ? 'Register Account →' : 'Sign In →')
                        }
                    </button>
                </form>

                <div 
                    className="login-hint" 
                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError(''); setMsg('');
                    }}
                >
                    {isRegistering 
                        ? <>Already have an account? <strong>Sign in here</strong></> 
                        : <>Need an account? <strong>Register here</strong></>
                    }
                </div>
            </div>
        </div>
    );
};

export default Login;
