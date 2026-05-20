import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { authErrorMessage } from '@/services/firebase';

export default function SignupScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        if (!email.trim()) {
            Alert.alert('Missing Email', 'Please enter an email for your team account.');
            return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            Alert.alert('Invalid Email', 'Please enter a valid email address.');
            return false;
        }
        if (password.length < 6) {
            Alert.alert('Password Too Short', 'Password must be at least 6 characters long.');
            return false;
        }
        if (password !== confirmPassword) {
            Alert.alert('Passwords Don\'t Match', 'Please make sure both passwords are the same.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await signUp(email, password);
            // Splash sees no team profile yet → routes to /register
            router.replace('/');
        } catch (err) {
            Alert.alert('Signup Failed', authErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const strengthHint = (): { text: string; color: string } | null => {
        if (password.length === 0) return null;
        if (password.length < 6) return { text: 'Weak — too short', color: '#EF4444' };
        if (password.length < 10) return { text: 'OK', color: '#F59E0B' };
        return { text: 'Strong', color: '#10B981' };
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.headerIconWrap, { backgroundColor: colors.primary + '15' }]}>
                            <Ionicons name="person-add-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Create Team Account
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            One login per team — share with your teammates so you can pick up
                            where you left off on any device.
                        </Text>
                    </View>

                    {/* Form */}
                    <View
                        style={[
                            styles.formCard,
                            { backgroundColor: colors.surface },
                            Shadows.md,
                        ]}
                    >
                        {/* Email */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Team Email <Text style={{ color: colors.error }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                placeholder="team@example.com"
                                placeholderTextColor={colors.textSecondary}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                                autoComplete="email"
                                accessibilityLabel="Team email"
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Password <Text style={{ color: colors.error }}>*</Text>
                            </Text>
                            <Text style={[styles.hint, { color: colors.textSecondary }]}>
                                Minimum 6 characters
                            </Text>
                            <View style={styles.passwordRow}>
                                <TextInput
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        {
                                            backgroundColor: colors.backgroundElement,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    placeholder="Choose a strong password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="new-password"
                                    accessibilityLabel="Password"
                                />
                                <TouchableOpacity
                                    style={[
                                        styles.toggleEye,
                                        { backgroundColor: colors.backgroundElement },
                                    ]}
                                    onPress={() => setShowPassword((v) => !v)}
                                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={20}
                                        color={colors.textSecondary}
                                    />
                                </TouchableOpacity>
                            </View>
                            {strengthHint() ? (
                                <Text style={[styles.strengthText, { color: strengthHint()!.color }]}>
                                    {strengthHint()!.text}
                                </Text>
                            ) : null}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Confirm Password <Text style={{ color: colors.error }}>*</Text>
                            </Text>
                            <TextInput
                                style={[
                                    styles.input,
                                    {
                                        backgroundColor: colors.backgroundElement,
                                        color: colors.text,
                                        borderColor: colors.border,
                                    },
                                ]}
                                placeholder="Re-enter password"
                                placeholderTextColor={colors.textSecondary}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                autoCorrect={false}
                                accessibilityLabel="Confirm password"
                            />
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        accessibilityLabel="Create account"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.submitText, { color: colors.onPrimary }]}>
                            {isSubmitting ? 'Creating Account…' : 'Create Account'}
                        </Text>
                        {!isSubmitting && (
                            <Ionicons
                                name="arrow-forward"
                                size={20}
                                color={colors.onPrimary}
                                style={{ marginLeft: Spacing.xs }}
                            />
                        )}
                    </TouchableOpacity>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Already have a team account?{' '}
                        </Text>
                        <Link href="/login" replace asChild>
                            <TouchableOpacity>
                                <Text style={[styles.footerLink, { color: colors.primary }]}>
                                    Log in
                                </Text>
                            </TouchableOpacity>
                        </Link>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: { padding: Spacing.xl, paddingBottom: Spacing.xxxxl },
    header: { alignItems: 'center', marginBottom: Spacing.xxl, marginTop: Spacing.lg },
    headerIconWrap: {
        width: 64,
        height: 64,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.headlineLarge.fontSize,
        fontWeight: Typography.headlineLarge.fontWeight,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: Typography.bodyMedium.fontSize,
        marginTop: Spacing.xs,
        textAlign: 'center',
        lineHeight: 20,
    },
    formCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
    },
    field: { marginBottom: Spacing.xl },
    label: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: Typography.labelLarge.fontWeight,
        marginBottom: Spacing.sm,
    },
    hint: {
        fontSize: Typography.bodySmall.fontSize,
        marginBottom: Spacing.xs,
    },
    input: {
        height: 48,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.bodyLarge.fontSize,
    },
    passwordRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    passwordInput: { flex: 1 },
    toggleEye: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    strengthText: {
        fontSize: Typography.labelSmall.fontSize,
        marginTop: Spacing.xs,
        textAlign: 'right',
    },
    submitButton: {
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        ...Shadows.md,
    },
    submitText: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    footerText: { fontSize: Typography.bodyMedium.fontSize },
    footerLink: { fontSize: Typography.bodyMedium.fontSize, fontWeight: '700' },
});
