import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getActivityById } from '@/constants/activities';
import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants/theme';
import { useSettings } from '@/context/SettingsContext';
import { useTeam } from '@/context/TeamContext';
import { storage } from '@/services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function CameraScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { resolvedTheme } = useSettings();
    const { team } = useTeam();
    const colors = Colors[resolvedTheme];
    const activity = getActivityById(id);

    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    const accentColor =
        activity?.category === 'engineering'
            ? colors.engineering
            : colors.health;

    const handleRecordVideo = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Camera permission is required to record video.');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['videos'],
            videoMaxDuration: 120, // 2 min max
            videoQuality: ImagePicker.UIImagePickerControllerQualityType.Medium,
        });

        if (!result.canceled && result.assets[0]) {
            setVideoUri(result.assets[0].uri);
            setDownloadUrl(null);
        }
    };

    const handlePickVideo = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Media library permission is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['videos'],
            videoMaxDuration: 120,
        });

        if (!result.canceled && result.assets[0]) {
            setVideoUri(result.assets[0].uri);
            setDownloadUrl(null);
        }
    };

    const handleUpload = async () => {
        if (!videoUri || !team) {
            Alert.alert('Error', 'No video selected or team not registered.');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const response = await fetch(videoUri);
            const blob = await response.blob();

            const filename = `videos/${team.id}/${id}/${Date.now()}.mp4`;
            const storageRef = ref(storage, filename);
            const uploadTask = uploadBytesResumable(storageRef, blob);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(Math.round(progress));
                },
                (error) => {
                    console.error('Upload error:', error);
                    Alert.alert('Upload Failed', 'Please check your connection and try again.');
                    setUploading(false);
                },
                async () => {
                    const url = await getDownloadURL(uploadTask.snapshot.ref);
                    setDownloadUrl(url);
                    setUploading(false);
                    Alert.alert('✅ Upload Complete', 'Your video evidence has been saved!');
                }
            );
        } catch (error) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', 'Something went wrong.');
            setUploading(false);
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Capture Video',
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
                }}
            />
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.content}>
                    {/* Activity Info */}
                    <View style={[styles.infoCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                        {activity?.icon ? (
                            <Text style={styles.infoIcon}>{activity.icon}</Text>
                        ) : (
                            <Ionicons
                                name="videocam-outline"
                                size={48}
                                color={colors.primary}
                                style={{ marginBottom: Spacing.md }}
                            />
                        )}
                        <Text style={[styles.infoTitle, { color: colors.text }]}>
                            {activity?.name ?? 'Video Evidence'}
                        </Text>
                        <Text style={[styles.infoBody, { color: colors.textSecondary }]}>
                            Record or select a video as evidence for this activity.
                            {id === 'parachute-drop'
                                ? ' Use slow-motion mode for the best results!'
                                : ''}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: accentColor }]}
                            onPress={handleRecordVideo}
                            disabled={uploading}
                            accessibilityLabel="Record video with camera"
                        >
                            <Ionicons name="videocam" size={24} color="#FFF" />
                            <Text style={styles.actionButtonText}>🎥 Record Video</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, { backgroundColor: colors.backgroundElement }]}
                            onPress={handlePickVideo}
                            disabled={uploading}
                            accessibilityLabel="Pick video from library"
                        >
                            <Ionicons name="folder-open" size={24} color={colors.text} />
                            <Text style={[styles.actionButtonText, { color: colors.text }]}>
                                📂 From Library
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Selected Video Status */}
                    {videoUri && (
                        <View style={[styles.statusCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                            <Text style={[styles.statusText, { color: colors.text }]}>
                                Video selected and ready to upload
                            </Text>
                        </View>
                    )}

                    {/* Upload Progress */}
                    {uploading && (
                        <View style={[styles.progressCard, { backgroundColor: colors.surface }, Shadows.sm]}>
                            <ActivityIndicator size="small" color={accentColor} />
                            <Text style={[styles.progressText, { color: colors.text }]}>
                                Uploading... {uploadProgress}%
                            </Text>
                            <View style={[styles.progressBarBg, { backgroundColor: colors.backgroundElement }]}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${uploadProgress}%`, backgroundColor: accentColor },
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Upload Complete */}
                    {downloadUrl && (
                        <View style={[styles.successCard, { backgroundColor: '#10B981' + '15' }]}>
                            <Text style={styles.successIcon}>✅</Text>
                            <Text style={[styles.successText, { color: '#10B981' }]}>
                                Video uploaded successfully!
                            </Text>
                        </View>
                    )}

                    {/* Upload Button */}
                    {videoUri && !uploading && !downloadUrl && (
                        <TouchableOpacity
                            style={[styles.uploadButton, { backgroundColor: accentColor }]}
                            onPress={handleUpload}
                            accessibilityLabel="Upload video to cloud"
                        >
                            <Ionicons name="cloud-upload" size={20} color="#FFF" />
                            <Text style={styles.uploadButtonText}>Upload Video</Text>
                        </TouchableOpacity>
                    )}

                    {/* Done Button */}
                    <TouchableOpacity
                        style={[styles.doneButton, { borderColor: colors.border }]}
                        onPress={() => router.back()}
                        accessibilityLabel="Go back to activity"
                    >
                        <Text style={[styles.doneButtonText, { color: colors.text }]}>
                            ← Back to Activity
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        flex: 1,
        padding: Spacing.lg,
        justifyContent: 'center',
    },
    infoCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    infoIcon: { fontSize: 48, marginBottom: Spacing.md },
    infoTitle: {
        fontSize: Typography.titleLarge.fontSize,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    infoBody: {
        fontSize: Typography.bodyMedium.fontSize,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonGroup: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '600',
    },
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statusText: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '500',
    },
    progressCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    progressText: {
        fontSize: Typography.bodyMedium.fontSize,
        fontWeight: '600',
    },
    progressBarBg: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    successCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    successIcon: { fontSize: 32, marginBottom: Spacing.xs },
    successText: {
        fontSize: Typography.bodyLarge.fontSize,
        fontWeight: '600',
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '700',
    },
    doneButton: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        alignItems: 'center',
    },
    doneButtonText: {
        fontSize: Typography.labelLarge.fontSize,
        fontWeight: '500',
    },
});
