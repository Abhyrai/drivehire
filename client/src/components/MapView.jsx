import { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Polyline } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAbQIPq-4poK4EEjS_QEt6PdRhE7gT8x-0';

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const INDIA_BOUNDS = {
    north: 37.0, south: 6.5,
    east: 97.5, west: 68.0
};

// Dark mode map style
const darkStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8888a0' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a4a' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#6c6c8a' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#7c7c9a' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#5a8a5a' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1a1a3a' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8888a0' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a5a' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#2a2a4a' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#7c7c9a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a2e' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#4a6a8a' }] },
];

// ── Distance / ETA helper ──
export function calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calcETA(distKm, speedKmh = 30) {
    const mins = Math.round((distKm / speedKmh) * 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
}

/**
 * MapView — Google Maps powered, India-focused, theme-aware
 */
export default function MapView({
    center = INDIA_CENTER,
    zoom = 12,
    markers = [],
    height = '350px',
    routePoints = null,
    routeColor = '#6c5ce7',
    showMyLocation = true,
    showDistance = false,
    children
}) {
    const { theme } = useTheme();
    const [activeMarker, setActiveMarker] = useState(null);
    const mapRef = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY
    });

    const mapCenter = Array.isArray(center)
        ? { lat: center[0], lng: center[1] }
        : center;

    const onLoad = useCallback((map) => {
        mapRef.current = map;
    }, []);

    const handleMyLocation = () => {
        if (!navigator.geolocation || !mapRef.current) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                mapRef.current.panTo(loc);
                mapRef.current.setZoom(15);
            },
            () => alert('Unable to get your location')
        );
    };

    // Distance info
    let distInfo = null;
    if (showDistance && routePoints && routePoints.length >= 2) {
        const [p1, p2] = [routePoints[0], routePoints[routePoints.length - 1]];
        const dist = calcDistance(p1[0], p1[1], p2[0], p2[1]);
        distInfo = { km: dist.toFixed(1), eta: calcETA(dist) };
    }

    if (!isLoaded) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div className="map-wrapper" style={{ height, position: 'relative' }}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}
                center={mapCenter}
                zoom={zoom}
                onLoad={onLoad}
                options={{
                    styles: theme === 'dark' ? darkStyle : [],
                    restriction: { latLngBounds: INDIA_BOUNDS, strictBounds: false },
                    minZoom: 5,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: true,
                    zoomControl: true,
                }}
            >
                {/* Markers */}
                {markers.map((m, i) => (
                    <Marker
                        key={i}
                        position={{ lat: m.lat, lng: m.lng }}
                        icon={{
                            path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                            fillColor: m.color || '#6c5ce7',
                            fillOpacity: 1,
                            strokeColor: '#fff',
                            strokeWeight: 2,
                            scale: 1.8,
                            anchor: { x: 12, y: 22 },
                        }}
                        onClick={() => setActiveMarker(i)}
                    >
                        {activeMarker === i && m.label && (
                            <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                <div style={{ fontFamily: 'Inter, sans-serif', color: '#333', minWidth: 120 }}>
                                    <strong>{m.label}</strong>
                                    {m.sublabel && <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.7 }}>{m.sublabel}</p>}
                                </div>
                            </InfoWindow>
                        )}
                    </Marker>
                ))}

                {/* Route Line */}
                {routePoints && routePoints.length >= 2 && (
                    <Polyline
                        path={routePoints.map(p => ({ lat: p[0], lng: p[1] }))}
                        options={{
                            strokeColor: routeColor,
                            strokeWeight: 4,
                            strokeOpacity: 0.8,
                            geodesic: true,
                        }}
                    />
                )}
            </GoogleMap>

            {/* My Location button */}
            {showMyLocation && (
                <div className="map-my-location" onClick={handleMyLocation} title="My Location">
                    📍
                </div>
            )}

            {/* Distance badge */}
            {distInfo && (
                <div className="map-distance-badge">
                    <span>📏 {distInfo.km} km</span>
                    <span className="map-eta">⏱️ ~{distInfo.eta}</span>
                </div>
            )}
        </div>
    );
}
