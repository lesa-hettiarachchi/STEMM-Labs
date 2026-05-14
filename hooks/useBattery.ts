/**
 * Battery level and charging state hook using expo-battery.
 */

import * as Battery from 'expo-battery';
import { useEffect, useState } from 'react';

export interface BatteryInfo {
    level: number | null;      // 0.0–1.0, null while loading
    isCharging: boolean;
    isLoaded: boolean;
}

export function useBattery(): BatteryInfo {
    const [info, setInfo] = useState<BatteryInfo>({
        level: null,
        isCharging: false,
        isLoaded: false,
    });

    useEffect(() => {
        let mounted = true;

        Promise.all([
            Battery.getBatteryLevelAsync(),
            Battery.getBatteryStateAsync(),
        ]).then(([level, state]) => {
            if (!mounted) return;
            setInfo({
                level,
                isCharging: state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL,
                isLoaded: true,
            });
        }).catch(() => {
            if (mounted) setInfo({ level: null, isCharging: false, isLoaded: true });
        });

        const levelSub = Battery.addBatteryLevelListener(({ batteryLevel }) => {
            if (mounted) setInfo((prev) => ({ ...prev, level: batteryLevel }));
        });

        const stateSub = Battery.addBatteryStateListener(({ batteryState }) => {
            if (mounted) setInfo((prev) => ({
                ...prev,
                isCharging: batteryState === Battery.BatteryState.CHARGING || batteryState === Battery.BatteryState.FULL,
            }));
        });

        return () => {
            mounted = false;
            levelSub.remove();
            stateSub.remove();
        };
    }, []);

    return info;
}

export function batteryIcon(level: number | null, isCharging: boolean): string {
    if (level === null) return '🔋';
    if (isCharging) return '⚡';
    if (level > 0.75) return '🔋';
    if (level > 0.4) return '🪫';
    return '🔴';
}

export function batteryColor(level: number | null): string {
    if (level === null) return '#9CA3AF';
    if (level > 0.5) return '#10B981';
    if (level > 0.2) return '#F59E0B';
    return '#EF4444';
}
