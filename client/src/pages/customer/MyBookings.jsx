import { useState, useEffect } from 'react';
import { getCustomerBookings, cancelBooking, createReview, extendBooking, initiatePayment, confirmPayment } from '../../services/api';
import { toast } from 'react-toastify';
import QuickMessages from '../../components/QuickMessages';
import StatusTimeline from '../../components/StatusTimeline';
import { formatINR, timeAgo } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';
import confetti from 'canvas-confetti';

const ITEMS_PER_PAGE = 8;

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [tab, setTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [msgBookingId, setMsgBookingId] = useState(null);
    const [extendModal, setExtendModal] = useState(null);
    const [extraMonths, setExtraMonths] = useState(1);
    const [extending, setExtending] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [payLoading, setPayLoading] = useState(null);

    const handlePayNow = async (booking) => {
        setPayLoading(booking._id);
        try {
            const { data } = await initiatePayment(booking._id, { method: booking.paymentMethod || 'upi' });
            // Simulate successful gateway callback
            await confirmPayment(booking._id, {
                paymentId: data.order.paymentId,
                orderId: data.order.orderId,
                gatewayPaymentId: 'PAY_' + Date.now()
            });
            toast.success(`Payment of ${formatINR(booking.totalPrice)} successful! ✅`);
            load();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Payment failed');
        } finally { setPayLoading(null); }
    };

    const load = async () => {
        setLoading(true);
        try {
            const params = tab !== 'all' ? { status: tab } : {};
            const { data } = await getCustomerBookings(params);
            setBookings(data.bookings);
            setCurrentPage(1);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [tab]);

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure? A cancellation penalty may apply.')) return;
        try {
            await cancelBooking(id, { reason: 'Cancelled by customer' });
            toast.success('Booking cancelled');
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleReview = async () => {
        try {
            await createReview({ bookingId: reviewModal, rating, comment });
            toast.success('Review submitted! 🎉');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
            setReviewModal(null);
            setRating(5);
            setComment('');
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    };

    const handleExtend = async () => {
        setExtending(true);
        try {
            const { data } = await extendBooking(extendModal, { extraMonths });
            toast.success(`Booking extended by ${extraMonths} month(s)! Additional: ${formatINR(data.additionalPrice)}`);
            setExtendModal(null);
            setExtraMonths(1);
            load();
        } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
        finally { setExtending(false); }
    };

    const statusColor = (s) => ({ pending: 'warning', confirmed: 'info', active: 'success', completed: 'primary', cancelled: 'danger' }[s] || 'primary');

    // Pagination
    const totalPages = Math.ceil(bookings.length / ITEMS_PER_PAGE);
    const paginatedBookings = bookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="page-content">
            <div className="page-header">
                <h1>My Bookings 📋</h1>
                <p className="text-muted">View and manage your booking history</p>
            </div>

            <div className="tabs-sticky">
                <div className="tabs-scroll">
                    {['all', 'pending', 'confirmed', 'active', 'completed', 'cancelled'].map(t => (
                        <button key={t} className={`tab-pill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                            {t !== 'all' && <span className="tab-count">{bookings.filter(b => t === 'all' || b.status === t).length}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? <PageSkeleton /> : (
                <div className="drivers-grid">
                    {bookings.length === 0 ? (
                        <div className="glass-card empty-state">
                            <div className="empty-icon">📋</div>
                            <h3>No bookings found</h3>
                        </div>
                    ) : (
                        <>
                            {paginatedBookings.map(b => (
                                <div key={b._id} className="glass-card booking-card">
                                    <div className="booking-card-header">
                                        <div className={`booking-status-dot ${b.status}`}></div>
                                        <div className="booking-info" style={{ flex: 1 }}>
                                            <h4>{b.pickupLocation}</h4>
                                            <p>
                                                {b.durationType} • {new Date(b.startTime).toLocaleDateString()} {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {' → '}
                                                {new Date(b.endTime).toLocaleDateString()} {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <p>{b.vehicleId?.make} {b.vehicleId?.model} ({b.vehicleId?.type})</p>
                                            <p className="text-sm text-muted">{timeAgo(b.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className="booking-card-badges">
                                        <span className={`badge badge-${statusColor(b.status)}`}>{b.status}</span>
                                        {b.paymentStatus && (
                                            <span className={`badge ${b.paymentStatus === 'paid' ? 'badge-success' : b.paymentStatus === 'refunded' ? 'badge-warning' : 'badge-secondary'}`}>
                                                {b.paymentStatus === 'paid' ? '💰 Paid' : b.paymentStatus === 'refunded' ? '↩️ Refunded' : `💳 ${(b.paymentMethod || 'cash').toUpperCase()}`}
                                            </span>
                                        )}
                                        <span className="booking-amount">{formatINR(b.totalPrice)}</span>
                                    </div>

                                    {/* Status Timeline */}
                                    <div style={{ width: '100%' }}>
                                        <StatusTimeline status={b.status} />
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {['pending', 'confirmed'].includes(b.status) && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}>Cancel</button>
                                        )}
                                        {['confirmed', 'active'].includes(b.status) && (
                                            <>
                                                <button className="btn btn-secondary btn-sm" onClick={() => setMsgBookingId(msgBookingId === b._id ? null : b._id)}>💬 Message</button>
                                                <button className="btn btn-primary btn-sm" onClick={() => setExtendModal(b._id)}>📅 Extend</button>
                                            </>
                                        )}
                                        {b.status === 'completed' && (
                                            <button className="btn btn-primary btn-sm" onClick={() => setReviewModal(b._id)}>⭐ Review</button>
                                        )}
                                        {/* Pay Now — for unpaid online bookings */}
                                        {b.paymentMethod && b.paymentMethod !== 'cash' && b.paymentStatus !== 'paid' && !['cancelled', 'completed'].includes(b.status) && (
                                            <button className="btn btn-primary btn-sm"
                                                onClick={() => handlePayNow(b)}
                                                disabled={payLoading === b._id}
                                                style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {payLoading === b._id ? '⏳ Processing...' : '💰 Pay Now'}
                                            </button>
                                        )}
                                    </div>
                                    {b.cancellationReason && (
                                        <div className="text-sm text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
                                            Cancelled: {b.cancellationReason} (by {b.cancelledBy})
                                        </div>
                                    )}
                                    {msgBookingId === b._id && (
                                        <div style={{ marginTop: 'var(--space-md)', width: '100%' }}>
                                            <QuickMessages bookingId={b._id} bookingStatus={b.status} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, gridColumn: '1 / -1', paddingTop: 16 }}>
                                    <button className="btn btn-secondary btn-sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button key={i} className={`btn btn-sm ${currentPage === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                    ))}
                                    <button className="btn btn-secondary btn-sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Extend Booking Modal */}
            {extendModal && (
                <div className="modal-overlay" onClick={() => setExtendModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
                        <div className="modal-header">
                            <h2>📅 Extend Booking</h2>
                            <button className="modal-close" onClick={() => setExtendModal(null)}>×</button>
                        </div>
                        <p className="text-sm text-muted" style={{ marginBottom: 16 }}>
                            Extend your current booking by additional months. The price will be recalculated automatically.
                        </p>
                        <div className="form-group">
                            <label className="form-label">Extra Months</label>
                            <select className="form-select" value={extraMonths} onChange={e => setExtraMonths(Number(e.target.value))}>
                                {[1, 2, 3, 6].map(m => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <button className="btn btn-primary w-full" onClick={handleExtend} disabled={extending}>
                            {extending ? 'Extending...' : `Extend by ${extraMonths} month${extraMonths > 1 ? 's' : ''}`}
                        </button>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {reviewModal && (
                <div className="modal-overlay" onClick={() => setReviewModal(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Rate Your Driver</h2>
                            <button className="modal-close" onClick={() => setReviewModal(null)}>×</button>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Rating</label>
                            <div className="stars">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <span key={s} className={`star ${s <= rating ? 'filled' : ''}`}
                                        onClick={() => setRating(s)}>⭐</span>
                                ))}
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Comment</label>
                            <textarea className="form-input" rows={3} placeholder="How was your experience?"
                                value={comment} onChange={e => setComment(e.target.value)}></textarea>
                        </div>
                        <button className="btn btn-primary w-full" onClick={handleReview}>Submit Review</button>
                    </div>
                </div>
            )}
        </div>
    );
}
