// frontend/src/components/admin/AddProduct.jsx
import React, { useState } from 'react';
import axios from 'axios';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        discount: '',
        category: 'Spares',
        stock: '',
        details: '',
        description: ''
    });
    const [images, setImages] = useState([]); // Base64 Array Holder
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Safely handles conversion of multiple files into Base64 structures
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + images.length > 5) {
            setStatusMsg({ type: 'danger', text: 'Operational limit alert! You can only map up to 5 images per product.' });
            return;
        }

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImages((prev) => [...prev, reader.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (indexToRemove) => {
        setImages(images.filter((_, idx) => idx !== indexToRemove));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg({ type: '', text: '' });

        try {
            const completePayload = { ...formData, images };
            const res = await axios.post('/api/products/add', completePayload);
            
            setStatusMsg({ type: 'success', text: res.data.message });
            setFormData({ title: '', price: '', discount: '', category: 'Spares', stock: '', details: '', description: '' });
            setImages([]);
        } catch (err) {
            setStatusMsg({ type: 'danger', text: err.response?.data?.error || 'Database pipeline sync failure.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card border-0 shadow-sm p-4 bg-white rounded-3 animate-fade-in-view">
            <div className="border-bottom pb-3 mb-4">
                <h4 className="m-0 fw-bold text-dark">📦 System Inventory Provisioning Desk</h4>
                <p className="text-muted small m-0">Append new industrial components and garage accessories directly to customer terminal displays.</p>
            </div>

            {statusMsg.text && (
                <div className={`alert alert-${statusMsg.type} font-monospace small border-0 shadow-sm mb-4`}>
                    {statusMsg.type === 'success' ? '✅' : '❌'} {statusMsg.text}
                </div>
            )}

            <form onSubmit={handleFormSubmit}>
                <div className="row g-4">
                    <div className="col-12 col-md-6">
                        <label className="form-label font-monospace small fw-bold">Product Title / Identifier</label>
                        <input type="text" name="title" className="form-control py-2.5" placeholder="e.g., Brembo Carbon-Ceramic Brake Pad Kit" value={formData.title} onChange={handleInputChange} required />
                    </div>
                    <div className="col-12 col-md-6">
                        <label className="form-label font-monospace small fw-bold">Component Category</label>
                        <select name="category" className="form-select py-2.5" value={formData.category} onChange={handleInputChange}>
                            <option value="Spares">Mechanical Spares & Gears</option>
                            <option value="Lubricants">Engine Oils & Fluid Lubricants</option>
                            <option value="Tires">High Performance Tires</option>
                            <option value="Accessories">Premium Garage Accessories</option>
                        </select>
                    </div>

                    <div className="col-12 col-md-4">
                        <label className="form-label font-monospace small fw-bold">Base Retail Price (INR)</label>
                        <input type="number" name="price" className="form-control py-2.5" placeholder="4500" value={formData.price} onChange={handleInputChange} required />
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="form-label font-monospace small fw-bold">System Markdown Discount (%)</label>
                        <input type="number" name="discount" className="form-control py-2.5" placeholder="10" value={formData.discount} onChange={handleInputChange} />
                    </div>
                    <div className="col-12 col-md-4">
                        <label className="form-label font-monospace small fw-bold">Initial Workstation Floor Stock</label>
                        <input type="number" name="stock" className="form-control py-2.5" placeholder="25" value={formData.stock} onChange={handleInputChange} required />
                    </div>

                    <div className="col-12">
                        <label className="form-label font-monospace small fw-bold">Quick Spec Summary / Technical Details</label>
                        <input type="text" name="details" className="form-control py-2.5" placeholder="e.g., 220mm length, heat-resistant alloy, compatible with 150cc-250cc master cylinders" value={formData.details} onChange={handleInputChange} required />
                    </div>

                    <div className="col-12">
                        <label className="form-label font-monospace small fw-bold">Comprehensive Product Narrative Description</label>
                        <textarea name="description" rows="4" className="form-control" placeholder="Provide complete comprehensive product description notes..." value={formData.description} onChange={handleInputChange} required></textarea>
                    </div>

                    {/* IMAGE ENGINE LOADER CONTROLLER */}
                    <div className="col-12">
                        <label className="form-label font-monospace small fw-bold d-block">Telemetry Visual Engine Images (Max 5)</label>
                        <div className="border border-dashed rounded-3 p-4 text-center bg-light position-relative mb-3">
                            <input type="file" multiple accept="image/*" className="position-absolute top-0 start-0 w-100 h-100 opacity-0 style-pointer" onChange={handleImageUpload} disabled={images.length >= 5} />
                            <span className="fs-3">📷</span>
                            <p className="small m-0 mt-2 text-secondary fw-bold">Click or drag layout profiles here to upload vehicle component assets.</p>
                            <p className="text-muted text-mini m-0 font-monospace">[{images.length} / 5 slots mapped]</p>
                        </div>

                        {images.length > 0 && (
                            <div className="d-flex flex-wrap gap-3 p-3 bg-light rounded-3 border">
                                {images.map((img, idx) => (
                                    <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '80px' }}>
                                        <img src={img} alt="preview" className="w-100 h-100 object-cover" />
                                        <button type="button" onClick={() => handleRemoveImage(idx)} className="position-absolute top-0 end-0 bg-danger border-0 text-white font-monospace rounded-bottom-left px-1 py-0 small shadow-sm" style={{ fontSize: '10px' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4 pt-3 border-top text-end">
                    <button type="submit" className="btn btn-dark px-5 py-2.5 fw-bold font-monospace" disabled={loading}>
                        {loading ? 'SYNCING STACKS...' : '⚙️ GENERATE ACTIVE STOCK ENTRY'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;