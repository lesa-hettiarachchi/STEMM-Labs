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
import { authErrorMessage, sendPasswordReset } from '@/services/firebase';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = (): boolean => {
        if (!email.trim()) {
            Alert.alert('Missing Email', 'Please enter your team\'s email address.');
            return false;
        }
        if (!password) {
            Alert.alert('Missing Password', 'Please enter your password.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            await signIn(email, password);
            // Splash will route to either /(tabs) or /register based on team profile
            router.replace('/');
        } catch (err) {
            Alert.alert('Login Failed', authErrorMessage(err));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email.trim()) {
            Alert.alert(
                'Email Required',
                'Type your team\'s email above first, then tap "Forgot password" again.'
            );
            return;
        }
        try {
            await sendPasswordReset(email);
            Alert.alert(
                'Reset Email Sent',
                `If an account exists for ${email.trim()}, a password reset link has been sent.`
            );
        } catch (err) {
            Alert.alert('Could Not Send', authErrorMessage(err));
        }
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
                            <Ionicons name="flask-outline" size={32} color={colors.primary} />
                        </View>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Log in to your STEMM Labs team account
                        </Text>
                    </View>

                    {/* Form Card */}
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
                                testID="login-email"
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
                            <View style={styles.passwordRow}>
                                <TextInput
                                    testID="login-password"
                                    style={[
                                        styles.input,
                                        styles.passwordInput,
                                        {
                                            backgroundColor: colors.backgroundElement,
                                            color: colors.text,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                    placeholder="Enter your password"
                                    placeholderTextColor={colors.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    autoComplete="password"
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

                            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotBtn}>
                                <Text style={[styles.forgotText, { color: colors.primary }]}>
                                    Forgot password?
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        testID="login-submit"
                        style={[
                            styles.submitButton,
                            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.6 : 1 },
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        accessibilityLabel="Log in"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.submitText, { color: colors.onPrimary }]}>
                            {isSubmitting ? 'Logging in…' : 'Log In'}
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

                    {/* Footer — link to signup */}
                    <View style={styles.footer}>
                        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                            Don't have a team account?{' '}
                        </Text>
                        <Link href="/signup" replace asChild>
                            <TouchableOpacity>
                                <Text style={[styles.footerLink, { color: colors.primary }]}>
                                    Sign up
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
        fontSize: Typography.bodyLarge.fontSize,
        marginTop: Spacing.xs,
        textAlign: 'center',
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
    input: {
        height: 48,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.bodyLarge.fontSize,
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    passwordInput: { flex: 1 },
    toggleEye: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    forgotBtn: { marginTop: Spacing.sm, alignSelf: 'flex-end' },
    forgotText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
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
