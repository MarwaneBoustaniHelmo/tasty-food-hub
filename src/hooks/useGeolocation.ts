import { useState, useCallback, useEffect } from "react";
import { restaurantsMenu } from "@/data/menuData";

// Restaurant coordinates for Liège area
export const restaurantCoordinates: Record<string, { lat: number; lon: number }> = {
  seraing: { lat: 50.6089, lon: 5.5074 },      // Jemeppe-sur-Meuse
  angleur: { lat: 50.6111, lon: 5.5925 },      // Angleur
  wandre: { lat: 50.6583, lon: 5.6328 },       // Wandre
  "saint-gilles": { lat: 50.6394, lon: 5.5697 } // Saint-Gilles Liège
};

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  position: { lat: number; lon: number } | null;
  nearestRestaurant: string | null;
  distances: Record<string, number>;
  permissionDenied: boolean;
}

/**
 * Haversine formula to calculate distance between two points on Earth
 * @returns distance in kilometers
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
};

/**
 * Find the nearest restaurant from user's position
 */
const findNearestRestaurant = (
  userLat: number,
  userLon: number
): { nearestId: string; distances: Record<string, number> } => {
  const distances: Record<string, number> = {};
  let nearestId = "";
  let minDistance = Infinity;

  for (const [id, coords] of Object.entries(restaurantCoordinates)) {
    const distance = calculateHaversineDistance(userLat, userLon, coords.lat, coords.lon);
    distances[id] = Math.round(distance * 10) / 10; // Round to 1 decimal

    if (distance < minDistance) {
      minDistance = distance;
      nearestId = id;
    }
  }

  return { nearestId, distances };
};

/**
 * Custom hook for geolocation and nearest restaurant detection
 */
export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
    nearestRestaurant: null,
    distances: {},
    permissionDenied: false
  });

  // Check if geolocation is supported
  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator;

  // Request geolocation
  const requestLocation = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: "La géolocalisation n'est pas supportée par votre navigateur.",
        loading: false
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const { nearestId, distances } = findNearestRestaurant(latitude, longitude);

        setState({
          loading: false,
          error: null,
          position: { lat: latitude, lon: longitude },
          nearestRestaurant: nearestId,
          distances,
          permissionDenied: false
        });
      },
      (error) => {
        let errorMessage = "Impossible de récupérer votre position.";
        let permissionDenied = false;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Vous avez refusé la géolocalisation.";
            permissionDenied = true;
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé.";
            break;
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
          permissionDenied
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000 // Cache position for 5 minutes
      }
    );
  }, [isSupported]);

  // Clear geolocation state
  const clearLocation = useCallback(() => {
    setState({
      loading: false,
      error: null,
      position: null,
      nearestRestaurant: null,
      distances: {},
      permissionDenied: false
    });
  }, []);

  // Get restaurant info with distance
  const getRestaurantWithDistance = useCallback((restaurantId: string) => {
    const restaurant = restaurantsMenu.find(r => r.id === restaurantId);
    const distance = state.distances[restaurantId];
    return restaurant ? { ...restaurant, distance } : null;
  }, [state.distances]);

  return {
    ...state,
    isSupported,
    requestLocation,
    clearLocation,
    getRestaurantWithDistance
  };
};

export default useGeolocation;
