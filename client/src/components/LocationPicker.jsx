import { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAbQIPq-4poK4EEjS_QEt6PdRhE7gT8x-0';
const LIBRARIES = ['places'];

const INDIA_CENTER = { lat: 20.5937, lng: 78.9629 };
const INDIA_BOUNDS = {
    north: 37.0, south: 6.5,
    east: 97.5, west: 68.0
};

// Dark mode style
const darkStyle = [
    { elementType: 'geometry', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a1a2e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8888a0' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2a2a4a' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#3a3a5a' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#1a2e1a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a2e' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#22223a' }] },
];

/**
 * LocationPicker — Google Maps based, India-focused, click-to-select + search + GPS
 */
export default function LocationPicker({ onSelect, initial, height = '300px' }) {
    const { theme } = useTheme();
    const [position, setPosition] = useState(
        initial ? { lat: initial[0], lng: initial[1] } : null
    );
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);
    const mapRef = useRef(null);
    const autocompleteService = useRef(null);
    const placesService = useRef(null);
    const geocoder = useRef(null);

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: GOOGLE_MAPS_API_KEY,
        libraries: LIBRARIES
    });

    const onMapLoad = useCallback((map) => {
        mapRef.current = map;
        if (isLoaded && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
            placesService.current = new window.google.maps.places.PlacesService(map);
            geocoder.current = new window.google.maps.Geocoder();
        }
    }, [isLoaded]);

    // Reverse geocode using Google
    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            if (geocoder.current) {
                const result = await geocoder.current.geocode({ location: { lat, lng } });
                const addr = result.results[0]?.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
                setAddress(addr);
                setLoading(false);
                return addr;
            }
            // Fallback to Nominatim
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
            const data = await res.json();
            const addr = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setAddress(addr);
            setLoading(false);
            return addr;
        } catch {
            const fallback = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
            setAddress(fallback);
            setLoading(false);
            return fallback;
        }
    };

    // Google Places Autocomplete search
    const searchAddress = async (query) => {
        if (query.length < 3) { setSearchResults([]); return; }
        if (autocompleteService.current) {
            autocompleteService.current.getPlacePredictions(
                {
                    input: query,
                    componentRestrictions: { country: 'in' },
                    types: ['geocode', 'establishment']
                },
                (predictions, status) => {
                    if (status === 'OK' && predictions) {
                        setSearchResults(predictions);
                        setShowResults(true);
                    } else {
                        setSearchResults([]);
                    }
                }
            );
        } else {
            // Fallback to Nominatim
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
                );
                const data = await res.json();
                setSearchResults(data.map(d => ({
                    description: d.display_name,
                    place_id: null,
                    _lat: parseFloat(d.lat),
                    _lng: parseFloat(d.lon)
                })));
                setShowResults(true);
            } catch { setSearchResults([]); }
        }
    };

    // Debounced search
    const handleSearchInput = (value) => {
        setSearchQuery(value);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => searchAddress(value), 300);
    };

    // Select from search results
    const selectSearchResult = (result) => {
        setShowResults(false);
        setSearchQuery(result.description?.split(',')[0] || result.description);

        // If it's a Google Places result
        if (result.place_id && placesService.current) {
            placesService.current.getDetails(
                { placeId: result.place_id, fields: ['geometry', 'formatted_address'] },
                (place, status) => {
                    if (status === 'OK' && place?.geometry?.location) {
                        const lat = place.geometry.location.lat();
                        const lng = place.geometry.location.lng();
                        const pos = { lat, lng };
                        setPosition(pos);
                        setAddress(place.formatted_address || result.description);
                        if (mapRef.current) {
                            mapRef.current.panTo(pos);
                            mapRef.current.setZoom(15);
                        }
                        if (onSelect) onSelect({ lat, lng, address: place.formatted_address || result.description });
                    }
                }
            );
        } else if (result._lat && result._lng) {
            // Nominatim fallback
            const pos = { lat: result._lat, lng: result._lng };
            setPosition(pos);
            setAddress(result.description);
            if (mapRef.current) {
                mapRef.current.panTo(pos);
                mapRef.current.setZoom(15);
            }
            if (onSelect) onSelect({ lat: result._lat, lng: result._lng, address: result.description });
        }
    };

    // Map click
    const handleMapClick = async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        const pos = { lat, lng };
        setPosition(pos);
        const addr = await reverseGeocode(lat, lng);
        if (onSelect) onSelect({ lat, lng, address: addr });
    };

    // GPS locate
    const handleMyLocation = () => {
        if (!navigator.geolocation || !mapRef.current) return;
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setPosition(loc);
                mapRef.current.panTo(loc);
                mapRef.current.setZoom(15);
                const addr = await reverseGeocode(loc.lat, loc.lng);
                if (onSelect) onSelect({ lat: loc.lat, lng: loc.lng, address: addr });
            },
            () => alert('Unable to get location')
        );
    };

    // Auto-detect location on mount
    useEffect(() => {
        if (!initial && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => { }
            );
        }
    }, []);

    const mapCenter = position || (initial ? { lat: initial[0], lng: initial[1] } : INDIA_CENTER);

    if (!isLoaded) return <div className="loader"><div className="spinner"></div></div>;

    return (
        <div>
            {/* Search Bar */}
            <div className="map-search-container" style={{ marginBottom: 'var(--space-sm)' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="🔍 Search for a place in India..."
                        value={searchQuery}
                        onChange={(e) => handleSearchInput(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                        onBlur={() => setTimeout(() => setShowResults(false), 200)}
                        style={{ paddingLeft: 'var(--space-md)' }}
                    />
                    {showResults && searchResults.length > 0 && (
                        <div className="map-search-results">
                            {searchResults.map((r, i) => (
                                <div key={i} className="map-search-result" onClick={() => selectSearchResult(r)}>
                                    <span>📍</span>
                                    <div>
                                        <strong>{(r.description || '').split(',')[0]}</strong>
                                        <p>{(r.description || '').split(',').slice(1, 3).join(',')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="map-wrapper" style={{ height, position: 'relative' }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }}
                    center={mapCenter}
                    zoom={position ? 14 : 5}
                    onLoad={onMapLoad}
                    onClick={handleMapClick}
                    options={{
                        styles: theme === 'dark' ? darkStyle : [],
                        restriction: { latLngBounds: INDIA_BOUNDS, strictBounds: false },
                        minZoom: 5,
                        mapTypeControl: false,
                        streetViewControl: false,
                        fullscreenControl: false,
                    }}
                >
                    {position && (
                        <Marker
                            position={position}
                            icon={{
                                path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
                                fillColor: '#6c5ce7',
                                fillOpacity: 1,
                                strokeColor: '#fff',
                                strokeWeight: 2,
                                scale: 2,
                                anchor: { x: 12, y: 22 },
                            }}
                        />
                    )}
                </GoogleMap>

                {/* My location button */}
                <div className="map-my-location" onClick={handleMyLocation} title="My Location">
                    📍
                </div>

                {/* Instruction overlay */}
                <div className="map-instruction">
                    📍 Click on the map or search above to set location
                </div>
            </div>

            {/* Selected address */}
            {address && (
                <div className="map-address-display">
                    <span>📍</span>
                    {loading ? 'Finding address...' : address}
                </div>
            )}
        </div>
    );
}
