import React from 'react';

const Sidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, handleLogout }) => {
    return (
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
            <div className="sidebar-brand p-4 d-flex align-items-center justify-content-between">
                <div className="brand-wrapper d-flex align-items-center gap-2">
                    <div className="brand-logo-icon">🔧</div>
                    <span className="brand-text">MAJISA <span className="brand-sub">GARAGE</span></span>
                </div>
                <button className="btn-close-sidebar d-md-none" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            
            <nav className="sidebar-menu px-3 flex-grow-1">
                <div className="menu-category">Main Console</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
                            <span className="icon-slot">📦</span> Parts Inventory
                        </button>
                    </li>
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'BikeService' ? 'active' : ''}`} onClick={() => setActiveTab('BikeService')}>
                            <span className="icon-slot">🏍️</span> Two-Wheeler Care
                        </button>
                    </li>
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'CarService' ? 'active' : ''}`} onClick={() => setActiveTab('CarService')}>
                            <span className="icon-slot">🚗</span> Four-Wheeler Care
                        </button>
                    </li>
                </ul>

                <div className="menu-category mt-4">Support & Info</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'About' ? 'active' : ''}`} onClick={() => setActiveTab('About')}>
                            <span className="icon-slot">🏢</span> Corporate Profile
                        </button>
                    </li>
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'Contact' ? 'active' : ''}`} onClick={() => setActiveTab('Contact')}>
                            <span className="icon-slot">✉️</span> Get In Touch
                        </button>
                    </li>
                </ul>
                <div className="menu-category mt-4">System Logs</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    {/* NEW NOTIFICATION LOGS NODE INTERFACES */}
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>
                            <span className="icon-slot">🔔</span> Notification Logs
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer p-3">
                <button onClick={handleLogout} className="btn btnprodanger w-100 py-2.5 fw-bold">
                    Disconnect Session
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;