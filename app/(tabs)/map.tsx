/**
 * Map Screen — GPS + Maps Tab
 * Shows the team's current location on an interactive map.
 */

import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';

interface Coords {
    latitude: number;
    longitude: number;
}

export default function MapScreen() {
    const { resolvedTheme } = useSettings();
    const { team } = useTeam();
    const colors = Colors[resolvedTheme];
    const mapRef = useRef<MapView>(null);

    const [coords, setCoords] = useState<Coords | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg(
                    'Location permission denied.\nEnable it in Settings to use the map.'
                );
                setIsLoading(false);
                return;
            }
            try {
                const location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                });
                setCoords({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });
            } catch {
                setErrorMsg('Could not get location. Try again.');
            }
            setIsLoading(false);
        })();
    }, []);

    const recenter = () => {
        if (mapRef.current && coords) {
            mapRef.current.animateToRegion({
                ...coords,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
            }, 600);
        }
    };

    if (isLoading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Getting your location…
                </Text>
            </View>
        );
    }

    if (errorMsg || !coords) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}>
                <Text style={styles.errorIcon}>📍</Text>
                <Text style={[styles.errorText, { color: colors.error }]}>
                    {errorMsg ?? 'Location unavailable.'}
                </Text>
            </View>
        );
    }

    const region = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_DEFAULT}
                initialRegion={region}
                showsUserLocation
                showsMyLocationButton={false}
                showsCompass
                showsScale
            >
                <Marker
                    coordinate={coords}
                    title={team?.name ?? 'Your Team'}
                    description={team?.schoolName ?? 'STEMM Labs Activity Site'}
                    pinColor={colors.primary}
                />
            </MapView>

            {/* Re-center button */}
            <TouchableOpacity
                style={[styles.recenterBtn, { backgroundColor: colors.surface }, Shadows.md]}
                onPress={recenter}
                accessibilityLabel="Re-centre map on current location"
            >
                <Text style={{ fontSize: 20 }}>🎯</Text>
            </TouchableOpacity>

            {/* Info card */}
            <View style={[styles.infoCard, { backgroundColor: colors.surface }, Shadows.lg]}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                    📍 {team?.schoolName ?? 'Your Location'}
                </Text>
                <Text style={[styles.coords, { color: colors.textSecondary }]}>
                    {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                </Text>
                {team && (
                    <Text style={[styles.teamLabel, { color: colors.primary }]}>
                        Team: {team.name} · {team.gradeLevel}
                    </Text>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xxl,
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: Typography.bodyMedium.fontSize,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    errorText: {
        fontSize: Typography.bodyLarge.fontSize,
        textAlign: 'center',
        lineHeight: 24,
    },
    recenterBtn: {
        position: 'absolute',
        top: Spacing.lg,
        right: Spacing.lg,
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoCard: {
        position: 'absolute',
        bottom: Spacing.xxl,
        left: Spacing.lg,
        right: Spacing.lg,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
    },
    infoTitle: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '600',
        marginBottom: Spacing.xxs,
    },
    coords: {
        fontSize: Typography.bodySmall.fontSize,
        fontFamily: 'monospace',
        marginBottom: Spacing.xs,
    },
    teamLabel: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
    },
});
