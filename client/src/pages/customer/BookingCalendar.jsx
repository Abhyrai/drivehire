import { useState, useEffect, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getCustomerBookings } from '../../services/api';
import { formatINR, timeAgo } from '../../utils/utils';
import { PageSkeleton } from '../../components/SkeletonLoader';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const STATUS_COLORS = {
    pending: 'var(--warning)',
    confirmed: 'var(--info)',
    active: 'var(--success)',
    completed: 'var(--text-muted)',
    cancelled: 'var(--danger)',
};

export default function BookingCalendar() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const { data } = await getCustomerBookings();
                setBookings(data);
            } catch { }
            setLoading(false);
        })();
    }, []);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    const calendarDays = useMemo(() => {
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrev = new Date(year, month, 0).getDate();
        const days = [];

        // Previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrev - i, month: month - 1, otherMonth: true });
        }
        // Current month
        for (let d = 1; d <= daysInMonth; d++) {
            days.push({ day: d, month, otherMonth: false });
        }
        // Next month's leading days
        const remaining = 42 - days.length;
        for (let d = 1; d <= remaining; d++) {
            days.push({ day: d, month: month + 1, otherMonth: true });
        }
        return days;
    }, [year, month]);

    // Map dates to bookings
    const bookingsByDate = useMemo(() => {
        const map = {};
        bookings.forEach(b => {
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const cur = new Date(start);
            while (cur <= end) {
                const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`;
                if (!map[key]) map[key] = [];
                map[key].push(b);
                cur.setDate(cur.getDate() + 1);
            }
        });
        return map;
    }, [bookings]);

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

    const selectedBookings = selectedDate
        ? bookingsByDate[`${year}-${selectedDate.month}-${selectedDate.day}`] || []
        : [];

    if (loading) return <PageSkeleton />;

    return (
        <div>
            <div className="page-header">
                <h1>📅 Booking Calendar</h1>
                <p>Visualize your bookings on a calendar</p>
            </div>

            <div className="content-grid two-col">
                <div className="glass-card">
                    {/* Month navigation */}
                    <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
                        <button className="btn btn-secondary btn-sm" onClick={prevMonth}><FiChevronLeft /></button>
                        <h2 style={{ fontSize: 'var(--font-xl)' }}>{MONTHS[month]} {year}</h2>
                        <button className="btn btn-secondary btn-sm" onClick={nextMonth}><FiChevronRight /></button>
                    </div>

                    {/* Day headers */}
                    <div className="calendar-grid">
                        {DAYS.map(d => <div key={d} className="calendar-header">{d}</div>)}
                    </div>

                    {/* Days */}
                    <div className="calendar-grid">
                        {calendarDays.map((d, i) => {
                            const key = `${year}-${d.month}-${d.day}`;
                            const dayBookings = bookingsByDate[key] || [];
                            const isToday = d.day === today.getDate() && d.month === today.getMonth() && year === today.getFullYear() && !d.otherMonth;
                            const isSelected = selectedDate && selectedDate.day === d.day && selectedDate.month === d.month && !d.otherMonth;

                            return (
                                <div
                                    key={i}
                                    className={`calendar-day ${d.otherMonth ? 'other-month' : ''} ${isToday ? 'today' : ''}`}
                                    style={isSelected ? { background: 'rgba(255, 107, 53, 0.15)', fontWeight: 700 } : {}}
                                    onClick={() => !d.otherMonth && setSelectedDate(d)}
                                >
                                    <span>{d.day}</span>
                                    <div style={{ display: 'flex', gap: 2 }}>
                                        {dayBookings.slice(0, 3).map((b, j) => (
                                            <div key={j} className="booking-dot" style={{ background: STATUS_COLORS[b.status] || 'var(--text-muted)' }} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                        {Object.entries(STATUS_COLORS).map(([s, c]) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Details panel */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: 16 }}>
                        {selectedDate ? `${MONTHS[selectedDate.month]} ${selectedDate.day}` : 'Select a date'}
                    </h3>
                    {selectedBookings.length === 0 ? (
                        <div className="empty-state" style={{ padding: 'var(--space-xl)' }}>
                            <div className="empty-icon">📭</div>
                            <p>{selectedDate ? 'No bookings on this date' : 'Click a date to see bookings'}</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {selectedBookings.map((b, i) => (
                                <div key={i} style={{ padding: 12, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                                    <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
                                        <span className={`badge badge-${b.status === 'active' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'cancelled' ? 'danger' : 'info'}`}>
                                            {b.status}
                                        </span>
                                        <strong style={{ color: 'var(--primary)' }}>{formatINR(b.totalPrice)}</strong>
                                    </div>
                                    <p style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)' }}>
                                        {b.driver?.user?.name || 'Driver'} • {b.vehicleType}
                                    </p>
                                    <p style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                        {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
