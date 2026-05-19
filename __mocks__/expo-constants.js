// Global mock for expo-constants — used by notifications.ts and backgroundTask.ts
// to detect Expo Go.  In tests we want isExpoGo = false so the production code
// paths get exercised, not the early-return guards.

const ExecutionEnvironment = {
    Bare: 'bare',
    Standalone: 'standalone',
    StoreClient: 'storeClient',
};

module.exports = {
    __esModule: true,
    default: {
        executionEnvironment: ExecutionEnvironment.Standalone,
        expoConfig: { extra: { eas: { projectId: 'test-project-id' } } },
        manifest: {},
    },
    ExecutionEnvironment,
};
