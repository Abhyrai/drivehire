import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDriverPublicProfile, getVehicles, createBooking, getPriceEstimate, toggleFavoriteDriver, getFavorites } from '../../services/api';
import { FiStar, FiMapPin, FiClock, FiCalendar, FiHeart } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MapView from '../../components/MapView';
import LocationPicker from '../../components/LocationPicker';
import { getDriverBadges, formatINR, timeAgo } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';
import confetti from 'canvas-confetti';

// City coordinates
const cityCoords = {
    mumbai: [19.076, 72.8777], delhi: [28.6139, 77.209], bangalore: [12.9716, 77.5946],
    hyderabad: [17.385, 78.4867], chennai: [13.0827, 80.2707], kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714], jaipur: [26.9124, 75.7873],
};

export default function DriverProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [driver, setDriver] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showBooking, setShowBooking] = useState(false);
    const [estimatedPrice, setEstimatedPrice] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bookForm, setBookForm] = useState({
        vehicleId: '', startTime: '', endTime: '', durationType: 'monthly', pickupLocation: '', notes: '',
        pickupLat: null, pickupLng: null, paymentMethod: 'upi'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [dRes, vRes] = await Promise.all([getDriverPublicProfile(id), getVehicles()]);
                setDriver(dRes.data.driver);
                setReviews(dRes.data.reviews);
                setVehicles(vRes.data.vehicles);
                if (vRes.data.vehicles.length > 0) {
                    setBookForm(prev => ({ ...prev, vehicleId: vRes.data.vehicles[0]._id }));
                }
            } catch (err) { console.error(err); }
        };
        load();

        // Check if this driver is in favorites
        getFavorites().then(res => {
            const ids = res.data.map(f => f.driver?._id).filter(Boolean);
            setIsFavorite(ids.includes(id));
        }).catch(() => { });
    }, [id]);

    const handleFavoriteToggle = async () => {
        try {
            const { data } = await toggleFavoriteDriver(id);
            setIsFavorite(data.favorited);
            toast.success(data.favorited ? 'Added to favorites ❤️' : 'Removed from favorites');
        } catch { toast.error('Error updating favorite'); }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'startTime' && value) {
            const start = new Date(value);
            const minEnd = new Date(start);
            minEnd.setDate(minEnd.getDate() + 30);
            const endStr = minEnd.toISOString().slice(0, 16);
            setBookForm(prev => ({ ...prev, startTime: value, endTime: endStr }));
        } else {
            setBookForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleLocationSelect = ({ lat, lng, address }) => {
        setBookForm(prev => ({
            ...prev,
            pickupLocation: address,
            pickupLat: lat,
            pickupLng: lng
        }));
    };

    const handleEstimate = async () => {
        if (!bookForm.startTime || !bookForm.endTime || !bookForm.vehicleId) return;
        try {
            const vehicle = vehicles.find(v => v._id === bookForm.vehicleId);
            const { data } = await getPriceEstimate({
                vehicleType: vehicle?.type || 'car',
                durationType: bookForm.durationType,
                startTime: bookForm.startTime,
                endTime: bookForm.endTime,
                driverExperience: driver?.experience || 0
            });
            setEstimatedPrice(data.estimatedPrice);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { handleEstimate(); }, [bookForm.startTime, bookForm.endTime, bookForm.durationType, bookForm.vehicleId]);

    const getMinEndDate = () => {
        if (!bookForm.startTime) return '';
        const start = new Date(bookForm.startTime);
        const minEnd = new Date(start);
        minEnd.setDate(minEnd.getDate() + 30);
        return minEnd.toISOString().slice(0, 16);
    };

    const getTodayMin = () => new Date().toISOString().slice(0, 16);

    const handleBook = async (e) => {
        e.preventDefault();
        const start = new Date(bookForm.startTime);
        const end = new Date(bookForm.endTime);
        const diffDays = (end - start) / (1000 * 60 * 60 * 24);
        if (diffDays < 30) {
            toast.error('Minimum booking duration is 1 month (30 days)');
            return;
        }
        if (start < new Date()) {
            toast.error('Start date cannot be in the past');
            return;
        }
        setLoading(true);
        try {
            await createBooking({ ...bookForm, driverId: id });
            toast.success('🎉 Booking created! Waiting for driver confirmation.');
            confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
            setTimeout(() => navigate('/customer/bookings'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Booking failed');
        } finally {
            setLoading(false);
        }
    };

    if (!driver) return <PageSkeleton />;

    const driverCity = driver.city?.toLowerCase();
    const driverCoords = cityCoords[driverCity] || [19.076, 72.8777];
    const badges = getDriverBadges(driver);

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Driver Profile</h1>
                <button
                    className={`btn ${isFavorite ? 'btn-danger' : 'btn-secondary'}`}
                    onClick={handleFavoriteToggle}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <FiHeart style={{ fill: isFavorite ? 'currentColor' : 'none' }} />
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
                {/* Profile Card */}
                <div className="glass-card">
                    <div style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
                        <div className="driver-avatar" style={{ width: 80, height: 80, fontSize: 'var(--font-2xl)' }}>
                            {driver.userId?.name?.charAt(0)?.toUpperCase() || 'D'}
                        </div>
                        <div>
                            <h2>{driver.userId?.name}</h2>
                            <div style={{ display: 'flex', gap: 'var(--space-md)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', marginTop: '0.25rem' }}>
                                <span><FiMapPin /> {driver.city}</span>
                                <span><FiStar style={{ color: 'var(--warning)' }} /> {driver.rating || 'New'} ({driver.totalReviews} reviews)</span>
                            </div>
                        </div>
                    </div>

                    {/* Driver Badges */}
                    {badges.length > 0 && (
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                            {badges.map((b, i) => (
                                <span key={i} className={`badge badge-${b.color}`}>{b.label}</span>
                            ))}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                        <div><span className="text-muted text-sm">Experience</span><p>{driver.experience} years</p></div>
                        <div><span className="text-muted text-sm">Completed Jobs</span><p>{driver.completedJobs}</p></div>
                        <div><span className="text-muted text-sm">Vehicle Types</span><p>{driver.vehicleTypes?.join(', ')}</p></div>
                        <div><span className="text-muted text-sm">Transmission</span><p>{driver.transmissions?.join(', ')}</p></div>
                        <div style={{ gridColumn: 'span 2' }}>
                            <span className="text-muted text-sm">Languages</span>
                            <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                                {driver.languages?.map((l, i) => <span key={i} className="badge badge-primary">{l}</span>)}
                            </div>
                        </div>
                    </div>

                    {/* Driver Location Map */}
                    <div style={{ marginTop: 'var(--space-lg)' }}>
                        <span className="text-muted text-sm" style={{ marginBottom: 'var(--space-sm)', display: 'block' }}>📍 Service Area</span>
                        <MapView
                            center={driverCoords}
                            zoom={13}
                            markers={[{ lat: driverCoords[0], lng: driverCoords[1], label: `${driver.userId?.name} — ${driver.city}`, color: '#FF6B35' }]}
                            height="200px"
                        />
                    </div>

                    <button className="btn btn-primary w-full" style={{ marginTop: 'var(--space-xl)' }} onClick={() => setShowBooking(!showBooking)}>
                        {showBooking ? 'Hide Booking Form' : '📅 Book This Driver'}
                    </button>
                </div>

                {/* Reviews */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Reviews ({reviews.length})</h3>
                    {reviews.length === 0 ? (
                        <div className="empty-state"><p>No reviews yet</p></div>
                    ) : (
                        reviews.map((r) => (
                            <div key={r._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: 'var(--space-md)', marginBottom: 'var(--space-md)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                    <strong>{r.customerId?.name || 'Customer'}</strong>
                                    <span style={{ color: 'var(--warning)' }}>{'⭐'.repeat(r.rating)}</span>
                                </div>
                                <p className="text-sm">{r.comment || 'No comment'}</p>
                                <p className="text-sm text-muted">{timeAgo(r.createdAt)}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Booking Form */}
            {showBooking && (
                <div className="glass-card" style={{ marginTop: 'var(--space-xl)' }}>
                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>📅 Book Driver</h3>
                    {vehicles.length === 0 ? (
                        <div className="error-message">
                            You must add a vehicle first. <a onClick={() => navigate('/customer/vehicles')} style={{ cursor: 'pointer' }}>Add one now →</a>
                        </div>
                    ) : (
                        <form onSubmit={handleBook}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Select Vehicle</label>
                                    <select name="vehicleId" className="form-select" value={bookForm.vehicleId} onChange={handleChange} required>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>{v.make} {v.model} ({v.type}) — {v.plateNumber}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Hiring Duration</label>
                                    <div className="form-input" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', color: 'var(--text-secondary)' }}>
                                        📅 Monthly Hiring
                                    </div>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date & Time</label>
                                    <input type="datetime-local" name="startTime" className="form-input" value={bookForm.startTime} onChange={handleChange} min={getTodayMin()} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date & Time (min 30 days)</label>
                                    <input type="datetime-local" name="endTime" className="form-input" value={bookForm.endTime} onChange={handleChange} min={getMinEndDate()} required />
                                </div>
                            </div>

                            {/* Pickup Location with Map */}
                            <div className="form-group">
                                <label className="form-label">📍 Pickup Location (click map to select)</label>
                                <LocationPicker
                                    onSelect={handleLocationSelect}
                                    initial={driverCoords}
                                    height="280px"
                                />
                                <input
                                    name="pickupLocation"
                                    className="form-input"
                                    placeholder="Or type address manually: e.g. Andheri West, Mumbai"
                                    value={bookForm.pickupLocation}
                                    onChange={handleChange}
                                    required
                                    style={{ marginTop: 'var(--space-sm)' }}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Notes (optional)</label>
                                <textarea name="notes" className="form-input" placeholder="Any special instructions..." value={bookForm.notes} onChange={handleChange}></textarea>
                            </div>

                            {estimatedPrice !== null && (
                                <div style={{ background: 'rgba(255, 107, 53, 0.1)', borderRadius: 'var(--radius-md)', padding: 'var(--space-md)', marginBottom: 'var(--space-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className="text-sm">Estimated Price</span>
                                    <span style={{ fontSize: 'var(--font-2xl)', fontWeight: 800, color: 'var(--primary)' }}>{formatINR(estimatedPrice)}</span>
                                </div>
                            )}

                            {/* Payment Method Selector */}
                            <div className="form-group">
                                <label className="form-label">💳 Payment Method</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--space-sm)' }}>
                                    {[
                                        { value: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe' },
                                        { value: 'card', label: 'Card', icon: '💳', desc: 'Debit/Credit' },
                                        { value: 'netbanking', label: 'Net Banking', icon: '🏦', desc: 'Online' },
                                        { value: 'wallet', label: 'Wallet', icon: '👛', desc: 'Paytm, etc' },
                                        { value: 'cash', label: 'Cash', icon: '💵', desc: 'Pay later' },
                                    ].map(m => (
                                        <label key={m.value}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                                                padding: 'var(--space-sm) var(--space-xs)',
                                                borderRadius: 'var(--radius-md)',
                                                border: bookForm.paymentMethod === m.value ? '2px solid var(--primary)' : '2px solid var(--border-color)',
                                                background: bookForm.paymentMethod === m.value ? 'rgba(255,107,53,0.08)' : 'transparent',
                                                cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s'
                                            }}>
                                            <input type="radio" name="paymentMethod" value={m.value}
                                                checked={bookForm.paymentMethod === m.value}
                                                onChange={handleChange}
                                                style={{ display: 'none' }} />
                                            <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                                            <span style={{ fontWeight: 600, fontSize: 'var(--font-sm)' }}>{m.label}</span>
                                            <span className="text-muted" style={{ fontSize: '10px' }}>{m.desc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary btn-lg w-full" disabled={loading || vehicles.length === 0}>
                                {loading ? 'Creating Booking...' : `✅ Confirm Booking — ${bookForm.paymentMethod === 'cash' ? 'Pay Later' : 'Pay Online'}`}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
