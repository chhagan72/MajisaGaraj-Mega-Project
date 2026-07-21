import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../usernavbar/Sidebar';
import TopNavbar from '../usernavbar/TopNavbar';
import TwoWheelerCare from './TwoWheelerCare';
import NotificationCenter from './NotificationCenter'; 
import UserProfile from './UserProfile'; 
import AboutCorporate from './AboutCorporate';
import GetInTouch from './GetInTouch';
import PartsInventory from './PartsInventory';
import '../css/UserHome.css';

const UserHome = () => {
    const navigate = useNavigate();
    
    const [user, setUser] = useState(() => {
        const cachedUser = localStorage.getItem('user_data');
        return cachedUser ? JSON.parse(cachedUser) : { name: 'Operator', _id: '', id: '' };
    });
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user_data'));
        const token = localStorage.getItem('user_token');

        if (!token || !storedUser || storedUser.role !== 'user') {
            localStorage.removeItem('user_token');
            localStorage.removeItem('user_data');
            navigate('/login');
        } else {
            setUser(storedUser);
        }
    }, [navigate]);

    const handleProfileSync = (updatedUserFields) => {
        const structuralUserData = { ...user, ...updatedUserFields };
        setUser(structuralUserData);
        localStorage.setItem('user_data', JSON.stringify(structuralUserData));
    };

    const handleLogout = () => {
        localStorage.removeItem('user_token');
        localStorage.removeItem('user_data');
        navigate('/login');
    };

    const targetUserId = user._id || user.id;

    return (
        <div className="dashboard-root d-flex">
            
            <Sidebar 
                sidebarOpen={sidebarOpen} 
                setSidebarOpen={setSidebarOpen} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                handleLogout={handleLogout} 
            />

            <div className="main-content-wrapper flex-grow-1 min-vh-100 d-flex flex-column">
                
                <TopNavbar 
                    sidebarOpen={sidebarOpen} 
                    setSidebarOpen={setSidebarOpen} 
                    user={user} 
                    handleLogout={handleLogout} 
                    setActiveTab={setActiveTab}
                />

                <main className="dashboard-body-content p-4 flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between mb-4 header-container">
                        {/* <h2 className="section-title m-0 font-monospace text-uppercase text-dark">
                            {activeTab === 'Notifications' ? 'Notification Logs' : activeTab === 'Profile' ? 'User Profile' : `${activeTab} Workstation`}
                        </h2> */}
                        {/* <span className="system-status-badge font-monospace small">SYS_STATUS: OPERATIONAL</span> */}
                    </div>

                    {/* Rendering Mappings */}
                    {activeTab === 'Overview' && (
                        <div className="d-flex flex-column gap-4 animate-fade-in-view">
                            {/* TOP COMPACT METRIC STATUS PANEL CARD ROWS */}
                            {/* <div className="row g-4">
                                <div className="col-12 col-md-6 col-xl-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">01 TRACKING SLOT</span>
                                            <span className="card-icon-badge text-cyan-icon">🚗</span>
                                        </div>
                                        <h2 className="fw-bold value-display m-0">1 Active Servicing</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Car Periodic Servicing Routine</p>
                                    </div>
                                </div>
                                
                                <div className="col-12 col-md-6 col-xl-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">02 CREDIT TRANSACTIONS</span>
                                            <span className="card-icon-badge text-emerald-icon">💳</span>
                                        </div>
                                        <h2 className="fw-bold value-display m-0">$240.00 Paid</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Invoice closed on May 2026</p>
                                    </div>
                                </div>

                                <div className="col-12 col-xl-4">
                                    <div className="metric-panel-card p-4">
                                        <div className="card-top-info d-flex justify-content-between align-items-center mb-3">
                                            <span className="text-muted small font-monospace">03 LIVE TIMELINE</span>
                                            <span className="card-icon-badge text-amber-icon">⌛</span>
                                        </div>
                                        <h2 className="fw-bold value-display text-glow-amber m-0">In Progress</h2>
                                        <p className="card-mini-footer mt-2 text-grey m-0">Estimated Completion: 5:00 PM Today</p>
                                    </div>
                                </div>
                            </div> */}

                            {/* INTEGRATED LIVE ACTIVE HARDWARE PARTS & ACCESORIES INVENTORY CATALOG HIERARCHY */}
                            <div className="border-top pt-4">
                                <h4 className="font-monospace fw-bold text-dark mb-3">🛒 Active Parts & Accessories Hub</h4>
                                <PartsInventory currentUser={user} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'BikeService' && (
                        <TwoWheelerCare />
                    )}

                    {activeTab === 'Notifications' && targetUserId && (
                        <NotificationCenter roleContext="user" userIdContext={targetUserId} />
                    )}

                    {/* TARGET PROFILE COMPONENT INTERFACE DISPLAY SWITCH */}
                    {activeTab === 'Profile' && (
                        <UserProfile user={user} onUserUpdate={handleProfileSync} />
                    )}

                    {activeTab === 'About' && (
                        <AboutCorporate />
                    )}

                    {activeTab === 'Contact' && (
                        <GetInTouch />
                    )}

                    {/* FIXED: Excluded 'Profile' layout explicitly from standard fallback conditions */}
                    {activeTab !== 'Overview' && activeTab !== 'BikeService' && activeTab !== 'Notifications' && activeTab !== 'Profile' &&  activeTab !== 'About' && activeTab !== 'Contact' &&(
                        <div className="metric-panel-card p-5 text-center">
                            <h4 className="font-monospace text-muted mb-2">[ LAYER SECURED ]</h4>
                            <p className="m-0 text-muted-gray small">The component window for "{activeTab}" is configured and awaiting remote data payload deployment loops.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserHome;