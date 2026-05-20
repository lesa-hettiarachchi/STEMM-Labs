import {
    AppSettings,
    getSettings,
    saveSettings,
} from '@/services/storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

interface SettingsContextValue {
    themeMode: 'system' | 'light' | 'dark';
    textSizeMultiplier: number;
    resolvedTheme: 'light' | 'dark';
    setThemeMode: (mode: 'system' | 'light' | 'dark') => void;
    setTextSizeMultiplier: (multiplier: number) => void;
    isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextValue>({
    themeMode: 'system',
    textSizeMultiplier: 1.0,
    resolvedTheme: 'light',
    setThemeMode: () => { },
    setTextSizeMultiplier: () => { },
    isLoading: true,
});

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const systemScheme = useColorScheme();
    const [settings, setSettingsState] = useState<AppSettings>({
        themeMode: 'system',
        textSizeMultiplier: 1.0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getSettings().then((s) => {
            setSettingsState(s);
            setIsLoading(false);
        });
    }, []);

    const resolvedTheme: 'light' | 'dark' =
        settings.themeMode === 'system'
            ? systemScheme === 'dark'
                ? 'dark'
                : 'light'
            : settings.themeMode;

    const updateSettings = (partial: Partial<AppSettings>) => {
        const next = { ...settings, ...partial };
        setSettingsState(next);
        saveSettings(next);
    };

    return (
        <SettingsContext.Provider
            value={{
                themeMode: settings.themeMode,
                textSizeMultiplier: settings.textSizeMultiplier,
                resolvedTheme,
                setThemeMode: (mode) => updateSettings({ themeMode: mode }),
                setTextSizeMultiplier: (m) => updateSettings({ textSizeMultiplier: m }),
                isLoading,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    return useContext(SettingsContext);
}

export function useThemeColors() {
    const { resolvedTheme } = useSettings();
    const { Colors } = require('@/constants/theme');
    return Colors[resolvedTheme];
}
