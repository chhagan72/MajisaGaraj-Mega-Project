import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GetInTouch = ({ user }) => {
    const [formData, setFormData] = useState({
        subject: 'General Inquiry',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', text: '' });
    
    // Internal state fallback to guarantee active session safety
    const [currentUser, setCurrentUser] = useState(user);

    useEffect(() => {
        if (user && (user._id || user.id)) {
            setCurrentUser(user);
        } else {
            // Fallback recovery pipeline if parent component node misses property mapping
            const cachedUser = localStorage.getItem('user_data');
            if (cachedUser) {
                try {
                    setCurrentUser(JSON.parse(cachedUser));
                } catch (e) {
                    console.error("Failed to parse cached user data context.", e);
                }
            }
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ type: '', text: '' });

        // Resolve identifier tracking fields from current validated user context
        const targetId = currentUser?._id || currentUser?.id;

        if (!targetId) {
            setStatus({ 
                type: 'danger', 
                text: '🛑 Session Identity missing. Please sign out and log back in to initialize your user token.' 
            });
            setLoading(false);
            return;
        }

        try {
            const payload = {
                userId: targetId,
                name: currentUser.name || 'Registered Client',
                email: currentUser.email || 'support@majisagarage.com',
                subject: formData.subject,
                message: formData.message
            };

            const res = await axios.post('http://localhost:5000/api/auth/tickets/create', payload);

            if (res.data.success) {
                setStatus({
                    type: 'success',
                    text: `🔧 Support dispatch saved! Reference ticket verification details dispatched safely to ${currentUser.email || 'your email'}.`
                });
                setFormData({ subject: 'General Inquiry', message: '' });
            }
        } catch (err) {
            console.error("Communication submission failed:", err);
            setStatus({
                type: 'danger',
                text: err.response?.data?.message || '🛑 Communication channel pipeline failed to route payload variables.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Header Block */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)', color: '#ffffff', borderRadius: '12px' }}>
                <div className="d-flex flex-column gap-2">
                    <span className="badge align-self-start font-monospace py-2 px-3" style={{ backgroundColor: '#e2e8f0', color: '#1a202c', fontSize: '0.85rem' }}>
                        📡 SUPPORT TERMINAL LINK
                    </span>
                    <h2 className="fw-bold m-0 mt-2 tracking-wide">GET IN TOUCH</h2>
                    <p className="text-white-50 m-0 max-w-2xl font-sans" style={{ maxWidth: '700px' }}>
                        Active Session: <strong>{currentUser?.email || 'Guest Network Node'}</strong>. Send a direct tracking or custom tuning desk relay directly to our management server dashboards.
                    </p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <div className="card p-4 border-0 shadow-sm h-100" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                        <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 font-monospace">✉️ DESK DISPATCH FORM</h5>
                        
                        {status.text && (
                            <div className={`alert alert-${status.type} font-monospace small mb-3`} role="alert">
                                {status.text}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label font-monospace small fw-bold text-muted uppercase">Inquiry Category Ticket</label>
                                <select 
                                    className="form-select font-monospace shadow-none" 
                                    name="subject" 
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                    style={{ borderRadius: '6px' }}
                                >
                                    <option value="General Inquiry">General Inquiry / Feedback</option>
                                    <option value="Custom Tuning">Custom Upgrades & Fabrications</option>
                                    <option value="Billing / Invoice">Billing / Payment Auditing</option>
                                    <option value="Fleet Assistance">Corporate Fleet Accounts</option>
                                </select>
                            </div>

                            <div>
                                <label className="form-label font-monospace small fw-bold text-muted uppercase">Message Payload</label>
                                <textarea 
                                    className="form-control font-sans shadow-none" 
                                    name="message" 
                                    rows="5"
                                    placeholder="Type details regarding your service requirements here..."
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    required
                                    style={{ borderRadius: '6px', resize: 'none' }}
                                ></textarea>
                            </div>

                            <button 
                                type="submit" 
                                className="btn btn-dark w-100 py-2.5 font-monospace tracking-wide text-uppercase"
                                disabled={loading || !formData.message}
                                style={{ borderRadius: '6px', backgroundColor: '#1a202c' }}
                            >
                                {loading ? 'Transmitting Relay Signal...' : '🚀 Dispatch Ticket Data'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <div className="card p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 font-monospace">📡 DIRECT CHANNELS</h5>
                            <p className="text-muted small font-sans mb-4">
                                Skip the forms completely during critical operational outages. Route communications directly through our digital floor extensions.
                            </p>

                            <div className="d-flex flex-column gap-3">
                                <div className="p-3 bg-light rounded border border-light d-flex align-items-center gap-3">
                                    <span className="fs-3">🏢</span>
                                    <div>
                                        <small className="text-muted font-monospace d-block">Floor Operations Hub</small>
                                        <strong className="text-dark">durgaramkumawat9352@gmail.com</strong>
                                    </div>
                                </div>

                                <div className="p-3 bg-light rounded border border-light d-flex align-items-center gap-3">
                                    <span className="fs-3">💬</span>
                                    <div>
                                        <small className="text-muted font-monospace d-block">WhatsApp Dispatcher</small>
                                        <strong className="text-dark">📞 +91 (935) 222-3702</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-3 bg-dark text-white rounded font-monospace text-center small">
                            🤖 NODE ACCESS STATUS: ACTIVE 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GetInTouch;