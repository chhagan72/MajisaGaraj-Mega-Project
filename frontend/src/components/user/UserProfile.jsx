import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = ({ user, onUserUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    
    // Independent visibility states for password fields
    const [showOldPwd, setShowOldPwd] = useState(false);
    const [showNewPwd, setShowNewPwd] = useState(false);
    const [showConfirmPwd, setShowConfirmPwd] = useState(false);
    
    // Core Profile States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        bikeModel: '',
        vehicleNumber: '', 
        fuelType: 'Petrol', 
        address: '',
        profileImage: ''
    });

    // Password Update States
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                bikeModel: user.bikeModel || '',
                vehicleNumber: user.vehicleNumber || '',
                fuelType: user.fuelType || 'Petrol',
                address: user.address || '',
                profileImage: user.profileImage || ''
            });
        }
    }, [user]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'danger', text: 'Payload file size limits exceed allowed 2MB bounds.' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData(prev => ({ ...prev, profileImage: reader.result }));
        };
        reader.readAsDataURL(file);
    };

    // Update Profile Information
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const targetId = user?._id || user?.id;

        try {
            const token = localStorage.getItem('user_token');
            const res = await axios.put(
                `http://localhost:5000/api/auth/profile/${targetId}`, 
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setMessage({ type: 'success', text: 'Operational registry attributes re-calibrated successfully!' });
            if (onUserUpdate) onUserUpdate(res.data.user);
            setIsEditing(false);
        } catch (err) {
            setMessage({ 
                type: 'danger', 
                text: err.response?.data?.message || 'Error processing profile update mutation.' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Update Security Password Node
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPwdMessage({ type: 'danger', text: 'New password signatures do not match validation inputs.' });
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post('http://localhost:5000/api/auth/change-password', {
                email: formData.email,
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            setPwdMessage({ type: 'success', text: res.data.message || 'Credentials reset successfully!' });
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowPasswordSection(false);
        } catch (err) {
            setPwdMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Failed validating existing credential keys.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container p-0" style={{ maxWidth: '850px' }}>
            {/* MINI HEADER STATS DASHBOARD ROW */}
            <div className="row g-3 mb-4">
                <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded text-center border">
                        <small className="text-muted font-monospace d-block">SYS_ROLE</small>
                        <span className="fw-bold text-primary small font-monospace">SUBSCRIBER</span>
                    </div>
                </div>
                <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded text-center border">
                        <small className="text-muted font-monospace d-block">CORE_STATUS</small>
                        <span className="fw-bold text-success small font-monospace">VERIFIED_NODE</span>
                    </div>
                </div>
                <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded text-center border">
                        <small className="text-muted font-monospace d-block">PRIMARY_UNIT</small>
                        <span className="fw-bold text-dark small font-monospace text-truncate d-block">
                            {formData.bikeModel || "NOT_ASSIGNED"}
                        </span>
                    </div>
                </div>
                <div className="col-6 col-sm-3">
                    <div className="p-3 bg-light rounded text-center border">
                        <small className="text-muted font-monospace d-block">REG_PLATE</small>
                        <span className="fw-bold text-dark small font-monospace d-block">
                            {formData.vehicleNumber || "NONE"}
                        </span>
                    </div>
                </div>
            </div>

            {/* MAIN PROFILE REGISTRY PANEL */}
            <div className="metric-panel-card p-4 bg-white border rounded shadow-sm mb-4">
                <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                    <h4 className="font-monospace text-dark m-0">⚙️ CORE IDENTITY REGISTRY</h4>
                    {!isEditing && (
                        <button type="button" className="btn btn-outline-primary btn-sm font-monospace" onClick={() => setIsEditing(true)}>
                            ✏️ Edit Profile Nodes
                        </button>
                    )}
                </div>
                
                {message.text && <div className={`alert alert-${message.type} font-monospace small`}>{message.text}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="row align-items-center mb-4">
                        <div className="col-md-3 text-center mb-3 mb-md-0">
                            <div className="position-relative d-inline-block">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Preview" className="rounded-circle border border-primary p-1" style={{ width: '110px', height: '110px', objectFit: 'cover' }} />
                                ) : (
                                    <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center mx-auto font-monospace fw-bold" style={{ width: '110px', height: '110px', fontSize: '2.5rem' }}>
                                        {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                )}
                                {isEditing && (
                                    <>
                                        <label htmlFor="avatar-file-upload" className="btn btn-sm btn-dark position-absolute bottom-0 end-0 rounded-circle">📷</label>
                                        <input type="file" id="avatar-file-upload" accept="image/*" className="d-none" onChange={handleImageChange} />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="col-md-9">
                            <div className="row g-3">
                                <div className="col-sm-6">
                                    <label className="form-label font-monospace small text-muted fw-bold">OPERATOR PROFILE NAME</label>
                                    <input type="text" className={`form-control font-monospace ${!isEditing ? 'bg-light border-0' : ''}`} name="name" value={formData.name} onChange={handleInputChange} disabled={!isEditing} required />
                                </div>
                                <div className="col-sm-6">
                                    <label className="form-label font-monospace small text-muted fw-bold">ROUTING EMAIL (LOCKED)</label>
                                    <input type="email" className="form-control font-monospace bg-light border-0" value={formData.email} disabled />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                            <label className="form-label font-monospace small text-muted fw-bold">CONTACT PHONE NUMBER</label>
                            <input type="text" className={`form-control font-monospace ${!isEditing ? 'bg-light border-0' : ''}`} name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} placeholder="No phone registered" />
                        </div>
                        <div className="col-sm-6">
                            <label className="form-label font-monospace small text-muted fw-bold">VEHICLE MAKE / MODEL</label>
                            <input type="text" className={`form-control font-monospace ${!isEditing ? 'bg-light border-0' : ''}`} name="bikeModel" value={formData.bikeModel} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. Royal Enfield / Swift Dzire" />
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                            <label className="form-label font-monospace small text-muted fw-bold">VEHICLE NUMBER PLATE</label>
                            <input type="text" className={`form-control font-monospace ${!isEditing ? 'bg-light border-0' : ''}`} name="vehicleNumber" value={formData.vehicleNumber} onChange={handleInputChange} disabled={!isEditing} placeholder="e.g. MH-12-AB-1234" />
                        </div>
                        <div className="col-sm-6">
                            <label className="form-label font-monospace small text-muted fw-bold">FUEL VARIANT TYPE</label>
                            {isEditing ? (
                                <select className="form-select font-monospace" name="fuelType" value={formData.fuelType} onChange={handleInputChange}>
                                    <option value="Petrol">Petrol</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="EV">Electric (EV)</option>
                                    <option value="CNG">CNG</option>
                                </select>
                            ) : (
                                <input type="text" className="form-control font-monospace bg-light border-0" value={formData.fuelType} disabled />
                            )}
                        </div>
                    </div>

                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label font-monospace small text-muted fw-bold">GEOGRAPHIC RESIDENCE ADDRESS</label>
                            <textarea className={`form-control font-monospace ${!isEditing ? 'bg-light border-0' : ''}`} name="address" rows="2" value={formData.address} onChange={handleInputChange} disabled={!isEditing} placeholder="No tracking address setup present" />
                        </div>
                    </div>

                    {isEditing && (
                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <button type="button" className="btn btn-sm btn-outline-secondary font-monospace" onClick={() => setIsEditing(false)}>✕ Cancel</button>
                            <button type="submit" className="btn btn-sm btn-primary font-monospace" disabled={loading}>💾 Sync Changes</button>
                        </div>
                    )}
                </form>
            </div>

            {/* SECURE PASSWORD ACCESS TERMINAL PANEL */}
            <div className="metric-panel-card p-4 bg-white border rounded shadow-sm">
                <div className="d-flex align-items-center justify-content-between">
                    <h5 className="font-monospace text-dark m-0">🔐 SECURITY ACCREDITATION OVERRIDE</h5>
                    <button type="button" className="btn btn-sm btn-dark font-monospace" onClick={() => setShowPasswordSection(!showPasswordSection)}>
                        {showPasswordSection ? 'Collapse Node' : 'Expand Security Node'}
                    </button>
                </div>

                {showPasswordSection && (
                    <form onSubmit={handlePasswordSubmit} className="mt-4 pt-3 border-top">
                        {pwdMessage.text && <div className={`alert alert-${pwdMessage.type} font-monospace small`}>{pwdMessage.text}</div>}
                        <div className="row g-3 mb-3">
                            
                            {/* CURRENT PASSWORD INPUT WITH TOGGLE */}
                            <div className="col-md-4">
                                <label className="form-label font-monospace small text-muted">CURRENT PASSWORD</label>
                                <div className="input-group">
                                    <input 
                                        type={showOldPwd ? "text" : "password"} 
                                        name="oldPassword" 
                                        className="form-control font-monospace" 
                                        value={passwordData.oldPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                    />
                                    <button 
                                        className="btn btn-outline-secondary font-monospace" 
                                        type="button"
                                        onClick={() => setShowOldPwd(!showOldPwd)}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        {showOldPwd ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>
                            
                            {/* NEW PASSWORD INPUT WITH TOGGLE */}
                            <div className="col-md-4">
                                <label className="form-label font-monospace small text-muted">NEW PASSWORD</label>
                                <div className="input-group">
                                    <input 
                                        type={showNewPwd ? "text" : "password"} 
                                        name="newPassword" 
                                        className="form-control font-monospace" 
                                        value={passwordData.newPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                    />
                                    <button 
                                        className="btn btn-outline-secondary font-monospace" 
                                        type="button"
                                        onClick={() => setShowNewPwd(!showNewPwd)}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        {showNewPwd ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>
                            
                            {/* CONFIRM NEW PASSWORD INPUT WITH TOGGLE */}
                            <div className="col-md-4">
                                <label className="form-label font-monospace small text-muted">RE-VERIFY NEW PASSWORD</label>
                                <div className="input-group">
                                    <input 
                                        type={showConfirmPwd ? "text" : "password"} 
                                        name="confirmPassword" 
                                        className="form-control font-monospace" 
                                        value={passwordData.confirmPassword} 
                                        onChange={handlePasswordChange} 
                                        required 
                                    />
                                    <button 
                                        className="btn btn-outline-secondary font-monospace" 
                                        type="button"
                                        onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                                        style={{ fontSize: '0.85rem' }}
                                    >
                                        {showConfirmPwd ? "HIDE" : "SHOW"}
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div className="text-end">
                            <button type="submit" className="btn btn-danger font-monospace btn-sm" disabled={loading}>
                                Re-calibrate Access Passwords
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default UserProfile;