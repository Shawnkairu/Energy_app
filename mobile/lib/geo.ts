export interface GeoPoint {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6_371_000;

export function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export function distanceMeters(start: GeoPoint, end: GeoPoint) {
  const deltaLat = toRadians(end.latitude - start.latitude);
  const deltaLon = toRadians(end.longitude - start.longitude);
  const startLat = toRadians(start.latitude);
  const endLat = toRadians(end.latitude);

  const haversine =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(startLat) * Math.cos(endLat) * Math.sin(deltaLon / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(haversine));
}

export function polygonAreaSqm(points: readonly GeoPoint[]) {
  if (points.length < 3) {
    return 0;
  }

  const anchor = points[0];
  const projected = points.map((point) => projectPoint(point, anchor));

  const shoelace = projected.reduce((sum, point, index) => {
    const next = projected[(index + 1) % projected.length];
    return sum + point.x * next.y - next.x * point.y;
  }, 0);

  return Math.abs(shoelace) / 2;
}

function projectPoint(point: GeoPoint, anchor: GeoPoint) {
  const lat = toRadians(point.latitude);
  const lon = toRadians(point.longitude);
  const anchorLat = toRadians(anchor.latitude);
  const anchorLon = toRadians(anchor.longitude);

  return {
    x: (lon - anchorLon) * Math.cos((lat + anchorLat) / 2) * EARTH_RADIUS_METERS,
    y: (lat - anchorLat) * EARTH_RADIUS_METERS,
  };
}
