// frontend/src/components/user/PartsInventory.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/PartsInventory.css'; 

const PartsInventory = ({ currentUser }) => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null); 
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
    const [actionStatus, setActionStatus] = useState({ type: '', text: '' });
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [toastMessage, setToastMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchInventoryCatalog();
    }, []);

    const fetchInventoryCatalog = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/products/all');
            setProducts(res.data);
        } catch (err) {
            console.error("Could not fetch inventory components.", err);
        } finally {
            setLoading(false);
        }
    };

    // NEW: Helper function to calculate Overall Average Rating and count dynamically
    const getProductRatingMetrics = (reviews) => {
        if (!reviews || reviews.length === 0) {
            return { average: 0, count: 0 };
        }
        const totalScore = reviews.reduce((sum, rev) => sum + rev.rating, 0);
        const averageScore = (totalScore / reviews.length).toFixed(1);
        return { average: parseFloat(averageScore), count: reviews.length };
    };

    const triggerToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3500);
    };

    const handleAddToCart = (product, e) => {
        e.stopPropagation(); 
        if (product.stock === 0) {
            triggerToast(`⚠️ "${product.title}" is currently out of stock!`);
            return;
        }
        triggerToast(`🛒 Added "${product.title}" to your workshop cart allocation!`);
    };

    const handleInstantBuy = (product, e) => {
        e.stopPropagation();
        if (product.stock === 0) {
            triggerToast(`⚠️ Cannot process checkout. "${product.title}" is out of stock.`);
            return;
        }
        triggerToast(`⚡ Initializing secure checkout tunnel for ${product.title}...`);
    };

    const handleOpenDetails = (product) => {
        setSelectedProduct(product);
        setActiveImageIndex(0);
        setReviewForm({ rating: '5', comment: '' });
        setActionStatus({ type: '', text: '' });
        setViewMode('detail'); 
    };

    const handleBackToList = () => {
        setViewMode('list');
        setSelectedProduct(null);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setActionStatus({ type: '', text: '' });

        try {
            const payload = {
                userName: currentUser?.name || 'Anonymous Client',
                rating: Number(reviewForm.rating),
                comment: reviewForm.comment
            };

            const res = await axios.post(`/api/products/${selectedProduct._id}/review`, payload);
            
            const updatedProduct = { ...selectedProduct, reviews: res.data.reviews };
            setSelectedProduct(updatedProduct);
            fetchInventoryCatalog();
            
            setReviewForm({ rating: '5', comment: '' });
            setActionStatus({ type: 'success', text: 'Review published successfully!' });
        } catch (err) {
            setActionStatus({ type: 'danger', text: 'Failed to record custom feedback log.' });
        }
    };

    const filteredProducts = products.filter((product) => {
        const titleMatch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
        const detailsMatch = product.details?.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || detailsMatch;
    });

    if (loading) {
        return (
            <div className="fk-loading-container font-monospace">
                <div className="spinner-border text-primary mb-3" role="status"></div>
                <div>LOGGING ACTIVE INVENTORY REGISTERS...</div>
            </div>
        );
    }

    return (
        <div className="fk-inventory-wrapper animate-fade-in-view">
            
            {/* FLOATING ACTION NOTIFICATION TOAST */}
            {toastMessage && (
                <div className="fk-global-toast shadow font-monospace animate-fade-in">
                    {toastMessage}
                </div>
            )}

            {/* VIEW MODE 1: GRID GALLERY CARDS OVERVIEW */}
            {viewMode === 'list' && (
                <>
                    {/* E-COMMERCE STYLE INTERACTIVE PRODUCT SEARCH INPUT BAR */}
                    <div className="mb-4">
                        <div className="input-group shadow-sm border rounded overflow-hidden">
                            <span className="input-group-text bg-white border-0 text-muted fs-5">🔍</span>
                            <input 
                                type="text" 
                                className="form-control border-0 py-2.5 font-monospace" 
                                placeholder="Search for garage spares, accessories, brands or specs summaries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button 
                                    className="btn bg-white border-0 text-muted font-monospace fw-bold" 
                                    onClick={() => setSearchQuery('')}
                                >
                                    ✕ Clear
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="row g-3">
                        {filteredProducts.length === 0 ? (
                            <div className="col-12">
                                <div className="fk-empty-card p-5 text-center bg-white rounded shadow-sm">
                                    <span className="fs-1">📦</span>
                                    <h5 className="font-monospace text-muted mt-3">[ ACCESSORIES DATABASE CORE VACANT ]</h5>
                                    <p className="text-secondary small m-0">
                                        {searchQuery ? `No active stock item found matching "${searchQuery}".` : "No hardware items have been uploaded yet."}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            filteredProducts.map((product) => {
                                const discountedPrice = product.discount > 0 
                                    ? product.price - (product.price * (product.discount / 100))
                                    : product.price;

                                // Extract live rating calculations for card
                                const ratingMetrics = getProductRatingMetrics(product.reviews);

                                return (
                                    <div className="col-12 col-sm-6 col-md-4 col-xl-3" key={product._id}>
                                        <div className="fk-product-card d-flex flex-column h-100 bg-white position-relative" onClick={() => handleOpenDetails(product)}>
                                            
                                            {product.discount > 0 && (
                                                <div className="fk-discount-badge font-monospace">
                                                    {product.discount}% OFF
                                                </div>
                                            )}

                                            <div className="fk-image-canvas d-flex align-items-center justify-content-center bg-white">
                                                {product.images && product.images.length > 0 ? (
                                                    <img src={product.images[0]} alt={product.title} className="fk-product-img" />
                                                ) : (
                                                    <span className="text-muted fs-1">⚙️</span>
                                                )}
                                            </div>

                                            <div className="fk-card-body p-3 d-flex flex-column flex-grow-1">
                                                <div className="fk-category text-uppercase font-monospace text-muted mb-1">{product.category}</div>
                                                <h6 className="fk-title text-dark fw-bold mb-1" title={product.title}>{product.title}</h6>
                                                <div className="fk-specs-text text-muted small mb-2">{product.details}</div>

                                                {/* Flipkart-Style Rating Summary Row */}
                                                <div className="d-flex align-items-center gap-2 mb-2 font-monospace">
                                                    {ratingMetrics.count > 0 ? (
                                                        <>
                                                            <span className="badge bg-success px-2 py-1 small d-flex align-items-center gap-1">
                                                                {ratingMetrics.average} ★
                                                            </span>
                                                            <span className="text-muted small">({ratingMetrics.count} Ratings)</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-muted text-mini italic">[ No ratings yet ]</span>
                                                    )}
                                                </div>

                                                <div className="fk-stock-status mb-2 font-monospace">
                                                    {product.stock === 0 ? (
                                                        <span className="stock-badge out-of-stock">🚫 Out of Stock</span>
                                                    ) : product.stock <= 5 ? (
                                                        <span className="stock-badge low-stock">⏳ Hurry, Only {product.stock} Left!</span>
                                                    ) : (
                                                        <div style={{ height: '18px' }}></div>
                                                    )}
                                                </div>

                                                <div className="fk-pricing-row d-flex align-items-baseline gap-2 mb-3">
                                                    <span className="fk-sale-price font-monospace fw-bold">₹{discountedPrice.toFixed(0)}</span>
                                                    {product.discount > 0 && (
                                                        <span className="fk-original-price text-muted text-decoration-line-through small font-monospace">₹{product.price}</span>
                                                    )}
                                                </div>

                                                <div className="fk-action-footer d-flex gap-2 mt-auto pt-2 border-top">
                                                    <button 
                                                        className="btn fk-btn-cart flex-grow-1 py-2 font-monospace fw-bold"
                                                        onClick={(e) => handleAddToCart(product, e)}
                                                        disabled={product.stock === 0}
                                                    >
                                                        🛒 ADD
                                                    </button>
                                                    <button 
                                                        className="btn fk-btn-buy flex-grow-1 py-2 font-monospace fw-bold"
                                                        onClick={(e) => handleInstantBuy(product, e)}
                                                        disabled={product.stock === 0}
                                                    >
                                                        ⚡ BUY
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </>
            )}

            {/* VIEW MODE 2: STANDALONE SEPARATE PRODUCT DETAIL SPECIFICATION WORKSPACE */}
            {viewMode === 'detail' && selectedProduct && (
                <div className="fk-standalone-detail-page bg-white p-4 rounded shadow-sm animate-fade-in">
                    
                    {/* Back Navigation Bar Header */}
                    <div className="mb-4 pb-3 border-bottom d-flex align-items-center justify-content-between">
                        <button className="btn btn-outline-dark font-monospace fw-bold px-3 py-1.5 btn-sm" onClick={handleBackToList}>
                            ⬅️ Back To Parts Gallery
                        </button>
                        <span className="text-uppercase font-monospace text-muted small fw-bold tracking-wider">
                            Category: {selectedProduct.category}
                        </span>
                    </div>

                    <div className="row g-4">
                        {/* Left Side: Modern Gallery Canvas with Backdrop Glass Effect */}
                        <div className="col-12 col-md-5">
                            <div className="fk-detail-gallery-main rounded border overflow-hidden position-relative mb-3 bg-white">
                                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                                    <>
                                        <div 
                                            className="fk-hd-blur-backdrop" 
                                            style={{ backgroundImage: `url(${selectedProduct.images[activeImageIndex]})` }}
                                        ></div>
                                        <img src={selectedProduct.images[activeImageIndex]} alt="selected focal asset view" className="img-fluid fk-standalone-hero-img" />
                                    </>
                                ) : (
                                    <span className="text-muted font-monospace fs-1">🔧</span>
                                )}
                            </div>

                            {selectedProduct.images && selectedProduct.images.length > 1 && (
                                <div className="d-flex gap-2 overflow-x-auto pb-2 justify-content-center">
                                    {selectedProduct.images.map((imgUrl, index) => (
                                        <div 
                                            key={index} 
                                            className={`fk-gallery-thumb border rounded overflow-hidden p-0.5 bg-white ${activeImageIndex === index ? 'border-primary border-2 shadow-sm' : ''}`}
                                            onClick={() => setActiveImageIndex(index)}
                                        >
                                            <img src={imgUrl} alt="thumbnail track" className="w-100 h-100 object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Right Side: Primary Info Metrics panel */}
                        <div className="col-12 col-md-7 d-flex flex-column">
                            <h3 className="fw-bold text-dark mb-1">{selectedProduct.title}</h3>
                            <p className="font-monospace text-muted small mb-2">{selectedProduct.details}</p>

                            {/* Standalone Detail Page Overall Rating Header Metrics Panel */}
                            <div className="d-flex align-items-center gap-2 mb-3 font-monospace">
                                {getProductRatingMetrics(selectedProduct.reviews).count > 0 ? (
                                    <>
                                        <span className="badge bg-success px-2.5 py-1.5 fs-6 d-flex align-items-center gap-1">
                                            {getProductRatingMetrics(selectedProduct.reviews).average} ★
                                        </span>
                                        <span className="text-secondary fw-bold small">
                                            {getProductRatingMetrics(selectedProduct.reviews).count} Authenticated Customer Reviews
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-muted small italic">⭐ No metrics compiled yet</span>
                                )}
                            </div>

                            {/* Live Pricing Matrix Field */}
                            <div className="d-flex align-items-baseline gap-3 p-3 bg-light rounded-3 mb-4">
                                <span className="fs-2 fw-bold text-dark font-monospace">
                                    ₹{(selectedProduct.discount > 0 ? selectedProduct.price - (selectedProduct.price * (selectedProduct.discount / 100)) : selectedProduct.price).toFixed(0)}
                                </span>
                                {selectedProduct.discount > 0 && (
                                    <>
                                        <span className="text-muted text-decoration-line-through font-monospace fs-5">₹{selectedProduct.price}</span>
                                        <span className="badge bg-success font-monospace py-1.5 px-2">{selectedProduct.discount}% OFF SPECIAL</span>
                                    </>
                                )}
                            </div>

                            <div className="mb-4">
                                <h6 className="font-monospace small fw-bold text-secondary text-uppercase border-bottom pb-1 mb-2">📋 Technical Specification & Description</h6>
                                <p className="text-secondary small m-0" style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>{selectedProduct.description}</p>
                            </div>

                            {/* Operational Stock Allocation Level Checks */}
                            <div className="mb-4 font-monospace">
                                {selectedProduct.stock === 0 ? (
                                    <div className="alert alert-danger border-0 p-2 text-center fw-bold m-0">[ 🚫 CURRENTLY UN-AVAILABLE / OUT OF STOCK ]</div>
                                ) : selectedProduct.stock <= 5 ? (
                                    <div className="alert alert-warning border-0 p-2 text-center text-dark fw-bold m-0">⏳ CRITICAL: SYSTEM STOCK DEPLETED! ONLY {selectedProduct.stock} UNITS REMAINING!</div>
                                ) : (
                                    <div className="alert alert-success border-0 p-2 text-center text-dark fw-bold m-0">✅ COMPONENT VERIFIED STABLE: IN STOCK ({selectedProduct.stock} Available Units)</div>
                                )}
                            </div>

                            {/* Landing View Primary Interaction Rows Footer */}
                            <div className="d-flex gap-3 mt-auto pt-3 border-top">
                                <button className="btn fk-btn-cart py-3 px-4 font-monospace fw-bold fs-6 flex-grow-1" onClick={(e) => handleAddToCart(selectedProduct, e)} disabled={selectedProduct.stock === 0}>
                                    🛒 ADD TO CART
                                </button>
                                <button className="btn fk-btn-buy py-3 px-4 font-monospace fw-bold fs-6 flex-grow-1" onClick={(e) => handleInstantBuy(selectedProduct, e)} disabled={selectedProduct.stock === 0}>
                                    ⚡ BUY
                                </button>
                            </div>
                        </div>

                        {/* Bottom: Customer Reviews Submission and Output Log Array */}
                        <div className="col-12 border-top mt-5 pt-4">
                            <h4 className="fw-bold text-dark font-monospace mb-4">⭐ Customer Feedback Portfolio Logs</h4>
                            
                            <div className="row g-4">
                                <div className="col-12 col-lg-4">
                                    <form onSubmit={handleReviewSubmit} className="p-3 bg-light rounded-3 border font-monospace shadow-sm">
                                        <h6 className="small fw-bold text-dark mb-3">✍️ Log New Operational Rating</h6>
                                        
                                        {actionStatus.text && (
                                            <div className={`alert alert-${actionStatus.type} small border-0 p-2 mb-3`}>
                                                {actionStatus.text}
                                            </div>
                                        )}

                                        <div className="mb-3">
                                            <label className="text-mini text-muted fw-bold d-block mb-1">SCORE METRIC</label>
                                            <select className="form-select form-select-sm" value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}>
                                                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                                                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                                                <option value="3">⭐⭐⭐ (3/5)</option>
                                                <option value="2">⭐⭐ (2/5)</option>
                                                <option value="1">⭐ (1/5)</option>
                                            </select>
                                        </div>

                                        <div className="mb-3">
                                            <label className="text-mini text-muted fw-bold d-block mb-1">COMMENTS / REVIEW NOTES</label>
                                            <textarea rows="3" className="form-control form-control-sm" placeholder="Describe quality performance, fitment precision benchmarks..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required></textarea>
                                        </div>

                                        <button type="submit" className="btn btn-dark btn-sm w-100 fw-bold py-2">SUBMIT REVIEW</button>
                                    </form>
                                </div>

                                <div className="col-12 col-lg-8">
                                    <div className="d-flex flex-column gap-2 max-vh-50 overflow-auto pe-2">
                                        {selectedProduct.reviews && selectedProduct.reviews.length === 0 ? (
                                            <p className="text-center font-monospace text-muted small py-4 bg-light rounded border border-dashed">[ No previous reviews tracked down for this asset component module. ]</p>
                                        ) : (
                                            selectedProduct.reviews.map((rev, index) => (
                                                <div key={index} className="p-3 bg-white rounded-3 border shadow-mini font-monospace">
                                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                                        <span className="fw-bold text-primary small">👤 {rev.userName}</span>
                                                        <span className="badge bg-warning text-dark small">⭐ {rev.rating} / 5</span>
                                                    </div>
                                                    <p className="m-0 text-secondary small italic">"{rev.comment}"</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default PartsInventory;