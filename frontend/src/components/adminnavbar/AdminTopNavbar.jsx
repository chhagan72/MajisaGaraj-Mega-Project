import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AdminTopNavbar = ({ sidebarOpen, setSidebarOpen, user, handleLogout, setActiveTab }) => {
    const [radarAlerts, setRadarAlerts] = useState([]);
    const unreadRadar = Array.isArray(radarAlerts) ? radarAlerts.filter(r => !r.isRead) : [];

    const fetchRadarNotifications = useCallback(async () => {
        try {
            // const res = await axios.get('/api/services/notifications/admin');
            const res = await axios.get(`http://localhost:5000/api/services/notifications/admin`);
            setRadarAlerts(res.data);
        } catch (err) {
            console.error("Failed to read admin radar array nodes.", err);
        }
    }, []);

    useEffect(() => {
        fetchRadarNotifications();
        const loopInterval = setInterval(fetchRadarNotifications, 5000);
        return () => clearInterval(loopInterval);
    }, [fetchRadarNotifications]);

    // Handles changing tabs safely and closes any lingering open dropdown lists if clicked on inner items
    const handleTabNavigation = (tabName, closeDropdown = false) => {
        setActiveTab(tabName);
        
        if (closeDropdown) {
            const openDropdowns = document.querySelectorAll('.dropdown-toggle.show');
            openDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
                const menu = dropdown.nextElementSibling;
                if (menu) menu.classList.remove('show');
            });
        }
    };

    return (
        <header className="top-system-bar px-4 py-2 d-flex align-items-center justify-content-between sticky-top">
            <div className="d-flex align-items-center gap-3">
                <button className="btn toggle-sidebar-btn m-0 p-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    <span className="burger-bar"></span>
                    <span className="burger-bar"></span>
                    <span className="burger-bar"></span>
                </button>
                <div className="navbar-heading font-monospace text-uppercase tracking-wider d-none d-md-block">
                    HQ Gateway Root Protocol
                </div>
            </div>

            <div className="system-utilities d-flex align-items-center gap-3">
                {/* Radar Dropdown Notifications Array Display */}
                <div className="dropdown">
                    {/* FIXED: Added explicit handleTabNavigation handler to the radar trigger button */}
                    <button 
                        className="utility-badge-btn font-monospace dropdown-toggle position-relative" 
                        type="button" 
                        id="radarMenu" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        onClick={() => handleTabNavigation('Notifications', false)}
                    >
                        🛰️ RADAR
                        {unreadRadar.length > 0 && (
                            <span className="matrix-counter-dot pulse-danger position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                                {unreadRadar.length}
                            </span>
                        )}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end profile-custom-dropdown p-2" aria-labelledby="radarMenu" style={{ width: '340px', maxHeight: '400px', overflowY: 'auto', zIndex: 1050 }}>
                        <li className="dropdown-header font-monospace small text-danger fw-bold d-flex justify-content-between align-items-center py-2">
                            <span>PENDING DISPATCHES</span>
                            <button className="btn btn-link p-0 small font-monospace text-danger text-decoration-none fw-bold" onClick={() => handleTabNavigation('Notifications', true)}>
                                Open Logs
                            </button>
                        </li>
                        <li><hr className="dropdown-divider m-1"/></li>
                        {unreadRadar.length === 0 ? (
                            <li className="p-2 text-center text-muted small">No pending entries caught on radar loops.</li>
                        ) : (
                            unreadRadar.slice(0, 5).map((item) => (
                                <li key={item._id || Math.random().toString()} className="p-2 border-bottom border-light text-start" onClick={() => handleTabNavigation('Notifications', true)} style={{ cursor: 'pointer' }}>
                                    <div className="small text-dark fw-bold mb-0">{item.title || 'New Bike Request'}</div>
                                    <p className="small text-secondary mb-1" style={{ fontSize: '0.8rem', lineHeight: '1.3' }}>{item.message}</p>
                                    <small className="text-muted font-monospace tiny" style={{ fontSize: '0.65rem', display: 'block' }}>
                                        Logged: {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Just Now'}
                                    </small>
                                </li>
                            ))
                        )}
                    </ul>
                </div>

                <div className="dropdown">
                    <button className="btn profile-badge-dropdown dropdown-toggle d-flex align-items-center gap-2" type="button" id="adminMenu" data-bs-toggle="dropdown" aria-expanded="false">
                        <div className="avatar-placeholder admin-avatar">A</div>
                        <span className="user-name-text small font-monospace">{user.name}</span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end profile-custom-dropdown" aria-labelledby="adminMenu">
                        <li className="dropdown-header font-monospace small text-muted">ACCESS: ROOT_ADMIN</li>
                        <li><hr className="dropdown-divider m-1"/></li>
                        <li><a className="dropdown-item" href="#logs">System Log Metrics</a></li>
                        <li><a className="dropdown-item text-danger" onClick={handleLogout} href="#logout">Shutdown Session</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
};

export default AdminTopNavbar;