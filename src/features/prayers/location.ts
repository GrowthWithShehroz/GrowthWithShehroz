import * as Location from 'expo-location';

import type { Coords } from '@/types';

export async function requestAndGetLocation(): Promise<{
  coords: Coords;
  label?: string;
} | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    const coords: Coords = {
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
    };
    let label: string | undefined;
    try {
      const places = await Location.reverseGeocodeAsync(coords);
      const place = places[0];
      if (place) {
        label = [place.city, place.region, place.country].filter(Boolean).join(', ');
      }
    } catch {
      /* reverse geocoding is optional */
    }
    return { coords, label };
  } catch (e) {
    if (__DEV__) console.warn('[location] failed', e);
    return null;
  }
}

export function distanceKm(a: Coords, b: Coords): number {
  const R = 6371;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
