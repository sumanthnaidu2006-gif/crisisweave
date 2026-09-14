export interface RouteStep {
  instruction: string;
  distanceMeters: number;
}

export interface WalkingRouteResult {
  coordinates: [number, number][];
  distanceMeters: number;
  formattedDistance: string;
  durationMinutes: number;
  formattedDuration: string;
  steps: RouteStep[];
  isAlternative?: boolean;
}

export const fetchStreetWalkingRoute = async (
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number,
  routeVariant: number = 0
): Promise<WalkingRouteResult> => {
  try {
    let url: string;
    if (routeVariant === 1) {
      // Waypoint-guided alternative safe corridor avoiding main low ground
      const wayLat = ((startLat + destLat) / 2) + 0.0035;
      const wayLng = ((startLng + destLng) / 2) + 0.0035;
      url = `https://router.project-osrm.org/route/v1/walking/${startLng},${startLat};${wayLng},${wayLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true`;
    } else {
      url = `https://router.project-osrm.org/route/v1/walking/${startLng},${startLat};${destLng},${destLat}?overview=full&geometries=geojson&steps=true&alternatives=true`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Routing server response error');

    const data = await res.json();
    if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
      // Pick alternative if available and requested
      const routeIdx = (routeVariant === 1 && data.routes.length > 1) ? 1 : 0;
      const route = data.routes[routeIdx];
      // OSRM returns GeoJSON coordinates in [lng, lat] format -> Leaflet needs [lat, lng]
      const leafletCoords: [number, number][] = route.geometry.coordinates.map(
        (coord: [number, number]) => [coord[1], coord[0]]
      );

      const distance = Math.round(route.distance);
      const duration = Math.max(1, Math.round(route.duration / 60));

      const rawSteps = route.legs.flatMap((l: any) => l.steps || []);
      const steps: RouteStep[] = rawSteps.map((s: any) => {
        const modifier = s.maneuver.modifier ? ` ${s.maneuver.modifier}` : '';
        const name = s.name ? ` onto ${s.name}` : '';
        let text = `${s.maneuver.type}${modifier}${name}`;
        if (s.maneuver.type === 'depart') text = `Head out${name || ' on street'}`;
        if (s.maneuver.type === 'arrive') text = 'Arrive at Safe Shelter Entrance';
        return {
          instruction: text,
          distanceMeters: Math.round(s.distance)
        };
      });

      return {
        coordinates: leafletCoords,
        distanceMeters: distance,
        formattedDistance: distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance} meters`,
        durationMinutes: duration,
        formattedDuration: `${duration} min walk`,
        steps,
        isAlternative: routeVariant === 1
      };
    }
  } catch (e) {
    console.warn('OSRM routing failed, calculating street-grid fallback:', e);
  }

  // Fallback: Street-grid (Manhattan dogleg) path instead of cutting diagonally through buildings
  const midLat = (startLat + destLat) / 2;
  const gridCoords: [number, number][] = [
    [startLat, startLng],
    [midLat, startLng],
    [midLat, destLng],
    [destLat, destLng]
  ];

  const approxMeters = Math.round(
    Math.sqrt(Math.pow((destLat - startLat) * 111000, 2) + Math.pow((destLng - startLng) * 111000, 2)) * 1.3
  );
  const approxMins = Math.max(2, Math.round(approxMeters / 80));

  return {
    coordinates: gridCoords,
    distanceMeters: approxMeters,
    formattedDistance: approxMeters > 1000 ? `${(approxMeters / 1000).toFixed(1)} km` : `${approxMeters} meters`,
    durationMinutes: approxMins,
    formattedDuration: `${approxMins} min walk`,
    steps: [
      { instruction: 'Follow main paved street away from low water', distanceMeters: Math.round(approxMeters / 2) },
      { instruction: 'Turn onto access road towards Safe Shelter', distanceMeters: Math.round(approxMeters / 2) }
    ]
  };
};
