import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';

export default function InstructionsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const activity = getActivityById(id);
    const [currentStep, setCurrentStep] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    // Timer — auto-starts immediately for timed activities (no manual button)
    const totalSeconds =
        activity?.hasTimer && activity.timerMinutes ? activity.timerMinutes * 60 : 0;
    const [timerSeconds, setTimerSeconds] = useState(totalSeconds);
    const [timerRunning, setTimerRunning] = useState(false);
    // Record the wall-clock expiry so the record screen can pick up the same countdown
    const timerExpiresAt = useRef<number>(0);

    // Start the timer as soon as the instructions screen mounts for timed activities
    useEffect(() => {
        if (activity?.hasTimer && totalSeconds > 0) {
            timerExpiresAt.current = Date.now() + totalSeconds * 1000;
            setTimerRunning(true);
        }
    }, []);

    // Countdown tick
    useEffect(() => {
        if (!timerRunning || timerSeconds <= 0) return;
        const interval = setInterval(() => {
            setTimerSeconds((prev) => {
                if (prev <= 1) {
                    setTimerRunning(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timerRunning, timerSeconds]);

    if (!activity) return null;

    const instructions = activity.instructions;
    const step = instructions[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === instructions.length - 1;
    const accentColor =
        activity.category === 'engineering' ? colors.engineering : colors.health;

    const animateTransition = (direction: 'next' | 'back') => {
        Animated.sequence([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            if (direction === 'next') setCurrentStep((p) => p + 1);
            else setCurrentStep((p) => p - 1);
        }, 150);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Instructions',
                    headerStyle: { backgroundColor: colors.surface },
                    headerTintColor: colors.text,
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => {
                                if (router.canGoBack()) router.back();
                                else router.replace(`/activity/${id}`);
                            }}
                            accessibilityLabel="Go back"
                            style={{ paddingHorizontal: 4 }}
                        >
                            <Ionicons name="arrow-back" size={26} color={colors.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push('/help')}
                            accessibilityLabel="Help"
                            style={{ paddingLeft: 1.5, justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Ionicons name="help-circle-outline" size={26} color={colors.text} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                {/* Timer Banner — auto-started, no manual button needed */}
                {activity.hasTimer && (
                    <View style={[styles.timerBanner, { backgroundColor: timerSeconds <= 60 ? '#EF4444' : accentColor }]}>
                        <Ionicons
                            name={timerSeconds <= 60 ? 'alarm-outline' : 'time-outline'}
                            size={16}
                            color="#FFFFFF"
                        />
                        <Text style={styles.timerLabel}>
                            {timerSeconds <= 60 ? 'Time Running Out!' : 'Time Remaining'}
                        </Text>
                        <Text style={styles.timerValue}>{formatTime(timerSeconds)}</Text>
                        {timerSeconds === 0 && (
                            <Text style={styles.timerDoneText}>Time's up — submit your results.</Text>
                        )}
                    </View>
                )}

                {/* Progress Indicator */}
                <View style={styles.progressContainer}>
                    {instructions.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.progressDot,
                                {
                                    backgroundColor:
                                        i === currentStep
                                            ? accentColor
                                            : i < currentStep
                                                ? accentColor + '60'
                                                : colors.backgroundElement,
                                },
                            ]}
                        />
                    ))}
                </View>

                {/* Step Card */}
                <View style={styles.stepCardContainer}>
                    <Animated.View
                        style={[
                            styles.stepCard,
                            {
                                backgroundColor: colors.surface,
                                opacity: fadeAnim,
                            },
                            Shadows.md,
                        ]}
                    >
                        <View style={[styles.stepNumber, { backgroundColor: accentColor }]}>
                            <Text style={styles.stepNumberText}>
                                Step {step.step}
                            </Text>
                        </View>

                        <Text style={[styles.stepText, { color: colors.text }]}>
                            {step.text}
                        </Text>

                        {/* Sensor Activation Button */}
                        {step.requiresSensor && (
                            <TouchableOpacity
                                style={[
                                    styles.sensorButton,
                                    { backgroundColor: colors.primary },
                                    Shadows.md,
                                ]}
                                onPress={() => {
                                    // Navigate to data recording
                                    router.push(timerExpiresAt.current > 0 ? `/activity/${id}/record?expiresAt=${timerExpiresAt.current}` : `/activity/${id}/record`);
                                }}
                                accessibilityLabel={step.sensorLabel || 'Activate sensor'}
                                accessibilityRole="button"
                            >
                                <Text style={styles.sensorIcon}>📡</Text>
                                <Text style={styles.sensorButtonText}>
                                    {step.sensorLabel || 'Activate Sensor'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </View>

                {/* Navigation Buttons */}
                <View style={[styles.navBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[
                            styles.navButton,
                            styles.backButton,
                            {
                                borderColor: colors.border,
                                opacity: isFirst ? 0.4 : 1,
                            },
                        ]}
                        onPress={() => !isFirst && animateTransition('back')}
                        disabled={isFirst}
                        accessibilityLabel="Previous step"
                    >
                        <Text style={[styles.navButtonText, { color: colors.text }]}>
                            ← Back
                        </Text>
                    </TouchableOpacity>

                    <Text style={[styles.stepCounter, { color: colors.textSecondary }]}>
                        {currentStep + 1} / {instructions.length}
                    </Text>

                    {isLast ? (
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                styles.finishButton,
                                { backgroundColor: colors.primary },
                                Shadows.md,
                            ]}
                            onPress={() => router.push(timerExpiresAt.current > 0 ? `/activity/${id}/record?expiresAt=${timerExpiresAt.current}` : `/activity/${id}/record`)}
                            accessibilityLabel="Start recording data"
                        >
                            <Text style={[styles.navButtonText, { color: colors.onPrimary }]}>
                                Record Data →
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[
                                styles.navButton,
                                styles.nextButton,
                                { backgroundColor: accentColor },
                            ]}
                            onPress={() => animateTransition('next')}
                            accessibilityLabel="Next step"
                        >
                            <Text style={[styles.navButtonText, { color: '#FFFFFF' }]}>
                                Next →
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    timerBanner: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    timerLabel: { color: '#FFFFFF', fontSize: Typography.bodyMedium.fontSize },
    timerValue: {
        color: '#FFFFFF',
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '700',
    },
    timerDoneText: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: Typography.labelSmall.fontSize,
        fontWeight: '600',
        marginTop: 2,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.lg,
    },
    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    stepCardContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    stepCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
    },
    stepNumber: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.xl,
    },
    stepNumberText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    stepText: {
        fontSize: Typography.bodyLarge.fontSize,
        lineHeight: 28,
        textAlign: 'center',
    },
    sensorButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.lg,
        marginTop: Spacing.xxl,
        gap: Spacing.sm,
    },
    sensorIcon: { fontSize: 20 },
    sensorButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    navBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
        borderTopWidth: StyleSheet.hairlineWidth,
    },
    navButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    backButton: {
        borderWidth: 1,
    },
    nextButton: {},
    finishButton: {},
    navButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    stepCounter: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '500',
    },
});
