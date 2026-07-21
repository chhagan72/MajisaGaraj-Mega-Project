import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/AuthStyles.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // Step 1: Login Form, Step 2: Input Verification code
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loading) return; // Block double entry handling loops

        setError('');
        setSuccess('');

        if (!formData.email.includes('@')) {
            setError('Access Denied. Structured identity formatting mandatory.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);
            
            if (res.data.otpRequired) {
                setSuccess(res.data.message || 'Security checkpoint active.');
                setStep(2); // Dynamic OTP input loop activated
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication sequence rejected. Re-verify credential nodes.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (loading) return; // Block double entry handling loops

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
                email: formData.email,
                otp: otp
            });

            setSuccess('Security clearance verified! Launching interface portal...');

            // Keep loading active for 2 seconds while message displays, then perform redirect execution
            setTimeout(() => {
                /* CRITICAL KEY DIVISION SEPARATION: Maintains simultaneous User and Admin browser tabs cleanly */
                if (res.data.user.role === 'admin') {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_data');
                    
                    localStorage.setItem('admin_token', res.data.token);
                    localStorage.setItem('admin_data', JSON.stringify(res.data.user));
                    navigate('/admin-dashboard');
                } else {
                    localStorage.removeItem('user_token');
                    localStorage.removeItem('user_data');

                    localStorage.setItem('user_token', res.data.token);
                    localStorage.setItem('user_data', JSON.stringify(res.data.user));
                    navigate('/user-dashboard');
                }
            }, 2000);

        } catch (err) {
            setError(err.response?.data?.message || 'Security validation verification key rejected.');
            setLoading(false); // Only release loading lock if the verification sequence hits a failure node
        }
    };

    return (
        <div className="auth-theme-light min-vh-100">
            <div className="auth-garage-bg"></div>

            <nav className="navbar navbar-expand navbar-light auth-top-nav px-4">
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold text-primary font-monospace">🔧 MAJISA GARAGE</span>
                    <div className="d-flex gap-4 font-monospace small fw-bold">
                        <a href="#about" className="nav-link text-uppercase p-0">About Us</a>
                        <a href="#contact" className="nav-link text-uppercase p-0">Contact Us</a>
                    </div>
                </div>
            </nav>

            <div className="auth-center-viewport px-3">
                <div className="card auth-premium-card p-4 p-sm-5 w-100 animate-fade-up" style={{ maxWidth: '420px' }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-extrabold tracking-tight text-dark mb-1">
                            {step === 1 ? 'Welcome Back' : 'Security Clearance'}
                        </h2>
                        <p className="text-muted small m-0">
                            {step === 1 ? 'Initialize secure workspace interface terminal' : 'Enter transmitted verification dynamic node key'}
                        </p>
                        <div className="premium-accent-line mx-auto"></div>
                    </div>

                    {error && <div className="alert alert-custom-danger small mb-3">{error}</div>}
                    {success && <div className="alert alert-custom-success small mb-3">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleLogin}>
                            <div className="mb-3">
                                <label className="form-label font-monospace small fw-bold text-dark">Identity Node (Email)</label>
                                <input type="email" className="form-control premium-form-input" placeholder="chhagan12@gmail.com" required disabled={loading}
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label font-monospace small fw-bold text-dark m-0">Passcode Access Key</label>
                                    <Link to="/change-password" className="text-primary small text-decoration-none fw-bold tracking-tight" style={{ pointerEvents: loading ? 'none' : 'auto' }}>
                                        Change Password?
                                    </Link>
                                </div>
                                <div className="position-relative">
                                    <input type={showPassword ? "text" : "password"} className="form-control premium-form-input pe-5" placeholder="••••••••" required disabled={loading}
                                        value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                                    <button type="button" className="btn btn-sm position-absolute end-0 top-50 translate-middle-y me-2 fw-bold text-muted small text-decoration-none"
                                        disabled={loading} onClick={() => setShowPassword(!showPassword)} style={{ zIndex: 5 }}>
                                        {showPassword ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" className="btn btn-premium-action w-100 py-2.5 fw-bold font-monospace" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        INITIALIZING SESSION...
                                    </>
                                ) : 'COLD START SESSION'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-4">
                                <label className="form-label font-monospace small fw-bold text-dark text-center d-block">Enter 4-Digit Verification Token</label>
                                <input type="text" className="form-control premium-form-input text-center fw-bold fs-4 tracking-widest font-monospace" 
                                    maxLength="4" placeholder="0000" required disabled={loading} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                            </div>

                            <button type="submit" className="btn btn-premium-action w-100 py-2.5 fw-bold font-monospace mb-2" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        AUTHORIZING ACCOUNT...
                                    </>
                                ) : 'AUTHORIZE SESSION'}
                            </button>
                            
                            <button type="button" className="btn btn-outline-secondary btn-sm w-100 py-2 fw-bold font-monospace" 
                                disabled={loading} onClick={() => { setStep(1); setError(''); setSuccess(''); setOtp(''); }}>
                                CANCEL VERIFICATION
                            </button>
                        </form>
                    )}

                    <p className="text-center mt-4 mb-0 small text-muted">
                        New system node?{' '}
                        <Link to="/register" className="text-primary fw-bold text-decoration-none" style={{ pointerEvents: loading ? 'none' : 'auto' }}>Register Profile</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;