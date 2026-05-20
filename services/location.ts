import * as Location from 'expo-location';

export interface GpsCoordinates {
    latitude: number;
    longitude: number;
}

const GPS_TIMEOUT_MS = 4000;

export async function requestLocationPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
}

export async function getCurrentLocation(): Promise<GpsCoordinates | null> {
    try {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;

        // Race the GPS lock against a 4-second timeout — return null if slow
        const locationPromise = Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });
        const timeoutPromise = new Promise<null>((resolve) =>
            setTimeout(() => resolve(null), GPS_TIMEOUT_MS)
        );

        const location = await Promise.race([locationPromise, timeoutPromise]);

        if (!location || !('coords' in location)) {
            console.warn('GPS lock timed out — saving without coordinates');
            return null;
        }

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    } catch (error) {
        console.warn('Failed to get location:', error);
        return null;
    }
}
