import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './css/AuthStyles.css';

const ChangePassword = () => {
    const [form, setForm] = useState({ email: '', oldPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Client-side validations
        if (!form.email.includes('@')) {
            setError('Please enter a structured email format.');
            return;
        }

        if (!passwordRegex.test(form.newPassword)) {
            setError('New password requirements: 8+ characters, 1 uppercase letter, 1 number, and 1 special character.');
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            setError('Mismatch detected. Confirm key must match your new password input.');
            return;
        }

        if (form.oldPassword === form.newPassword) {
            setError('New password cannot match your current old password configuration.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/auth/change-password', {
                email: form.email,
                oldPassword: form.oldPassword,
                newPassword: form.newPassword
            });

            setSuccess(res.data.message || 'Passcode updated! Cleaning storage vectors...');
            
            // Wipe standard and admin tokens to force a fresh login
            setTimeout(() => {
                localStorage.clear();
                navigate('/login');
            }, 2500);
        } catch (err) {
            // FIX: Print the exact message returned from backend, or a precise network error
            setError(err.response?.data?.message || 'Network connection error. Server unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-theme-light min-vh-100">
            {/* Background image canvas mapping layer */}
            <div className="auth-garage-bg"></div>

            {/* Top Shared Navbar Layout */}
            <nav className="navbar navbar-expand navbar-light auth-top-nav px-4">
                <div className="container-fluid">
                    <span className="navbar-brand fw-bold text-primary font-monospace">🔧 MAJISA GARAGE</span>
                    <div className="d-flex gap-4 font-monospace small fw-bold">
                        <Link to="/login" className="nav-link text-uppercase p-0">Back To Sign In</Link>
                    </div>
                </div>
            </nav>

            {/* Frost Glass Morphism Layout Box */}
            <div className="auth-center-viewport px-3">
                <div className="card auth-premium-card p-4 p-sm-5 w-100 animate-fade-up" style={{ maxWidth: '450px' }}>
                    <div className="text-center mb-4">
                        <h2 className="fw-bold tracking-tight text-dark mb-1">Update Password</h2>
                        <p className="text-muted small m-0">Re-calibrate your profile access authentication keys</p>
                        <div className="premium-accent-line mx-auto"></div>
                    </div>

                    {error && <div className="alert alert-custom-danger small mb-3">{error}</div>}
                    {success && <div className="alert alert-custom-success small mb-3">{success}</div>}

                    <form onSubmit={handleChangePassword}>
                        <div className="mb-3">
                            <label className="form-label font-monospace small fw-bold text-dark">Account Email</label>
                            <input type="email" className="form-control premium-form-input" placeholder="chhagan12@gmail.com" required 
                                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label font-monospace small fw-bold text-dark">Old Password</label>
                            <input type="password" className="form-control premium-form-input" placeholder="••••••••" required 
                                value={form.oldPassword} onChange={(e) => setForm({ ...form, oldPassword: e.target.value })} />
                        </div>

                        <div className="mb-3">
                            <label className="form-label font-monospace small fw-bold text-dark">Create New Password</label>
                            <input type="password" className="form-control premium-form-input" placeholder="e.g. Chhagan@72" required 
                                value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
                        </div>

                        <div className="mb-4">
                            <label className="form-label font-monospace small fw-bold text-dark">Confirm New Password</label>
                            <input type="password" className="form-control premium-form-input" placeholder="Repeat New Password" required 
                                value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
                        </div>

                        <button type="submit" className="btn btn-premium-action w-100 py-2.5 fw-bold font-monospace" disabled={loading}>
                            {loading ? <span className="spinner-border spinner-border-sm text-white"></span> : 'COMMIT CREDENTIAL CHANGES'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;