import React from 'react';

const AboutCorporate = () => {
    // Hardcoded high-end metadata representing the Garage's corporate summary
    const companyStats = [
        { label: "Years of Excellence", value: "1+" },
        { label: "Certified Mechanics", value: "45+" },
        { label: "Vehicles Serviced", value: "500+" },
        { label: "Customer Satisfaction", value: "99.99%" }
    ];

    const garageCoreValues = [
        { icon: "🛠️", title: "Precision Tuning", desc: "Every mechanical adjustment is executed matching strict OEM calibration parameters." },
        { icon: "🛡️", title: "Genuine Spares Only", desc: "Zero compromise on safety. We deal strictly in authenticated and trackable inventory." },
        { icon: "⚡", title: "Express Turnaround", desc: "Advanced operational diagnostics pipelines ensure minimized workstation idle periods." }
    ];

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: '#f8f9fa' }}>
            {/* Header Section */}
            <div className="card border-0 shadow-sm p-4 mb-4" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', borderRadius: '12px' }}>
                <div className="d-flex flex-column gap-2">
                    <span className="badge align-self-start font-monospace py-2 px-3" style={{ backgroundColor: '#3b82f6', fontSize: '0.85rem' }}>
                        🏭 OFFICIAL ENTERPRISE WORKSPACE
                    </span>
                    <h2 className="fw-bold m-0 mt-2 tracking-wide">MAJISA GARAGE AUTOMOTIVE LTD.</h2>
                    <p className="text-white-50 m-0 custom-sub-text max-w-2xl font-sans" style={{ maxWidth: '700px' }}>
                        Engineered to keep you moving. We run high-precision maintenance diagnostics, vehicle structural overhauls, 
                        and inventory-managed component replacements across two-wheeler and four-wheeler fleets.
                    </p>
                </div>
            </div>

            {/* Micro Stats Grid */}
            <div className="row g-3 mb-4">
                {companyStats.map((stat, idx) => (
                    <div className="col-12 col-sm-6 col-xl-3" key={idx}>
                        <div className="card p-3 border-0 shadow-sm h-100 text-center" style={{ backgroundColor: '#ffffff', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                            <div className="h3 fw-bold text-dark m-0">{stat.value}</div>
                            <div className="text-muted font-monospace small mt-1">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Core Values & Corporate Mission Layout */}
            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <div className="card p-4 border-0 shadow-sm h-100" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                        <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 font-monospace">⚙️ OPERATIONAL CORE VALUES</h5>
                        <div className="d-flex flex-column gap-3">
                            {garageCoreValues.map((item, index) => (
                                <div className="d-flex gap-3 align-items-start" key={index}>
                                    <div className="fs-3 bg-light p-2 rounded-circle border d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h6 className="fw-bold m-0 text-dark mb-1">{item.title}</h6>
                                        <p className="text-muted m-0 small">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Headquarters Location / Work Schedule Block */}
                <div className="col-12 col-lg-5">
                    <div className="card p-4 border-0 shadow-sm h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#ffffff', borderRadius: '8px' }}>
                        <div>
                            <h5 className="fw-bold text-dark mb-3 border-bottom pb-2 font-monospace">📍 BASE HQ LOGISTICS</h5>
                            
                            <div className="mb-3">
                                <span className="text-muted font-monospace d-block small uppercase">Central Workshop Location</span>
                                <strong className="text-dark">Shop No. 19, Gandhi Nagar Sector 22, Road No 5, Gandhi Nagar</strong>
                            </div>

                            <div className="mb-3">
                                <span className="text-muted font-monospace d-block small">Operational Shift Window</span>
                                <strong className="text-dark">Monday – Saturday (08:00 AM – 08:00 PM)</strong>
                            </div>

                            <div className="p-3 bg-light rounded border border-dashed text-center mb-4">
                                <span className="text-muted d-block small mb-1">Emergency Towing Desk Helpline</span>
                                <a href="tel:+919352223702" className="fw-bold text-decoration-none h5 text-primary" style={{ letterSpacing: '1px' }}>
                                    📞 +91 (935) 222-3702
                                </a>
                            </div>
                        </div>

                        {/* Integrated Live Google Map Layout Section */}
                        <div>
                            <span className="text-muted font-monospace d-block small uppercase mb-2">🗺️ Satellite Workstation Map</span>
                            <div className="position-relative w-100 rounded overflow-hidden border mb-2" style={{ height: '200px', backgroundColor: '#e5e7eb' }}>
                                <iframe
                                    title="Majisa Garage Navigation Map"
                                    src="https://maps.google.com/maps?q=Shop%20No.%2019,%20Gandhi%20Nagar%20Sector%2022,%20Road%20No%205,%20Gandhi%20Nagar&t=&z=15&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                            
                            <a 
                                href="https://maps.app.goo.gl/xVuJHXCSmH63TzFy6?g_st=aw" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn btn-outline-dark btn-sm w-100 font-monospace py-2"
                                style={{ borderRadius: '6px' }}
                            >
                                🗺️ Launch Fullscreen Navigation Coordinates
                            </a>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutCorporate;