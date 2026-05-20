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
