import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/AuthStyles.css';

const Register = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // Step 1: Input Form, Step 2: OTP Entry Deck
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevent double trigger handshakes

        setError('');
        setSuccess('');

        if (!emailRegex.test(formData.email)) {
            setError('Please enter a valid email structure (e.g. chhagan12@gmail.com)');
            return;
        }

        if (!passwordRegex.test(formData.password)) {
            setError('Password must be > 8 characters, contain 1 uppercase letter, 1 number, and 1 special symbol (e.g. Chhagan@72)');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('/api/auth/register', formData);
            setSuccess(res.data.message || 'Verification OTP sent code channel routing active.');
            setStep(2); // Jump to OTP Code Input view state
        } catch (err) {
            setError(err.response?.data?.message || 'Registration initialization failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (loading) return; // Prevent double trigger handshakes

        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await axios.post('/api/auth/verify-otp', {
                email: formData.email,
                otp: otp
            });
            
            setSuccess('Account deployment successful! Directing to access portal...');
            
            // Wait 2 seconds for user to read success message before pushing to login route
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid or expired OTP token.');
            setLoading(false); // Only set loading to false on error so spinner remains during redirect success
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
                <div className="card auth-premium-card p-4 p-sm-5 w-100 animate-fade-up" style={{ maxWidth: '400px' }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-extrabold tracking-tight text-dark mb-1">
                            {step === 1 ? 'Create Account' : 'Verify Identity'}
                        </h2>
                        <p className="text-muted small m-0">
                            {step === 1 ? 'Join Majisa Garage Automotive Network' : `Verification secure code sent to ${formData.email}`}
                        </p>
                        <div className="premium-accent-line mx-auto"></div>
                    </div>

                    {error && <div className="alert alert-custom-danger small mb-3">{error}</div>}
                    {success && <div className="alert alert-custom-success small mb-3">{success}</div>}

                    {step === 1 ? (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label font-monospace small fw-bold text-dark">Full Name</label>
                                <input type="text" className="form-control premium-form-input" placeholder="Chhagan" required disabled={loading}
                                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label font-monospace small fw-bold text-dark">Email Address</label>
                                <input type="email" className="form-control premium-form-input" placeholder="chhagan12@gmail.com" required disabled={loading}
                                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="mb-4">
                                <label className="form-label font-monospace small fw-bold text-dark">Password</label>
                                <div className="position-relative">
                                    <input type={showPassword ? "text" : "password"} className="form-control premium-form-input pe-5" placeholder="e.g. Chhagan@72" required disabled={loading}
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
                                        PROCESSING REGISTRATION...
                                    </>
                                ) : 'INITIALIZE REGISTRATION'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp}>
                            <div className="mb-4">
                                <label className="form-label font-monospace small fw-bold text-dark text-center d-block">Enter 4-Digit Security Key Node</label>
                                <input type="text" className="form-control premium-form-input text-center fw-bold fs-4 tracking-widest font-monospace" 
                                    maxLength="4" placeholder="0000" required disabled={loading} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} />
                            </div>

                            <button type="submit" className="btn btn-premium-action w-100 py-2.5 fw-bold font-monospace mb-2" disabled={loading}>
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        VERIFYING CODE...
                                    </>
                                ) : 'VERIFY & DEPLOY'}
                            </button>
                            
                            <button type="button" className="btn btn-outline-secondary btn-sm w-100 py-2 fw-bold font-monospace" 
                                disabled={loading} onClick={() => { setStep(1); setError(''); setSuccess(''); }}>
                                BACK TO REGISTRATION
                            </button>
                        </form>
                    )}

                    <p className="text-center mt-4 mb-0 small text-muted">
                        Existing profile verified?{' '}
                        <Link to="/login" className="text-primary fw-bold text-decoration-none" style={{ pointerEvents: loading ? 'none' : 'auto' }}>Access Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;