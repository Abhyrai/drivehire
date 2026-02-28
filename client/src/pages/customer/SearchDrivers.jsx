import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchDrivers, toggleFavoriteDriver, getFavorites } from '../../services/api';
import { FiStar, FiMapPin, FiMap, FiList, FiFilter, FiChevronDown, FiHeart } from 'react-icons/fi';
import MapView from '../../components/MapView';
import { getDriverBadges } from '../../utils/utils';
import useDebounce from '../../hooks/useDebounce';
import { CardSkeleton } from '../../components/SkeletonLoader';
import { toast } from 'react-toastify';

const cityCoords = {
    mumbai: [19.076, 72.8777], delhi: [28.6139, 77.209], bangalore: [12.9716, 77.5946],
    hyderabad: [17.385, 78.4867], chennai: [13.0827, 80.2707], kolkata: [22.5726, 88.3639],
    pune: [18.5204, 73.8567], ahmedabad: [23.0225, 72.5714], jaipur: [26.9124, 75.7873],
};

export default function SearchDrivers() {
    const [filters, setFilters] = useState({
        city: '', vehicleType: '', transmission: '', minRating: '', minExperience: '', sortBy: 'rating'
    });
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('list');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const navigate = useNavigate();

    const debouncedCity = useDebounce(filters.city, 400);

    // Load favorites on mount
    useEffect(() => {
        getFavorites().then(res => {
            const ids = new Set(res.data.map(f => f.driver?._id).filter(Boolean));
            setFavoriteIds(ids);
        }).catch(() => { });
    }, []);

    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        try {
            const params = {};
            Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
            const { data } = await searchDrivers(params);
            let results = data.drivers || [];

            // Client-side filter: experience
            if (filters.minExperience) {
                results = results.filter(d => d.experience >= Number(filters.minExperience));
            }

            // Client-side sort
            if (filters.sortBy === 'rating') results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            else if (filters.sortBy === 'experience') results.sort((a, b) => b.experience - a.experience);
            else if (filters.sortBy === 'name') results.sort((a, b) => (a.userId?.name || '').localeCompare(b.userId?.name || ''));

            setDrivers(results);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    // Auto-search on debounced city change
    useEffect(() => { handleSearch(); }, [debouncedCity]);

    const handleChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

    const clearFilters = () => {
        setFilters({ city: '', vehicleType: '', transmission: '', minRating: '', minExperience: '', sortBy: 'rating' });
    };

    const handleFavorite = async (e, driverId) => {
        e.stopPropagation();
        try {
            const { data } = await toggleFavoriteDriver(driverId);
            setFavoriteIds(prev => {
                const next = new Set(prev);
                data.favorited ? next.add(driverId) : next.delete(driverId);
                return next;
            });
            toast.success(data.favorited ? 'Added to favorites ❤️' : 'Removed from favorites');
        } catch { toast.error('Error updating favorite'); }
    };

    const getMapCenter = () => {
        const city = filters.city?.toLowerCase();
        return cityCoords[city] || [19.076, 72.8777];
    };

    const mapMarkers = drivers.map((d, i) => {
        const base = cityCoords[d.city?.toLowerCase()] || getMapCenter();
        const offset = 0.01 + (i * 0.005);
        const angle = (i * 137.5) * (Math.PI / 180);
        return {
            lat: base[0] + offset * Math.cos(angle),
            lng: base[1] + offset * Math.sin(angle),
            label: `${d.userId?.name || 'Driver'} — ⭐ ${d.rating || 'New'} — ${d.experience}yr exp`,
            color: d.rating >= 4 ? '#FF6B35' : '#004E98',
        };
    });

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                    <h1>Find a Driver 🔍</h1>
                    <p className="text-muted">Search verified drivers by location, vehicle type, and more</p>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                    <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('list')} title="List view"><FiList /> List</button>
                    <button className={`btn btn-sm ${viewMode === 'map' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('map')} title="Map view"><FiMap /> Map</button>
                </div>
            </div>

            <form className="filter-bar" onSubmit={handleSearch}>
                <div className="form-group">
                    <label className="form-label">City</label>
                    <input name="city" className="form-input" placeholder="e.g. Mumbai" value={filters.city} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label className="form-label">Vehicle Type</label>
                    <select name="vehicleType" className="form-select" value={filters.vehicleType} onChange={handleChange}>
                        <option value="">All</option><option value="car">Car</option><option value="bike">Bike</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Transmission</label>
                    <select name="transmission" className="form-select" value={filters.transmission} onChange={handleChange}>
                        <option value="">All</option><option value="manual">Manual</option><option value="automatic">Automatic</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label">Min Rating</label>
                    <select name="minRating" className="form-select" value={filters.minRating} onChange={handleChange}>
                        <option value="">Any</option><option value="4.5">4.5+ ⭐</option><option value="4">4+ ⭐</option><option value="3">3+ ⭐</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdvanced(!showAdvanced)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiFilter /> <FiChevronDown style={{ transform: showAdvanced ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                </button>
            </form>

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="glass-card" style={{ display: 'flex', gap: 'var(--space-lg)', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 'var(--space-xl)', padding: 'var(--space-md)' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Min Experience (yrs)</label>
                        <select name="minExperience" className="form-select" value={filters.minExperience} onChange={handleChange}>
                            <option value="">Any</option><option value="1">1+</option><option value="3">3+</option><option value="5">5+</option><option value="10">10+</option>
                        </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                        <label className="form-label">Sort By</label>
                        <select name="sortBy" className="form-select" value={filters.sortBy} onChange={handleChange}>
                            <option value="rating">Highest Rating</option><option value="experience">Most Experience</option><option value="name">Name A-Z</option>
                        </select>
                    </div>
                    <button type="button" className="btn btn-secondary" onClick={() => { clearFilters(); }} style={{ fontSize: 'var(--font-xs)' }}>
                        Clear All Filters
                    </button>
                </div>
            )}

            {/* Result Count */}
            <p className="text-sm text-muted" style={{ marginBottom: 'var(--space-md)' }}>
                {loading ? 'Searching...' : `${drivers.length} verified driver${drivers.length !== 1 ? 's' : ''} found`}
            </p>

            {/* Map View */}
            {viewMode === 'map' && (
                <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <MapView center={getMapCenter()} zoom={12} markers={mapMarkers} height="420px" />
                    <p className="text-sm text-muted" style={{ marginTop: 'var(--space-sm)', textAlign: 'center' }}>
                        🟠 Top-rated drivers • 🔵 Other drivers • Click markers for details
                    </p>
                </div>
            )}

            {/* List View */}
            <div className="drivers-grid">
                {loading ? (
                    <CardSkeleton count={6} />
                ) : drivers.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="empty-icon">🚗</div>
                        <h3>No drivers found</h3>
                        <p>Try adjusting your filters or check back later</p>
                    </div>
                ) : (
                    drivers.map((d) => {
                        const badges = getDriverBadges(d);
                        const isFav = favoriteIds.has(d._id);
                        return (
                            <div key={d._id} className="glass-card driver-card" onClick={() => navigate(`/customer/driver/${d._id}`)}>
                                <div className="driver-avatar">
                                    {d.userId?.name?.charAt(0)?.toUpperCase() || 'D'}
                                </div>
                                <div className="driver-info">
                                    <h3>{d.userId?.name || 'Driver'}</h3>
                                    <div className="driver-meta">
                                        <span><FiMapPin /> {d.city}</span>
                                        <span><FiStar style={{ color: 'var(--warning)' }} /> {d.rating || 'New'}</span>
                                        <span>{d.experience} yrs exp</span>
                                        <span>{d.vehicleTypes?.join(', ')}</span>
                                        <span>{d.transmissions?.join(', ')}</span>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                                        {badges.map((b, i) => (
                                            <span key={i} className={`badge badge-${b.color}`}>{b.label}</span>
                                        ))}
                                        {d.languages?.map((l, i) => (
                                            <span key={`l-${i}`} className="badge badge-primary">{l}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="driver-actions">
                                    <button
                                        className={`btn btn-sm ${isFav ? 'btn-danger' : 'btn-secondary'}`}
                                        onClick={(e) => handleFavorite(e, d._id)}
                                        title={isFav ? 'Remove from favorites' : 'Add to favorites'}
                                    >
                                        <FiHeart style={{ fill: isFav ? 'currentColor' : 'none' }} />
                                    </button>
                                    <button className="btn btn-primary btn-sm">View & Book</button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
