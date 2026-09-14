import { useState, useEffect } from 'react';

export interface LiveWeather {
  temperature: number | null;
  formattedTemp: string;
  condition: string;
  windSpeed: string;
  humidity: string;
  precipitation: string;
  isLoading: boolean;
}

const getWeatherDescription = (code: number): string => {
  if (code === 0) return 'Clear Sky ☀️';
  if (code >= 1 && code <= 3) return 'Partly Cloudy ⛅';
  if (code >= 45 && code <= 48) return 'Foggy 🌫️';
  if (code >= 51 && code <= 55) return 'Light Drizzle 🌦️';
  if (code >= 61 && code <= 65) return 'Rain 🌧️';
  if (code >= 66 && code <= 67) return 'Freezing Rain 🌨️';
  if (code >= 71 && code <= 77) return 'Snow ❄️';
  if (code >= 80 && code <= 82) return 'Heavy Showers 🌧️';
  if (code >= 95 && code <= 99) return 'Thunderstorm ⛈️';
  return 'Fair Weather 🌤️';
};

export const useLiveWeather = (lat: number, lng: number): LiveWeather => {
  const [weather, setWeather] = useState<LiveWeather>({
    temperature: null,
    formattedTemp: 'Loading...',
    condition: 'Checking weather...',
    windSpeed: '-- km/h',
    humidity: '-- %',
    precipitation: '0 mm',
    isLoading: true
  });

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation`
        );
        if (!res.ok) throw new Error('Weather API error');

        const data = await res.json();
        const current = data.current;
        const temp = Math.round(current.temperature_2m);
        const conditionText = getWeatherDescription(current.weather_code);

        if (isMounted) {
          setWeather({
            temperature: temp,
            formattedTemp: `${temp}°C`,
            condition: conditionText,
            windSpeed: `${Math.round(current.wind_speed_10m)} km/h`,
            humidity: `${current.relative_humidity_2m}%`,
            precipitation: `${current.precipitation || 0} mm`,
            isLoading: false
          });
        }
      } catch (e) {
        console.warn('Weather fetch failed, falling back to ambient estimate:', e);
        if (isMounted) {
          setWeather({
            temperature: 29,
            formattedTemp: '29°C',
            condition: 'Clear Sky ☀️',
            windSpeed: '12 km/h',
            humidity: '60%',
            precipitation: '0 mm',
            isLoading: false
          });
        }
      }
    };

    fetchWeather();
    // Refresh weather every 10 minutes
    const interval = setInterval(fetchWeather, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [lat, lng]);

  return weather;
};
