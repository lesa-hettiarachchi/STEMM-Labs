import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  StyleSheet,
  View,
  Text,
  Animated,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  useAudioRecorder,
  useAudioRecorderState,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
} from 'expo-audio';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import {
  convertToEnvironmentalDb,
  smoothDb,
  getHearingRisk,
  type AudioReading,
} from '@/services/sensors/audio';
import { Spacing, BorderRadius, Typography } from '@/constants/theme';

export interface SavedReading {
  label: string;
  db: number;
  risk: string;
  riskColor: string;
  latitude?: number;
  longitude?: number;
}

interface Props {
  colors: Record<string, string>;
  accentColor: string;
  onReadingUpdate: (reading: AudioReading) => void;
  onSaveReading?: (reading: SavedReading) => void;
}

export default function SoundSensor({ colors, accentColor, onReadingUpdate, onSaveReading }: Props) {
  const audioRecorder = useAudioRecorder({
    ...RecordingPresets.HIGH_QUALITY,
    isMeteringEnabled: true,
  });
  const recorderState = useAudioRecorderState(audioRecorder, 200);

  const [isActive, setIsActive] = useState(false);
  const [currentDb, setCurrentDb] = useState(0);
  const [peakDb, setPeakDb] = useState(0);
  const [riskLevel, setRiskLevel] = useState(getHearingRisk(0));
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [zoneLabel, setZoneLabel] = useState('');
  const [isSavingGps, setIsSavingGps] = useState(false);
  const barWidth = useRef(new Animated.Value(0)).current;

  // Request mic permission on mount
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Denied', 'Microphone permission is required for sound measurement.');
      }
    })();
  }, []);

  // Process metering — apply EMA smoothing, guard null/undefined
  useEffect(() => {
    if (!isActive || recorderState.metering == null) return;

    const rawDb = convertToEnvironmentalDb(recorderState.metering);

    setCurrentDb((prev) => {
      const smoothed = prev === 0 ? Math.round(rawDb) : smoothDb(prev, rawDb);
      if (smoothed > peakDb) setPeakDb(smoothed);
      setRiskLevel(getHearingRisk(smoothed));
      return smoothed;
    });

    onReadingUpdate({ dbFS: recorderState.metering, approxDb: rawDb, timestamp: Date.now() });

    const pct = Math.min(rawDb / 130, 1);
    Animated.spring(barWidth, { toValue: pct, tension: 80, friction: 12, useNativeDriver: false }).start();
  }, [recorderState.metering, isActive]);

  const handleToggle = async () => {
    if (isActive) {
      await audioRecorder.stop();
      setIsActive(false);
    } else {
      await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsActive(true);
    }
  };

  const handleSaveReading = async () => {
    setIsSavingGps(true);
    let latitude: number | undefined;
    let longitude: number | undefined;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        latitude = loc.coords.latitude;
        longitude = loc.coords.longitude;
      }
    } catch {
      // GPS unavailable — save without location
    } finally {
      setIsSavingGps(false);
    }

    const readingNumber = savedReadings.length + 1;
    const label = zoneLabel.trim() || `Zone ${readingNumber}`;

    const saved: SavedReading = {
      label,
      db: currentDb,
      risk: riskLevel.level,
      riskColor: riskLevel.color,
      latitude,
      longitude,
    };

    setSavedReadings((prev) => [...prev, saved]);
    setZoneLabel(''); // Clear for next zone
    if (onSaveReading) onSaveReading(saved);
  };

  // Derive map region centred on the first reading that has GPS
  const gpsReadings = savedReadings.filter((r) => r.latitude != null && r.longitude != null);
  const mapRegion =
    gpsReadings.length > 0
      ? {
          latitude: gpsReadings[0].latitude!,
          longitude: gpsReadings[0].longitude!,
          latitudeDelta: 0.0006,
          longitudeDelta: 0.0006,
        }
      : null;

  const barColor =
    currentDb < 60 ? '#10B981' :
    currentDb < 85 ? '#F59E0B' :
    currentDb < 100 ? '#EF4444' : '#DC2626';

  return (
    <View style={styles.container}>
      {/* dB Display */}
      <View style={[styles.dbDisplay, { backgroundColor: colors.backgroundElement }]}>
        <View style={styles.dbLabelRow}>
          <Ionicons name="volume-high-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.dbLabel, { color: colors.textSecondary }]}>Sound Level</Text>
        </View>
        <Text style={[styles.dbValue, { color: barColor }]}>{currentDb}</Text>
        <Text style={[styles.dbUnit, { color: colors.textSecondary }]}>dB (approx)</Text>
      </View>

      {/* Level bar */}
      <View style={[styles.barContainer, { backgroundColor: colors.backgroundElement }]}>
        <Animated.View
          style={[styles.bar, { backgroundColor: barColor, width: barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]}
        />
      </View>
      <View style={styles.scaleMarkers}>
        {['0', '30', '60', '85', '100', '130'].map((v) => (
          <Text key={v} style={[styles.scaleText, { color: colors.textSecondary }]}>{v}</Text>
        ))}
      </View>

      {/* Peak + Risk */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Peak</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{peakDb} dB</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: riskLevel.color + '15' }]}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Risk</Text>
          <Text style={[styles.statValue, { color: riskLevel.color }]}>{riskLevel.level}</Text>
        </View>
      </View>
      {riskLevel.description ? (
        <Text style={[styles.riskDescription, { color: riskLevel.color }]}>
          {riskLevel.description}
        </Text>
      ) : null}

      {/* Zone label input + action buttons */}
      <TextInput
        style={[styles.zoneLabelInput, { backgroundColor: colors.backgroundElement, color: colors.text, borderColor: colors.border }]}
        placeholder="Zone name (e.g. Front of class, Near window…)"
        placeholderTextColor={colors.textSecondary}
        value={zoneLabel}
        onChangeText={setZoneLabel}
        accessibilityLabel="Zone location label"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.toggleButton, { backgroundColor: isActive ? '#EF4444' : accentColor }]}
          onPress={handleToggle}
          accessibilityLabel={isActive ? 'Stop recording sound' : 'Start recording sound'}
        >
          <Ionicons
            name={isActive ? 'stop-circle-outline' : 'mic-outline'}
            size={20}
            color="#FFFFFF"
          />
          <Text style={styles.toggleText}>{isActive ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>

        {isActive && (
          <TouchableOpacity
            style={[styles.saveButton, { borderColor: accentColor, opacity: isSavingGps ? 0.6 : 1 }]}
            onPress={handleSaveReading}
            disabled={isSavingGps}
            accessibilityLabel="Save current reading for this zone"
          >
            <Ionicons
              name={isSavingGps ? 'location-outline' : 'bookmark-outline'}
              size={18}
              color={accentColor}
            />
            <Text style={[styles.saveText, { color: accentColor }]}>
              {isSavingGps ? 'Getting GPS…' : 'Save Zone'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Saved readings list */}
      {savedReadings.length > 0 && (
        <View style={[styles.savedSection, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.savedHeader}>
            <Ionicons name="list-outline" size={16} color={colors.text} />
            <Text style={[styles.savedTitle, { color: colors.text }]}>
              Zone Readings
            </Text>
          </View>
          {savedReadings.map((reading, i) => (
            <View key={i} style={[styles.savedRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.colorDot, { backgroundColor: reading.riskColor }]} />
              <Text style={[styles.savedLabel, { color: colors.text }]}>{reading.label}</Text>
              <Text style={[styles.savedDb, { color: colors.text }]}>{reading.db} dB</Text>
              <Text style={[styles.savedRisk, { color: reading.riskColor }]}>{reading.risk}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Noise Zone Map — appears once 2+ GPS-tagged readings exist */}
      {gpsReadings.length >= 2 && mapRegion && (
        <View style={styles.mapWrapper}>
          <View style={styles.mapHeader}>
            <Ionicons name="map-outline" size={18} color={colors.text} />
            <Text style={[styles.mapTitle, { color: colors.text }]}>
              Noise Zone Map
            </Text>
          </View>
          <Text style={[styles.mapSubtitle, { color: colors.textSecondary }]}>
            Green = quiet · Orange = moderate · Red = loud
          </Text>
          <MapView
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={mapRegion}
            scrollEnabled={false}
            zoomEnabled={false}
          >
            {gpsReadings.map((r, i) => (
              <Marker
                key={i}
                coordinate={{ latitude: r.latitude!, longitude: r.longitude! }}
                pinColor={r.riskColor}
                title={r.label}
                description={`${r.db} dB · ${r.risk}`}
              />
            ))}
          </MapView>
        </View>
      )}

      {/* Prompt to walk around if only 1 reading so far */}
      {savedReadings.length === 1 && (
        <View style={styles.walkHintRow}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.walkHint, { color: colors.textSecondary }]}>
            Move to a different location, type its name, then save another reading to build your zone map.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
  dbDisplay: {
    width: '100%', padding: Spacing.xl, borderRadius: BorderRadius.lg,
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  dbLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  dbLabel: { fontSize: Typography.bodyMedium.fontSize },
  dbValue: { fontSize: 56, fontWeight: '700', fontVariant: ['tabular-nums'] },
  dbUnit: { fontSize: Typography.bodyMedium.fontSize, marginTop: Spacing.xxs },
  barContainer: {
    width: '100%', height: 24, borderRadius: 12, overflow: 'hidden', marginBottom: Spacing.xs,
  },
  bar: { height: '100%', borderRadius: 12 },
  scaleMarkers: {
    width: '100%', flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 2, marginBottom: Spacing.md,
  },
  scaleText: { fontSize: 10 },
  statsRow: {
    flexDirection: 'row', gap: Spacing.sm, width: '100%', marginBottom: Spacing.sm,
  },
  statBox: {
    flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: 'center',
  },
  statLabel: { fontSize: Typography.labelSmall.fontSize, marginBottom: 2 },
  statValue: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
  riskDescription: {
    fontSize: Typography.bodyMedium.fontSize, fontStyle: 'italic',
    textAlign: 'center', marginBottom: Spacing.lg, width: '100%',
  },
  zoneLabelInput: {
    width: '100%', height: 44, borderRadius: BorderRadius.md, borderWidth: 1,
    paddingHorizontal: Spacing.md, fontSize: Typography.bodyMedium.fontSize,
    marginBottom: Spacing.sm,
  },
  buttonRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg, width: '100%' },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  toggleText: { color: '#FFFFFF', fontSize: Typography.labelLarge.fontSize, fontWeight: '700' },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  saveText: { fontSize: Typography.labelLarge.fontSize, fontWeight: '600' },
  savedSection: { width: '100%', borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md },
  savedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  savedTitle: { fontSize: Typography.labelLarge.fontSize, fontWeight: '600' },
  savedRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.sm,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  savedLabel: { flex: 1, fontSize: Typography.bodyMedium.fontSize },
  savedDb: { fontSize: Typography.bodyMedium.fontSize, fontWeight: '600' },
  savedRisk: { fontSize: Typography.bodySmall.fontSize, fontWeight: '500', minWidth: 70, textAlign: 'right' },
  mapWrapper: { width: '100%', marginBottom: Spacing.md },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xxs,
  },
  mapTitle: { fontSize: Typography.titleMedium.fontSize, fontWeight: '600' },
  mapSubtitle: { fontSize: Typography.bodySmall.fontSize, marginBottom: Spacing.sm },
  map: { width: '100%', height: 200, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  walkHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
  walkHint: {
    flex: 1,
    fontSize: Typography.bodySmall.fontSize,
  },
});
