/**
 * Team Registration Screen (Screen 2)
 * First-launch only — team name, members, grade, school
 */

import { useRouter } from 'expo-router';
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
import type { Team, TeamMember } from '@/constants/types';
import { useSettings } from '@/contexts/SettingsContext';
import { useTeam } from '@/contexts/TeamContext';
import { createTeam } from '@/services/firestore';

const GRADE_OPTIONS = ['Year 5', 'Year 6', 'Year 7', 'Year 8', 'Year 9'];

function generateDiscriminator(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

export default function RegisterScreen() {
    const router = useRouter();
    const { setTeam } = useTeam();
    const { resolvedTheme } = useSettings();
    const colors = Colors[resolvedTheme];

    const [teamName, setTeamName] = useState('');
    const [schoolName, setSchoolName] = useState('');
    const [gradeLevel, setGradeLevel] = useState('Year 7');
    const [members, setMembers] = useState<string[]>(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addMember = () => {
        if (members.length < 6) {
            setMembers([...members, '']);
        }
    };

    const removeMember = (index: number) => {
        if (members.length > 1) {
            setMembers(members.filter((_, i) => i !== index));
        }
    };

    const updateMember = (index: number, name: string) => {
        const updated = [...members];
        updated[index] = name;
        setMembers(updated);
    };

    const validate = (): boolean => {
        if (!teamName.trim()) {
            Alert.alert('Missing Team Name', 'Please enter a team name.');
            return false;
        }
        const validMembers = members.filter((m) => m.trim());
        if (validMembers.length === 0) {
            Alert.alert(
                'Missing Members',
                'Please enter at least one team member\'s first name.'
            );
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const teamMembers: TeamMember[] = members
                .filter((m) => m.trim())
                .map((firstName) => ({
                    id: generateId(),
                    firstName: firstName.trim(),
                }));

            const team: Team = {
                id: generateId(),
                name: teamName.trim(),
                discriminator: generateDiscriminator(),
                gradeLevel,
                schoolName: schoolName.trim() || undefined,
                members: teamMembers,
                createdAt: Date.now(),
            };

            await setTeam(team);

            // Also save to Firestore (non-blocking)
            createTeam(team).catch((err: any) =>
                console.warn('Failed to sync team to cloud:', err)
            );

            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Error', 'Failed to save team. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerEmoji}>🔬</Text>
                        <Text style={[styles.title, { color: colors.text }]}>
                            Welcome to STEMM Lab
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                            Register your team to get started
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
                        {/* Team Name */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Team Name <Text style={{ color: colors.error }}>*</Text>
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
                                placeholder="Enter your team name"
                                placeholderTextColor={colors.textSecondary}
                                value={teamName}
                                onChangeText={setTeamName}
                                accessibilityLabel="Team name"
                            />
                        </View>

                        {/* Grade Level */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Grade / Year Level
                            </Text>
                            <View style={styles.gradeRow}>
                                {GRADE_OPTIONS.map((grade) => (
                                    <TouchableOpacity
                                        key={grade}
                                        style={[
                                            styles.gradeChip,
                                            {
                                                backgroundColor:
                                                    gradeLevel === grade
                                                        ? colors.primary
                                                        : colors.backgroundElement,
                                                borderColor:
                                                    gradeLevel === grade
                                                        ? colors.primary
                                                        : colors.border,
                                            },
                                        ]}
                                        onPress={() => setGradeLevel(grade)}
                                        accessibilityLabel={`Select ${grade}`}
                                        accessibilityRole="button"
                                    >
                                        <Text
                                            style={[
                                                styles.gradeChipText,
                                                {
                                                    color:
                                                        gradeLevel === grade
                                                            ? colors.onPrimary
                                                            : colors.text,
                                                },
                                            ]}
                                        >
                                            {grade}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* School Name */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                School Name{' '}
                                <Text style={{ color: colors.textSecondary, fontWeight: '400' }}>
                                    (optional)
                                </Text>
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
                                placeholder="Enter your school name"
                                placeholderTextColor={colors.textSecondary}
                                value={schoolName}
                                onChangeText={setSchoolName}
                                accessibilityLabel="School name"
                            />
                        </View>

                        {/* Team Members */}
                        <View style={styles.field}>
                            <Text style={[styles.label, { color: colors.text }]}>
                                Team Members <Text style={{ color: colors.error }}>*</Text>
                            </Text>
                            <Text
                                style={[styles.hint, { color: colors.textSecondary }]}
                            >
                                Enter first names (1–6 members)
                            </Text>
                            {members.map((name, index) => (
                                <View key={index} style={styles.memberRow}>
                                    <TextInput
                                        style={[
                                            styles.input,
                                            styles.memberInput,
                                            {
                                                backgroundColor: colors.backgroundElement,
                                                color: colors.text,
                                                borderColor: colors.border,
                                            },
                                        ]}
                                        placeholder={`Member ${index + 1} first name`}
                                        placeholderTextColor={colors.textSecondary}
                                        value={name}
                                        onChangeText={(text) => updateMember(index, text)}
                                        accessibilityLabel={`Team member ${index + 1} name`}
                                    />
                                    {members.length > 1 && (
                                        <TouchableOpacity
                                            style={[
                                                styles.removeButton,
                                                { backgroundColor: colors.error + '15' },
                                            ]}
                                            onPress={() => removeMember(index)}
                                            accessibilityLabel={`Remove member ${index + 1}`}
                                        >
                                            <Text style={{ color: colors.error, fontSize: 18 }}>
                                                ✕
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            {members.length < 6 && (
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        { borderColor: colors.primary },
                                    ]}
                                    onPress={addMember}
                                    accessibilityLabel="Add team member"
                                    accessibilityRole="button"
                                >
                                    <Text style={[styles.addButtonText, { color: colors.primary }]}>
                                        + Add Member
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[
                            styles.submitButton,
                            {
                                backgroundColor: colors.primary,
                                opacity: isSubmitting ? 0.6 : 1,
                            },
                        ]}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        accessibilityLabel="Complete registration"
                        accessibilityRole="button"
                    >
                        <Text style={[styles.submitText, { color: colors.onPrimary }]}>
                            {isSubmitting ? 'Creating Team...' : 'Start Exploring! 🚀'}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    flex: { flex: 1 },
    scrollContent: {
        padding: Spacing.xl,
        paddingBottom: Spacing.xxxxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        marginTop: Spacing.lg,
    },
    headerEmoji: { fontSize: 48, marginBottom: Spacing.md },
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
    field: {
        marginBottom: Spacing.xl,
    },
    label: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: Typography.labelLarge.fontWeight,
        marginBottom: Spacing.sm,
    },
    hint: {
        fontSize: Typography.bodyMedium.fontSize,
        marginBottom: Spacing.sm,
    },
    input: {
        height: 48,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        paddingHorizontal: Spacing.lg,
        fontSize: Typography.bodyLarge.fontSize,
    },
    gradeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    gradeChip: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    gradeChipText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
    },
    memberRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    memberInput: {
        flex: 1,
    },
    removeButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    addButton: {
        height: 44,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    addButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    submitButton: {
        height: 56,
        borderRadius: BorderRadius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        ...Shadows.md,
    },
    submitText: {
        fontSize: Typography.titleMedium.fontSize,
        fontWeight: '700',
    },
});
