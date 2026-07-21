import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../adminnavbar/AdminSidebar';
import AdminTopNavbar from '../adminnavbar/AdminTopNavbar';
import AdminBikeService from './AdminBikeService'; 
import NotificationCenter from './NotificationCenter'; 
import AddProduct from './AddProduct';
import ManageProducts from './ManageProducts';
import '../css/AdminHome.css';

const AdminHome = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(() => {
        const cachedAdmin = localStorage.getItem('admin_data');
        return cachedAdmin ? JSON.parse(cachedAdmin) : { name: 'Admin Staff' };
    });
    
    // UI Interface Control States
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('admin_data'));
        const token = localStorage.getItem('admin_token');

        if (!token || !storedUser || storedUser.role !== 'admin') {
            localStorage.clear();
            navigate('/login');
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        navigate('/login');
    };

    return (
        <div className="dashboard-root d-flex">
            
            {/* 1. SEPARATED ADMIN SIDEBAR PANEL */}
            <AdminSidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
            />

            {/* MAIN SYSTEM WORKSPACE */}
            <div className="main-content-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
                
                {/* 2. SEPARATED ADMIN MANAGEMENT NAVBAR */}
                <AdminTopNavbar 
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    user={user}
                    handleLogout={handleLogout}
                    setActiveTab={setActiveTab}
                />

                {/* 3. DISPLAY MONITOR WORKSPACE CORE */}
                <main className="dashboard-body-content p-4 flex-grow-1 animate-fade-in-view">
                    <div className="d-flex align-items-center justify-content-between mb-4 header-container">
                        <h2 className="section-title m-0">
                            {activeTab === 'BikeService' ? 'Bike Maintenance' : activeTab === 'Notifications' ? 'Notification Logs' : `${activeTab} Workstation`}
                        </h2>
                        <span className="system-status-badge font-monospace small">SECURITY: LEVEL_MAX</span>
                    </div>

                    {/* OVERVIEW METRIC CONTROL BLOCK */}
                    {activeTab === 'Overview' && (
                        <div className="animate-fade-in-view">
                            <div className="row g-4 mb-4">
                                <div className="col-12 col-md-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">01 REPAIR ACCUMULATION</span>
                                            <span className="card-icon-badge text-cyan-icon">🔧</span>
                                        </div>
                                        <h2 className="fw-bold value-display m-0">42 Operations</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Total lifetime vehicles processed</p>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">02 PENDING QUEUES</span>
                                            <span className="card-icon-badge text-danger-icon">⏳</span>
                                        </div>
                                        <h2 className="fw-bold value-display m-0">8 Slots Open</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Awaiting technician validation</p>
                                    </div>
                                </div>
                                <div className="col-12 col-md-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">03 STAFF ALLOCATION</span>
                                            <span className="card-icon-badge text-emerald-icon">👥</span>
                                        </div>
                                        <h2 className="fw-bold value-display m-0">5 On Floor</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Mechanic stations checked in online</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MOUNT SUB-PAGE COMPONENTS ACCORDING TO STATE TAB NODES */}
                    {activeTab === 'BikeService' && <AdminBikeService />}
                    {activeTab === 'AddProduct' && <AddProduct />}
                    {activeTab === 'ManageProducts' && <ManageProducts />}
                    {/* MOUNT NOTIFICATION CENTER COMPONENT SAFELY */}
                    {activeTab === 'Notifications' && <NotificationCenter roleContext="admin" />}

                    {/* Included activeTab !== 'Notifications' check block condition wrapper */}
                    {activeTab !== 'Overview' && activeTab !== 'BikeService' && activeTab !== 'Notifications' && activeTab !== 'AddProduct' && activeTab !== 'ManageProducts' &&(
                        <div className="metric-panel-card p-5 text-center bg-white border">
                            <h4 className="font-monospace text-muted mb-2">[ SECURE PORT OFFLINE ]</h4>
                            <p className="m-0 text-muted-gray small">
                                The admin module controller layout for "{activeTab}" is generated and awaiting background route assignment loops.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminHome;