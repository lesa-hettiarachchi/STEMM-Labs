
const TEST_ADMOB_ANDROID = 'ca-app-pub-3940256099942544~3347511713';
const TEST_ADMOB_IOS = 'ca-app-pub-3940256099942544~1458002511';

export default ({ config }) => ({
    expo: {
        name: 'STEMM-Labs',
        slug: 'STEMM-Labs',
        version: '1.0.0',
        orientation: 'portrait',
        icon: './assets/images/icon.png',
        scheme: 'stemmlabs',
        userInterfaceStyle: 'automatic',
        newArchEnabled: true,
        owner: 'lesa-hettiarachchi',

        ios: {
            supportsTablet: true,
            bundleIdentifier: 'com.stemmlabs.app',
        },

        android: {
            package: 'com.stemmlabs.app',
            edgeToEdgeEnabled: true,
            predictiveBackGestureEnabled: false,
            adaptiveIcon: {
                backgroundColor: '#E6F4FE',
                foregroundImage: './assets/images/android-icon-foreground.png',
                backgroundImage: './assets/images/android-icon-background.png',
                monochromeImage: './assets/images/android-icon-monochrome.png',
            },
            googleMaps: {
                apiKey: process.env.GOOGLE_MAPS_ANDROID_API_KEY,
            },
            permissions: [
                'android.permission.RECORD_AUDIO',
                'android.permission.MODIFY_AUDIO_SETTINGS',
                'android.permission.ACCESS_COARSE_LOCATION',
                'android.permission.ACCESS_FINE_LOCATION',
            ],
        },

        web: {
            output: 'static',
            favicon: './assets/images/favicon.png',
        },

        plugins: [
            'expo-router',
            'expo-asset',
            [
                'expo-splash-screen',
                {
                    image: './assets/images/splash-icon.png',
                    imageWidth: 200,
                    resizeMode: 'contain',
                    backgroundColor: '#ffffff',
                    dark: { backgroundColor: '#000000' },
                },
            ],
            'expo-audio',
            [
                'expo-notifications',
                {
                    icon: './assets/images/icon.png',
                    color: '#1A9B7B',
                    defaultChannel: 'stemm-alerts',
                },
            ],
            [
                'expo-location',
                {
                    locationWhenInUsePermission:
                        'STEMM Labs uses your location to tag where science activities are completed.',
                    locationAlwaysAndWhenInUsePermission:
                        'STEMM Labs uses your location to tag where science activities are completed.',
                },
            ],
            'expo-sqlite',
            [
                'react-native-google-mobile-ads',
                {
                    androidAppId: process.env.ADMOB_ANDROID_APP_ID || TEST_ADMOB_ANDROID,
                    iosAppId: process.env.ADMOB_IOS_APP_ID || TEST_ADMOB_IOS,
                },
            ],
        ],

        experiments: {
            typedRoutes: true,
            reactCompiler: true,
        },

        extra: {
            router: {},
            eas: {
                projectId: '0f0b840c-317b-43c6-bc2f-f361b719cbde',
            },
        },

        runtimeVersion: {
            policy: 'appVersion',
        },

        updates: {
            url: 'https://u.expo.dev/0f0b840c-317b-43c6-bc2f-f361b719cbde',
        },
    },
});
