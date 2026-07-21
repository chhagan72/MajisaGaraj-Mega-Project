// frontend/src/components/admin/ManageProducts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
    const [selectedReviews, setSelectedReviews] = useState(null); // Review Viewer Modal state Layer

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await axios.get('/api/products/all');
            setProducts(res.data);
        } catch (err) {
            console.error("Failed to read system inventory logs.", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("CRITICAL WARNING: Wipe this stock item from active terminal catalogs permanently?")) return;
        try {
            const res = await axios.delete(`/api/products/delete/${id}`);
            setStatusMsg({ type: 'success', text: res.data.message });
            fetchProducts();
        } catch (err) {
            setStatusMsg({ type: 'danger', text: 'Could not purge the specified component item profile.' });
        }
    };

    const initiateEdit = (product) => {
        setEditingProduct({ ...product });
    };

    const handleEditInputChange = (e) => {
        setEditingProduct({ ...editingProduct, [e.target.name]: e.target.value });
    };

    const saveUpdatedProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.put(`/api/products/update/${editingProduct._id}`, editingProduct);
            setStatusMsg({ type: 'success', text: res.data.message });
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            setStatusMsg({ type: 'danger', text: 'Failed to rewrite internal stock parameters.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-fade-in-view">
            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type} border-0 shadow-sm small font-monospace mb-4`}>
                    🔧 {statusMsg.text}
                </div>
            )}

            {/* MODAL CONFIG EDIT CONTROL LAYER OVERLAY BLOCK */}
            {editingProduct && (
                <div className="card border-0 shadow-lg p-4 bg-white mb-4 rounded-3 border-start border-warning border-4">
                    <h5 className="fw-bold text-dark font-monospace mb-3">🛠️ System Overwrite Matrix: {editingProduct.title}</h5>
                    <form onSubmit={saveUpdatedProduct}>
                        <div className="row g-3">
                            <div className="col-12 col-md-6">
                                <label className="small fw-bold text-muted font-monospace">Product Name</label>
                                <input type="text" name="title" className="form-control" value={editingProduct.title} onChange={handleEditInputChange} required />
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="small fw-bold text-muted font-monospace">Base Price (INR)</label>
                                <input type="number" name="price" className="form-control" value={editingProduct.price} onChange={handleEditInputChange} required />
                            </div>
                            <div className="col-6 col-md-3">
                                <label className="small fw-bold text-muted font-monospace">Markdown Discount (%)</label>
                                <input type="number" name="discount" className="form-control" value={editingProduct.discount} onChange={handleEditInputChange} required />
                            </div>
                            <div className="col-6 col-md-4">
                                <label className="small fw-bold text-muted font-monospace">Current Available Stock</label>
                                <input type="number" name="stock" className="form-control" value={editingProduct.stock} onChange={handleEditInputChange} required />
                            </div>
                            <div className="col-6 col-md-8">
                                <label className="small fw-bold text-muted font-monospace">Specs Summary / Details</label>
                                <input type="text" name="details" className="form-control" value={editingProduct.details} onChange={handleEditInputChange} required />
                            </div>
                            <div className="col-12">
                                <label className="small fw-bold text-muted font-monospace">Long Description Profile</label>
                                <textarea name="description" rows="2" className="form-control" value={editingProduct.description} onChange={handleEditInputChange} required></textarea>
                            </div>
                        </div>
                        <div className="mt-3 text-end gap-2 d-flex justify-content-end">
                            <button type="button" onClick={() => setEditingProduct(null)} className="btn btn-sm btn-light border px-3">Abort Configuration</button>
                            <button type="submit" className="btn btn-sm btn-warning px-4 fw-bold text-dark" disabled={loading}>{loading ? 'Writing changes...' : 'Rewrite System Log'}</button>
                        </div>
                    </form>
                </div>
            )}

            {/* LIVE CUSTOMER REVIEWS VIEW LAYER CONTAINER */}
            {selectedReviews && (
                <div className="card border-0 shadow p-4 bg-white mb-4 rounded-3 border-start border-info border-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="fw-bold m-0 font-monospace text-dark">⭐ User Reviews Portfolio Tracker</h5>
                        <button className="btn btn-sm btn-outline-secondary py-0 border-0" onClick={() => setSelectedReviews(null)}>✕ Close View</button>
                    </div>
                    {selectedReviews.length === 0 ? (
                        <p className="text-muted font-monospace small m-0 p-2 bg-light rounded text-center">[ No customer feedback logged for this stock module index yet. ]</p>
                    ) : (
                        <div className="d-flex flex-column gap-2 max-vh-25 overflow-auto">
                            {selectedReviews.map((rev, index) => (
                                <div key={index} className="p-2.5 bg-light rounded border border-light">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span className="fw-bold small text-primary">{rev.userName}</span>
                                        <span className="badge bg-warning text-dark small">⭐ {rev.rating}/5</span>
                                    </div>
                                    <p className="m-0 text-dark small italic font-monospace">"{rev.comment}"</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* STOCKS INVENTORY CONTROL TABLE MONITOR GRID */}
            <div className="card border-0 shadow-sm p-0 bg-white rounded-3 overflow-hidden">
                <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
                    <h5 className="m-0 fw-bold font-monospace text-dark">🗃️ Active Operations Storage Desk</h5>
                    <span className="badge bg-dark font-monospace px-3 py-2">{products.length} Items Indexed</span>
                </div>
                
                <div className="table-responsive">
                    <table className="table table-hover align-middle m-0 text-nowrap">
                        <thead className="table-dark font-monospace text-uppercase small">
                            <tr>
                                <th className="ps-3">Item Aspect</th>
                                <th>Category</th>
                                <th>Base Cost</th>
                                <th>Markdown</th>
                                <th>Stock Floor</th>
                                <th>Customer Metrics</th>
                                <th className="text-center pe-3">System Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center text-muted font-monospace py-5">[ Operations database core array index is fully vacant ]</td>
                                </tr>
                            ) : (
                                products.map((item) => (
                                    <tr key={item._id}>
                                        <td className="ps-3">
                                            <div className="d-flex align-items-center gap-2">
                                                {item.images && item.images.length > 0 ? (
                                                    <img src={item.images[0]} alt="thumb" className="rounded" style={{ width: '45px', height: '45px', objectFit: 'cover' }} />
                                                ) : (
                                                    <div className="bg-secondary rounded text-white d-flex align-items-center justify-content-center font-monospace" style={{ width: '45px', height: '45px', fontSize: '12px' }}>N/A</div>
                                                )}
                                                <div>
                                                    <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px' }}>{item.title}</div>
                                                    <div className="text-muted text-mini font-monospace text-truncate" style={{ maxWidth: '200px' }}>{item.details}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge bg-outline-secondary border text-secondary font-monospace px-2 py-1">{item.category}</span></td>
                                        <td className="fw-bold text-dark font-monospace">₹{item.price}</td>
                                        <td className="text-danger fw-bold font-monospace">{item.discount}% OFF</td>
                                        <td>
                                            <span className={`fw-bold font-monospace ${item.stock <= 5 ? 'text-danger' : 'text-emerald'}`}>
                                                {item.stock} Units
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-info font-monospace py-1" onClick={() => setSelectedReviews(item.reviews)}>
                                                ⭐ Track ({item.reviews?.length || 0})
                                            </button>
                                        </td>
                                        <td className="text-center pe-3">
                                            <div className="d-flex justify-content-center gap-2">
                                                <button className="btn btn-sm btn-warning font-monospace text-dark py-1 px-2.5 fw-bold" onClick={() => initiateEdit(item)}>
                                                    ✏️ Edit
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger font-monospace py-1 px-2" onClick={() => handleDelete(item._id)}>
                                                    🗑️ Purge
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageProducts;