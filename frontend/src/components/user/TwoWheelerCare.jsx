import React, { useState, useEffect } from 'react';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import '../css/TwoWheelerCare.css';

const TwoWheelerCare = () => {
    const user = JSON.parse(localStorage.getItem('user_data')) || { id: '' };
    const [slots, setSlots] = useState(15);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const [form, setForm] = useState({
        bikeModel: '',
        registrationNumber: '',
        serviceType: 'Routine Tune-Up',
        partsToReplace: []
    });

    const partsInventoryOptions = [
        "Brake Pads", "Spark Plug", "Engine Oil Filter", "Drive Chain Link", "Air Filter Element", "Clutch Cable"
    ];

    const fetchDashboardData = async () => {
        try {
            const slotRes = await axios.get('/api/services/slots');
            setSlots(slotRes.data.bikeSlots);

            if (user.id || user._id) {
                const targetId = user.id || user._id;
                const historyRes = await axios.get(`/api/services/user/${targetId}`);
                setHistory(historyRes.data);
            }
        } catch (err) {
            console.error("Failed to sync system telemetry nodes.", err);
        }
    };

    useEffect(() => {
        fetchDashboardData();
        const syncTimerNode = setInterval(fetchDashboardData, 7000);
        return () => clearInterval(syncTimerNode);
    }, []);

    const handleCheckboxChange = (part) => {
        const checkedParts = [...form.partsToReplace];
        if (checkedParts.includes(part)) {
            setForm({ ...form, partsToReplace: checkedParts.filter(p => p !== part) });
        } else {
            setForm({ ...form, partsToReplace: [...checkedParts, part] });
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const payload = { userId: user.id || user._id, ...form };
            const res = await axios.post('/api/services/book', payload);
            setMessage({ type: 'success', text: res.data.message || 'Maintenance booking dispatched successfully!' });
            setForm({ bikeModel: '', registrationNumber: '', serviceType: 'Routine Tune-Up', partsToReplace: [] });
            fetchDashboardData(); 
        } catch (err) {
            setMessage({ type: 'danger', text: err.response?.data?.message || 'Transaction rejected by server node.' });
        } finally {
            setLoading(false);
        }
    };

    const downloadInvoicePDF = (job) => {
        if (!job.invoice) {
            alert("No compiled invoice datasets mapped to this finalized timeline loop index reference.");
            return;
        }

        const inv = job.invoice;
        const baseLaborAmount = parseFloat(inv.baseServiceAmount || 0);
        const productsTotal = (inv.products || []).reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
        
        const grossTotal = baseLaborAmount + productsTotal;
        const discountAmount = parseFloat(inv.discount || 0);
        const finalPayableTotal = parseFloat(inv.totalAmount || (grossTotal - discountAmount));

        const partsRowsHtml = (inv.products || [])
            .filter(p => p.name && p.name.trim() !== '')
            .map(p => `
                <tr>
                    <td style="padding: 8px 0; color: #555; border-bottom: 1px dashed #eee;">🔧 Component Part: ${p.name}</td>
                    <td style="padding: 8px 0; text-align: right; color: #555; border-bottom: 1px dashed #eee;">₹${parseFloat(p.amount).toFixed(2)}</td>
                </tr>
            `).join('');

        const elementString = `
            <div style="padding: 40px; font-family: 'Courier New', Courier, monospace; color: #333; line-height: 1.5; background: #fff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="margin: 0; font-weight: bold; letter-spacing: 2px; color: #111;">MAJISA GARAGE</h1>
                    <p style="margin: 5px 0; font-size: 14px; text-transform: uppercase;">Premium Two-Wheeler Care Station</p>
                </div>
                
                <div style="margin-bottom: 15px; font-size: 13px;">
                    <strong>Admin Name:</strong> ${inv.adminName}<br/>
                    <strong>Admin Email:</strong> ${inv.adminEmail}<br/>
                    <strong>Admin Mobile Number:</strong> ${inv.adminMobile}<br/>
                    <strong>Address:</strong> ${inv.address}
                </div>

                <div style="border-bottom: 2px solid #000; margin-bottom: 20px;"></div>

                <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
                    <thead>
                        <tr style="border-bottom: 1px solid #000; text-align: left;">
                            <th style="padding: 8px 0;">Item Description / Field Parameters</th>
                            <th style="padding: 8px 0; text-align: right;">Amount Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Vehicle Model:</strong> ${job.bikeModel} [Reg No: ${job.registrationNumber}]</td>
                            <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #eee;">-</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; border-bottom: 1px dashed #eee;"><strong>Service Required Base:</strong> ${job.serviceType}</td>
                            <td style="padding: 8px 0; text-align: right; border-bottom: 1px dashed #eee;">₹${baseLaborAmount.toFixed(2)}</td>
                        </tr>
                        ${partsRowsHtml}
                    </tbody>
                </table>

                <div style="border-bottom: 1px dashed #000; margin-bottom: 15px;"></div>

                <div style="text-align: right; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
                    <p style="margin: 2px 0;">Gross Total Amount: ₹${grossTotal.toFixed(2)}</p>
                    <p style="margin: 2px 0; color: red;">Discount Given (10% Auto): -₹${discountAmount.toFixed(2)}</p>
                    <div style="border-top: 1px solid #000; display: inline-block; width: 290px; margin-top: 5px; padding-top: 5px;">
                        <strong>Total Final Bill Amount: ₹${finalPayableTotal.toFixed(2)}</strong>
                    </div>
                </div>

                <div style="border-bottom: 2px solid #000; margin-bottom: 30px;"></div>

                <div style="margin-top: 60px; font-size: 12px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <p style="margin: 0; font-weight: bold;">Thank you for trusting Majisa Garage!</p>
                        <p style="margin: 3px 0; color: #666;">Automated Invoicing Log Generation: ${new Date(inv.generatedAt).toLocaleString()}</p>
                    </div>
                    <div style="text-align: center; width: 200px; border-top: 1px solid #333; padding-top: 5px;">
                        <span style="font-style: italic; display: block; margin-bottom: 2px;">${inv.adminName}</span>
                        <strong>Authorized Signature</strong>
                    </div>
                </div>
            </div>
        `;

        const opt = {
            margin:       0.5,
            filename:     `Invoice_${job.registrationNumber}_${job._id.slice(-6)}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().from(elementString).set(opt).save();
    };

    return (
        <div className="container-fluid p-0 animate-fade-in">
            <div className="row g-4 mb-4">
                <div className="col-12">
                    <div className="slots-banner-panel p-4 d-flex align-items-center justify-content-between">
                        <div>
                            <h4 className="m-0 text-dark fw-bold font-monospace small tracking-wider text-uppercase">Live Accessible Slots</h4>
                            <p className="m-0 text-secondary small">Available garage bays update automatically</p>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                            <span className="slots-counter-display">{slots}</span>
                            <span className="badge badge-pulse-status">OPERATIONAL</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-5">
                    <div className="card booking-form-card p-4 border-0">
                        <h5 className="fw-bold text-dark font-monospace mb-4 text-uppercase tracking-wider"> Request Dispatch Form</h5>
                        
                        {message.text && (
                            <div className={`alert alert-${message.type} small d-flex align-items-center gap-2`} role="alert">
                                <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
                                <div>{message.text}</div>
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit}>
                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-bold font-monospace">BIKE MODEL REFERENCE</label>
                                <input type="text" className="form-control premium-form-input" placeholder="e.g. Royal Enfield Bullet 350" required
                                    value={form.bikeModel} onChange={(e) => setForm({ ...form, bikeModel: e.target.value })} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-bold font-monospace">REGISTRATION NUMBER NODE</label>
                                <input type="text" className="form-control premium-form-input" placeholder="e.g. MH-12-AB-1234" required
                                    value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
                            </div>

                            <div className="mb-3">
                                <label className="form-label text-secondary small fw-bold font-monospace">SERVICE BASE OBJECTIVE</label>
                                <select className="form-select pro-form-select" value={form.serviceType}
                                    onChange={(e) => setForm({ ...form, serviceType: e.target.value })}>
                                    <option value="Routine Tune-Up">Routine Tune-Up Diagnostic</option>
                                    <option value="Full Servicing">Full Servicing Reclamation</option>
                                    <option value="Engine Overhaul">Engine Overhaul Calibration</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="form-label text-secondary small fw-bold font-monospace mb-2 d-block">HARDWARE COMPONENTS INDUCTION</label>
                                <div className="row g-2">
                                    {partsInventoryOptions.map((part, idx) => (
                                        <div className="col-6" key={idx}>
                                            <div className={`parts-checkbox-wrapper ${form.partsToReplace.includes(part) ? 'selected' : ''}`}
                                                onClick={() => handleCheckboxChange(part)}>
                                                <input type="checkbox" checked={form.partsToReplace.includes(part)} readOnly className="form-check-input m-0" />
                                                <span className="small fw-semibold text-secondary text-truncate">{part}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-pro-action w-100 py-3 fw-bold font-monospace" disabled={loading || slots === 0}>
                                {loading ? 'TRANSMITTING NODE...' : slots === 0 ? 'SYSTEM SLOTS DEPRECIATED' : 'DISPATCH MAINTENANCE REQUEST'}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="col-12 col-xl-7">
                    <div className="card pipeline-tracking-card p-4 border-0">
                        <h5 className="fw-bold text-dark font-monospace mb-4 text-uppercase tracking-wider"> Real-Time Maintenance Pipeline</h5>
                        
                        {history.length === 0 ? (
                            <div className="text-center p-5 border border-dashed rounded-3 bg-light">
                                <span className="fs-1 d-block mb-2">📁</span>
                                <p className="text-secondary m-0 small fw-bold font-monospace">No maintenance instances mapped to this profile loop.</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {history.map((job) => (
                                    <div className="pipeline-row-item p-3 bg-white border rounded shadow-sm" key={job._id}>
                                        <div className="d-flex align-items-center justify-content-between gap-3">
                                            <div>
                                                <h5 className="m-0 fw-bold text-dark">{job.bikeModel}</h5>
                                                <span className="font-monospace text-secondary small fw-medium">
                                                    {job.registrationNumber} &bull; {job.serviceType}
                                                </span>
                                            </div>
                                            <div className="text-end d-flex flex-column align-items-end gap-2">
                                                <span className={`status-pill phase-${job.status.toLowerCase().replace(/ /g, '-')}`}>
                                                    {job.status.toUpperCase()}
                                                </span>
                                                
                                                {job.status === 'Done' && job.invoice && (
                                                    <button 
                                                        onClick={() => downloadInvoicePDF(job)} 
                                                        className="btn btn-sm btn-outline-primary py-0.5 px-2 rounded font-monospace small"
                                                        style={{ fontSize: '11px' }}
                                                    >
                                                        📥 Download PDF Invoice
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {job.partsToReplace.length > 0 && (
                                            <div className="parts-breakdown-tray mt-3 pt-2">
                                                <span className="text-secondary tiny font-monospace d-block fw-bold mb-1">REPLACEMENT REPAIR STACK:</span>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {job.partsToReplace.map((p, i) => (
                                                        <span className="badge bg-light text-secondary border font-monospace tiny-badge px-2 py-1" key={i}>{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {job.adminNotes && (
                                            <div className="admin-remarks-tray mt-2 p-2">
                                                <span className="font-monospace small text-dark d-block">
                                                    <strong className="text-warning">🔧 Remarks:</strong> {job.adminNotes}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoWheelerCare;