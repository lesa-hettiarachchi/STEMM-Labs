import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import React from 'react';
import type { Team } from '../constants/types';

// ─── Mocks ───────────────────────────────────────────────────────

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-battery', () => ({
    getBatteryLevelAsync: () => Promise.resolve(0.78),
    getBatteryStateAsync: () => Promise.resolve(1),
    addBatteryLevelListener: () => ({ remove: jest.fn() }),
    addBatteryStateListener: () => ({ remove: jest.fn() }),
    BatteryState: { CHARGING: 2, FULL: 3, UNPLUGGED: 1, UNKNOWN: 0 },
}));

jest.mock('@/context/SettingsContext', () => ({
    useSettings: jest.fn(),
    SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/context/TeamContext', () => ({
    useTeam: jest.fn(),
    TeamProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/services/firestore', () => ({
    updateTeam: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/components/ThemedText', () => ({
    ThemedText: ({ children, ...props }: { children: React.ReactNode }) => {
        const { Text } = require('react-native');
        return <Text {...props}>{children}</Text>;
    },
}));

jest.mock('@/assets/icons/teamIcon.png', () => 1, { virtual: true });

// ─── Import screen AFTER mocks ────────────────────────────────────

import ProfileScreen from '../app/(tabs)/profile';
import { useSettings } from '../context/SettingsContext';
import { useTeam } from '../context/TeamContext';

const mockSettings = {
    themeMode: 'light' as const,
    resolvedTheme: 'light' as const,
    textSizeMultiplier: 1.0,
    setThemeMode: jest.fn(),
    setTextSizeMultiplier: jest.fn(),
};

const mockTeam: Team = {
    id: 'team-abc',
    name: 'Beta Squad',
    discriminator: '9876',
    gradeLevel: 'Year 8',
    schoolName: 'Test Primary School',
    createdAt: 1700000000000,
    members: [
        { id: 'm1', firstName: 'Sam' },
        { id: 'm2', firstName: 'Riley' },
    ],
};

const mockUpdateTeam = jest.fn();
const mockTeamBase = {
    team: mockTeam,
    activityProgress: {
        'parachute-drop': { status: 'completed' as const, currentIteration: 3 },
        'sound-pollution': { status: 'in_progress' as const, currentIteration: 1 },
        'hand-fan': { status: 'not_started' as const, currentIteration: 1 },
    },
    isLoading: false,
    isRegistered: true,
    setTeam: jest.fn(),
    updateTeam: mockUpdateTeam,
    updateActivityProgress: jest.fn(),
    clearTeam: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────

describe('ProfileScreen E2E', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useSettings as jest.Mock).mockReturnValue(mockSettings);
        (useTeam as jest.Mock).mockReturnValue(mockTeamBase);
    });

    it('renders the team name', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('Beta Squad')).toBeTruthy());
    });

    it('renders the team discriminator', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('#9876')).toBeTruthy());
    });

    it('renders the grade level', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('Year 8')).toBeTruthy());
    });

    it('shows school name in Team Details section', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('Test Primary School')).toBeTruthy());
    });

    it('shows both team member names', async () => {
        render(<ProfileScreen />);
        await waitFor(() => {
            expect(screen.getByText('Sam')).toBeTruthy();
            expect(screen.getByText('Riley')).toBeTruthy();
        });
    });

    it('shows the battery widget with percentage after loading', async () => {
        render(<ProfileScreen />);
        await waitFor(() => {
            expect(screen.getByText('Device Battery')).toBeTruthy();
            expect(screen.getByText('78%')).toBeTruthy();
        });
    });

    it('reveals Save button when Edit is pressed', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('Edit')).toBeTruthy());
        fireEvent.press(screen.getByText('Edit'));
        expect(screen.getByText('Save')).toBeTruthy();
    });

    it('calls updateTeam when Save is pressed after editing', async () => {
        render(<ProfileScreen />);
        await waitFor(() => expect(screen.getByText('Edit')).toBeTruthy());
        fireEvent.press(screen.getByText('Edit'));
        fireEvent.press(screen.getByText('Save'));
        await waitFor(() => expect(mockUpdateTeam).toHaveBeenCalled());
    });

    it('renders empty state when no team exists', async () => {
        (useTeam as jest.Mock).mockReturnValue({ ...mockTeamBase, team: null });
        render(<ProfileScreen />);
        await waitFor(() =>
            expect(screen.getByText('No team profile found.')).toBeTruthy()
        );
    });
});
