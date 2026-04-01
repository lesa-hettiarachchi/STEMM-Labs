import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

export interface ThemedTextProps extends TextProps {}

export function ThemedText({ style, ...rest }: ThemedTextProps) {
    const { textSizeMultiplier } = useSettings();

    const flattenedStyle = StyleSheet.flatten(style) || {};
    const originalFontSize = flattenedStyle.fontSize || 16;
    const scaledFontSize = originalFontSize * textSizeMultiplier;

    return (
        <Text 
            style={[style, { fontSize: Math.round(scaledFontSize) }]} 
            {...rest} 
        />
    );
}
