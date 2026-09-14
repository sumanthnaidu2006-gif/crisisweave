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
  resetToDeviceGPS: () => Promise<boolean>;
  requestDeviceGPS: () => Promise<{ lat: number; lng: number; locationName: string } | null>;
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
      locationName: "Loading region network location...",
      isLiveGPS: false,
      isLoading: true,
      error: null,
      isPinned: false
    };
  });

  const watchIdRef = useRef<number | null>(null);

  // Fallback to real IP-based geolocation (ZERO permission prompt required)
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
              locationName: area || "Current Region (IP Verified)",
              isLiveGPS: false, // Network based, not hardware GPS
              accuracyMeters: 500,
              isLoading: false
            };
          });
        }
      }
    } catch (e) {
      console.warn("IP Geolocation fallback failed:", e);
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        locationName: prev.locationName || "Default Region"
      }));
    }
  };

  /**
   * Explicitly requests high-accuracy device GPS permission.
   * This is ONLY called when the user initiates an action requiring hardware GPS (e.g. emergency call, recalibrate button).
   */
  const requestDeviceGPS = (): Promise<{ lat: number; lng: number; locationName: string } | null> => {
    return new Promise((resolve) => {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        resolve(null);
        return;
      }

      setLocation(prev => ({ ...prev, isLoading: true }));

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          const placeName = await reverseGeocodeNominatim(latitude, longitude);

          const updated: LiveLocation = {
            lat: latitude,
            lng: longitude,
            locationName: placeName,
            isLiveGPS: true,
            accuracyMeters: Math.round(accuracy),
            isLoading: false,
            isPinned: false,
            error: null
          };

          setLocation(updated);

          // Once permission is granted, maintain background live watch
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
          }
          watchIdRef.current = navigator.geolocation.watchPosition(
            async (pos) => {
              const name = await reverseGeocodeNominatim(pos.coords.latitude, pos.coords.longitude);
              setLocation(prev => {
                if (prev.isPinned) return prev;
                return {
                  lat: pos.coords.latitude,
                  lng: pos.coords.longitude,
                  locationName: name,
                  isLiveGPS: true,
                  accuracyMeters: Math.round(pos.coords.accuracy),
                  isLoading: false,
                  isPinned: false,
                  error: null
                };
              });
            },
            (err) => console.warn("Watch GPS error:", err.message),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
          );

          resolve({ lat: latitude, lng: longitude, locationName: placeName });
        },
        (err) => {
          console.warn("Device GPS denied or unavailable:", err.message);
          setLocation(prev => ({
            ...prev,
            isLoading: false,
            error: err.message
          }));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
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

  const resetToDeviceGPS = async (): Promise<boolean> => {
    localStorage.removeItem('crisisweave_user_pin');
    setLocation(prev => ({
      ...prev,
      isPinned: false,
      isLoading: true
    }));
    const result = await requestDeviceGPS();
    return !!result;
  };

  // Zero permission prompts at start: only passive IP lookup or cached pin
  useEffect(() => {
    const savedPin = localStorage.getItem('crisisweave_user_pin');
    if (!savedPin) {
      fetchRealIPLocation();
    }

    return () => {
      if (watchIdRef.current !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...location,
    refreshLocation: fetchRealIPLocation,
    requestDeviceGPS,
    setManualPin,
    resetToDeviceGPS
  };
};
