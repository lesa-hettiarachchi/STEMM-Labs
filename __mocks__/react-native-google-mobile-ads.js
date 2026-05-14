const { View } = require('react-native');

module.exports = {
    BannerAd: () => null,
    BannerAdSize: { ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER', BANNER: 'BANNER' },
    TestIds: { BANNER: 'ca-app-pub-3940256099942544/6300978111' },
    InterstitialAd: { createForAdRequest: jest.fn(() => ({ load: jest.fn() })) },
    AdEventType: { LOADED: 'LOADED', ERROR: 'ERROR' },
};
