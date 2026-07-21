import React from 'react';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, handleLogout }) => {
    return (
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-visible' : 'sidebar-hidden'}`}>
            <div className="sidebar-brand p-4 d-flex align-items-center justify-content-between">
                <div className="brand-wrapper d-flex align-items-center gap-2">
                    <div className="brand-logo-icon">👑</div>
                    <span className="brand-text">MAJISA <span className="brand-sub">ADMIN</span></span>
                </div>
                <button className="btn-close-sidebar d-md-none" onClick={() => setSidebarOpen(false)}>✕</button>
            </div>
            
            <nav className="sidebar-menu px-3 flex-grow-1">
                <div className="menu-category">Operations Core</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'Overview' ? 'active' : ''}`} onClick={() => setActiveTab('Overview')}>
                            <span className="icon-slot">📊</span> Control Overview
                        </button>
                    </li>
                </ul>

                <div className="menu-category mt-3">Inventory Engine</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'AddProduct' ? 'active' : ''}`} onClick={() => setActiveTab('AddProduct')}>
                            <span className="icon-slot">➕</span> Add New Product
                        </button>
                    </li>
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'ManageProducts' ? 'active' : ''}`} onClick={() => setActiveTab('ManageProducts')}>
                            <span className="icon-slot">⚙️</span> Edit / Delete Stock
                        </button>
                    </li>
                </ul>

                <div className="menu-category mt-3">Service Desks</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'BikeService' ? 'active' : ''}`} onClick={() => setActiveTab('BikeService')}>
                            <span className="icon-slot">🏍️</span> Bike Maintenance
                        </button>
                    </li>
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'CarService' ? 'active' : ''}`} onClick={() => setActiveTab('CarService')}>
                            <span className="icon-slot">🚗</span> Car Maintenance
                        </button>
                    </li>
                </ul>

                {/* ADDED: NOTIFICATION ARCHIVE LINK ENABLES ACTIVE WORKSPACE RE-RENDERING */}
                <div className="menu-category mt-3">System Logs</div>
                <ul className="list-unstyled d-flex flex-column gap-1 m-0 p-0">
                    <li>
                        <button className={`nav-panel-btn ${activeTab === 'Notifications' ? 'active' : ''}`} onClick={() => setActiveTab('Notifications')}>
                            <span className="icon-slot">🔔</span> Notification Logs
                        </button>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer p-3">
                <button onClick={handleLogout} className="btn btn-pro-danger w-100 py-2.5 fw-bold">
                    Close Admin Terminal
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;