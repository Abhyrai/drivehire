/**
 * Shared Google Maps configuration
 * 
 * IMPORTANT: Both MapView and LocationPicker MUST import from this file
 * to avoid the "Loader must not be called again with different options" error.
 * The @react-google-maps/api library does strict reference equality on the
 * libraries array, so it MUST be the exact same array object.
 */

export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyAbQIPq-4poK4EEjS_QEt6PdRhE7gT8x-0';

// This MUST be a single constant — never recreate this array
export const GOOGLE_MAPS_LIBRARIES = ['places'];
