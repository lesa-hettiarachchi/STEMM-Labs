/**
 * E2E COMPONENT TEST — Home Screen
 * Person 1 (Lesa)
 *
 * Renders the HomeScreen component inside the required providers and
 * asserts that all 7 activities are displayed with correct labels,
 * categories, and navigation behaviour.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';

// ─── Mocks (must be declared before any imports) ──────────────────

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    useRouter: () => ({ push: mockPush, replace: jest.fn() }),
    useLocalSearchParams: () => ({}),
    Stack: {
        Screen: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    },
}));

jest.mock('@expo/vector-icons', () => ({
    Ionicons: () => null,
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// useSettings mock — factory uses jest.fn() so we can swap return values
jest.mock('@/context/SettingsContext', () => ({
    useSettings: jest.fn(),
    SettingsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// useTeam mock — factory uses jest.fn() so we can swap return values
jest.mock('@/context/TeamContext', () => ({
    useTeam: jest.fn(),
    TeamProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/components/ThemedText', () => ({
    ThemedText: ({ children, ...props }: { children: React.ReactNode }) => {
        const { Text } = require('react-native');
        return <Text {...props}>{children}</Text>;
    },
}));

// ─── Import screen AFTER mocks ────────────────────────────────────

import HomeScreen from '../app/(tabs)/index';
import { useSettings } from '../context/SettingsContext';
import { useTeam } from '../context/TeamContext';

const mockSettings = {
    themeMode: 'light' as const,
    resolvedTheme: 'light' as const,
    textSizeMultiplier: 1.0,
    setThemeMode: jest.fn(),
    setTextSizeMultiplier: jest.fn(),
};

const mockTeamBase = {
    team: {
        id: 'team-001',
        name: 'Test Squad',
        discriminator: '0001',
        gradeLevel: 'Year 7',
        createdAt: Date.now(),
        members: [{ id: 'm1', firstName: 'Test' }],
    },
    activityProgress: {},
    isLoading: false,
    isRegistered: true,
    setTeam: jest.fn(),
    updateTeam: jest.fn(),
    updateActivityProgress: jest.fn(),
    clearTeam: jest.fn(),
};

// ─── Tests ───────────────────────────────────────────────────────

describe('HomeScreen E2E', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useSettings as jest.Mock).mockReturnValue(mockSettings);
        (useTeam as jest.Mock).mockReturnValue(mockTeamBase);
    });

    it('renders both activity category headings', () => {
        render(<HomeScreen />);
        expect(screen.getByText('Engineering Challenges')).toBeTruthy();
        expect(screen.getByText('Health & Medical Sciences')).toBeTruthy();
    });

    it('renders all 7 activity cards by name', () => {
        render(<HomeScreen />);
        expect(screen.getByText('Parachute Drop Challenge')).toBeTruthy();
        expect(screen.getByText('Sound Pollution Hunter')).toBeTruthy();
        expect(screen.getByText('Hand Fan Challenge')).toBeTruthy();
        expect(screen.getByText('Earthquake-Resistant Structure')).toBeTruthy();
        expect(screen.getByText('Human Performance Lab')).toBeTruthy();
        expect(screen.getByText('Reaction Board Challenge')).toBeTruthy();
        expect(screen.getByText('Breathing Pace Trainer')).toBeTruthy();
    });

    it('shows "Not Started" status for all activities when no progress exists', () => {
        render(<HomeScreen />);
        const notStartedLabels = screen.getAllByText('Not Started');
        expect(notStartedLabels.length).toBe(7);
    });

    it('navigates to the activity detail screen when a card is pressed', () => {
        render(<HomeScreen />);
        fireEvent.press(screen.getByText('Parachute Drop Challenge'));
        expect(mockPush).toHaveBeenCalledWith('/activity/parachute-drop');
    });

    it('navigates to the correct activity for health cards', () => {
        render(<HomeScreen />);
        fireEvent.press(screen.getByText('Reaction Board Challenge'));
        expect(mockPush).toHaveBeenCalledWith('/activity/reaction-board');
    });

    it('shows "Completed" badge and best score when progress is completed', () => {
        (useTeam as jest.Mock).mockReturnValue({
            ...mockTeamBase,
            activityProgress: {
                'sound-pollution': {
                    status: 'completed' as const,
                    currentIteration: 1,
                    bestScore: 72,
                    bestScoreUnit: 'dB',
                },
            },
        });

        render(<HomeScreen />);
        expect(screen.getByText('Completed')).toBeTruthy();
        expect(screen.getByText('Best: 72')).toBeTruthy();
    });

    it('shows "In Progress" badge for activities with in_progress status', () => {
        (useTeam as jest.Mock).mockReturnValue({
            ...mockTeamBase,
            activityProgress: {
                'hand-fan': { status: 'in_progress' as const, currentIteration: 2 },
            },
        });

        render(<HomeScreen />);
        expect(screen.getByText('In Progress')).toBeTruthy();
    });
});
