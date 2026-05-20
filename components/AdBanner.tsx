import React from 'react';
import { Platform, StyleSheet, View, Text } from 'react-native';

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;
let isAdsAvailable = false;

try {
    // Attempt to dynamically require the module so missing native binaries don't crash JavaScript evaluation
    const ads = require('react-native-google-mobile-ads');
    BannerAd = ads.BannerAd;
    BannerAdSize = ads.BannerAdSize;
    TestIds = ads.TestIds;
    isAdsAvailable = true;
} catch (e) {
    isAdsAvailable = false;
}

export default function AdBanner() {
    if (!isAdsAvailable || !BannerAd) {
        return (
            <View style={[styles.container, styles.placeholder]}>
                <Text style={styles.placeholderText}>[AdMob Banner Placeholder. Native Build Required]</Text>
            </View>
        );
    }

    const BANNER_AD_UNIT_ID = Platform.select({
        ios: TestIds.BANNER,
        android: TestIds.BANNER,
        default: TestIds.BANNER,
    });

    return (
        <View style={styles.container}>
            <BannerAd
                unitId={BANNER_AD_UNIT_ID}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    placeholder: {
        paddingVertical: 12,
        backgroundColor: 'rgba(0,0,0,0.03)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    placeholderText: {
        fontSize: 12,
        color: '#888',
        fontStyle: 'italic',
    },
});
