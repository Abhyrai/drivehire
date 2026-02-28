import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, toggleFavoriteDriver } from '../../services/api';
import { getDriverBadges } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';
import { FiHeart, FiStar, FiMapPin, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Favorites() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const load = async () => {
        try {
            const { data } = await getFavorites();
            setFavorites(data);
        } catch { }
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const handleRemove = async (driverId) => {
        try {
            await toggleFavoriteDriver(driverId);
            toast.success('Removed from favorites');
            load();
        } catch { toast.error('Error removing favorite'); }
    };

    if (loading) return <PageSkeleton />;

    return (
        <div>
            <div className="page-header">
                <h1>❤️ Favorite Drivers</h1>
                <p>Your saved drivers for quick rebooking</p>
            </div>

            {favorites.length === 0 ? (
                <div className="glass-card empty-state">
                    <div className="empty-icon">💔</div>
                    <h3>No favorite drivers yet</h3>
                    <p>Add drivers to your favorites while browsing search results</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate('/customer/search')}>
                        Find Drivers
                    </button>
                </div>
            ) : (
                <div className="drivers-grid">
                    {favorites.map(fav => {
                        const driver = fav.driver;
                        if (!driver) return null;
                        const badges = getDriverBadges(driver);
                        return (
                            <div key={fav._id} className="glass-card driver-card">
                                <div className="driver-avatar">
                                    {driver.user?.name?.charAt(0)?.toUpperCase() || 'D'}
                                </div>
                                <div className="driver-info">
                                    <h3>{driver.user?.name || 'Driver'}</h3>
                                    <div className="driver-meta">
                                        {driver.rating > 0 && <span><FiStar style={{ color: 'var(--warning)' }} /> {driver.rating?.toFixed(1)}</span>}
                                        <span><FiMapPin /> {driver.serviceArea?.city || 'India'}</span>
                                        <span>{driver.experience || 0} yrs exp</span>
                                    </div>
                                    {badges.length > 0 && (
                                        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                            {badges.map((b, i) => (
                                                <span key={i} className={`badge badge-${b.color}`}>{b.label}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="driver-actions">
                                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/customer/driver/${driver._id}`)}>
                                        <FiEye /> View
                                    </button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleRemove(driver._id)}>
                                        <FiHeart /> Remove
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
