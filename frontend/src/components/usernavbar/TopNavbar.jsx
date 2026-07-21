import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const TopNavbar = ({ sidebarOpen, setSidebarOpen, user, handleLogout, setActiveTab }) => {
    const [alerts, setAlerts] = useState([]);
    const unreadAlerts = alerts.filter(a => !a.isRead);

    const fetchUserAlerts = useCallback(async () => {
        if (!user) return;
        const targetId = user._id || user.id;
        if (!targetId) return;

        try {
            const res = await axios.get(`/api/services/notifications/${targetId}`);
            setAlerts(res.data);
        } catch (err) {
            console.error("Failed to read user notifications.", err);
        }
    }, [user]);

    useEffect(() => {
        fetchUserAlerts();
        const loopInterval = setInterval(fetchUserAlerts, 10000); 
        return () => clearInterval(loopInterval);
    }, [fetchUserAlerts]);

    return (
        <header className="top-system-bar px-4 py-2 d-flex align-items-center justify-content-between sticky-top">
            <div className="d-flex align-items-center gap-3">
                <button className="btn toggle-sidebar-btn m-0 p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span className="burger-bar"></span>
                    <span className="burger-bar"></span>
                    <span className="burger-bar"></span>
                </button>
                <div className="navbar-heading font-monospace text-uppercase tracking-wider d-none d-md-block">
                    Secure Network Base
                </div>
            </div>

            <div className="system-utilities d-flex align-items-center gap-3">
                <div className="position-relative">
                    <button className="utility-badge-btn font-monospace">🛒 CART</button>
                    <span className="matrix-counter-dot alert-pulse">2</span>
                </div>

                {/* Alerts Section */}
                <div className="dropdown">
                    <button 
                        className="utility-badge-btn font-monospace position-relative" 
                        type="button" 
                        id="alertsMenu" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        onClick={() => setActiveTab('Notifications')}
                    >
                        🔔 ALERTS
                        {unreadAlerts.length > 0 && <span className="matrix-counter-dot alert-pulse">{unreadAlerts.length}</span>}
                    </button>
                </div>

                {/* Profile Section */}
                <div className="dropdown">
                    <button className="btn profile-badge-dropdown d-flex align-items-center gap-2" type="button" id="profileMenu" data-bs-toggle="dropdown" aria-expanded="false" onClick={() => setActiveTab('Profile')}>
                        {user.profileImage ? (
                            <img 
                                src={user.profileImage} 
                                alt="Profile Avatar" 
                                className="rounded-circle" 
                                style={{ width: '24px', height: '24px', objectFit: 'cover' }} 
                            />
                        ) : (
                            <div className="avatar-placeholder">{user.name ? user.name.charAt(0).toUpperCase() : 'O'}</div>
                        )}
                        <span className="user-name-text small font-monospace">{user.name}</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;