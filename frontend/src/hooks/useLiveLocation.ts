import { useState, useEffect, useRef } from 'react';

export interface LiveLocation {
  lat: number;
  lng: number;
  locationName: string;
  isLiveGPS: boolean;
  accuracyMeters?: number;
  isLoading: boolean;
  error?: string | null;
  isPinned?: boolean;
}

export const reverseGeocodeNominatim = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16`,
      { headers: { 'Accept-Language': 'en' } }
    );
    if (res.ok) {
      const data = await res.json();
      const addr = data.address;
      if (addr) {
        const road = addr.road || addr.pedestrian || addr.footway || "";
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.city_district || "";
        const city = addr.city || addr.town || addr.village || addr.county || addr.state || "";
        const parts = [road, area, city].filter(Boolean);
        if (parts.length > 0) return parts.join(', ');
      }
    }
  } catch (e) {
    console.warn("Reverse geocoding error:", e);
  }
  return `Coordinates (${lat.toFixed(4)}°, ${lon.toFixed(4)}°)`;
};

export const useLiveLocation = (): LiveLocation & { 
  refreshLocation: () => void;
  setManualPin: (lat: number, lng: number, customName?: string) => Promise<void>;
  resetToDeviceGPS: () => void;
} => {
  const [location, setLocation] = useState<LiveLocation>(() => {
    // Check if user previously pinned a custom exact location
    const savedPin = typeof window !== 'undefined' ? localStorage.getItem('crisisweave_user_pin') : null;
    if (savedPin) {
      try {
        const parsed = JSON.parse(savedPin);
        return {
          lat: parsed.lat,
          lng: parsed.lng,
          locationName: parsed.locationName || "Pinned Location",
          isLiveGPS: true,
          accuracyMeters: 1, // 100% pin precision
          isLoading: false,
          isPinned: true
        };
      } catch (e) {
        // ignore parse error
      }
    }
    return {
      lat: 19.1258,
      lng: 73.0004,
      locationName: "Acquiring live GPS location...",
      isLiveGPS: false,
      isLoading: true,
      error: null,
      isPinned: false
    };
  });

  const watchIdRef = useRef<number | null>(null);

  // Fallback to real IP-based geolocation if device GPS chip is initializing or restricted
  const fetchRealIPLocation = async () => {
    try {
      const res = await fetch('https://freeipapi.com/api/json');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude) {
          const area = [data.cityName, data.regionName, data.countryName].filter(Boolean).join(', ');
          setLocation(prev => {
            // Do not override user's manual pin
            if (prev.isPinned) return prev;
            return {
              ...prev,
              lat: data.latitude,
              lng: data.longitude,
              locationName: area || "Current Location",
              isLiveGPS: true,
              accuracyMeters: 500,
              isLoading: false
            };
          });
        }
      }
    } catch (e) {
      console.warn("IP Geolocation fallback failed:", e);
    }
  };

  const startLiveTracking = () => {
    // If pinned, don't overwrite with IP unless explicitly reset
    const savedPin = localStorage.getItem('crisisweave_user_pin');
    if (savedPin) {
      return;
    }

    // 1. Fetch real IP coordinates immediately
    fetchRealIPLocation();

    // 2. Start high-accuracy device GPS tracking
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const placeName = await reverseGeocodeNominatim(latitude, longitude);

          setLocation(prev => {
            if (prev.isPinned) return prev;
            return {
              lat: latitude,
              lng: longitude,
              locationName: placeName,
              isLiveGPS: true,
              accuracyMeters: Math.round(accuracy),
              isLoading: false,
              isPinned: false,
              error: null
            };
          });
        },
        (err) => {
          console.warn("Device GPS error, maintaining live network location:", err.message);
          setLocation(prev => ({
            ...prev,
            isLoading: false,
            error: err.message
          }));
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 5000
        }
      );
    }
  };

  const setManualPin = async (lat: number, lng: number, customName?: string) => {
    const locName = customName || await reverseGeocodeNominatim(lat, lng);
    const newLoc: LiveLocation = {
      lat,
      lng,
      locationName: locName,
      isLiveGPS: true,
      accuracyMeters: 1, // Exact touch/pin point precision
      isLoading: false,
      isPinned: true,
      error: null
    };

    localStorage.setItem('crisisweave_user_pin', JSON.stringify({
      lat,
      lng,
      locationName: locName
    }));

    setLocation(newLoc);
  };

  const resetToDeviceGPS = () => {
    localStorage.removeItem('crisisweave_user_pin');
    setLocation(prev => ({
      ...prev,
      isPinned: false,
      isLoading: true
    }));
    startLiveTracking();
  };

  useEffect(() => {
    startLiveTracking();

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...location,
    refreshLocation: startLiveTracking,
    setManualPin,
    resetToDeviceGPS
  };
};
