import React from "react";
import { View, StyleSheet, Platform } from "react-native";

let BannerAd: any = null;
let BannerAdSize: any = null;
let TestIds: any = null;

try {
  const admob = require("react-native-google-mobile-ads");
  BannerAd = admob.BannerAd;
  BannerAdSize = admob.BannerAdSize;
  TestIds = admob.TestIds;
} catch (_) {}

const ANDROID_AD_UNIT_ID = "ca-app-pub-6293674677101068/1335864713";
const IOS_AD_UNIT_ID = "ca-app-pub-6293674677101068/6631890590";

const adUnitId =
  __DEV__
    ? TestIds?.BANNER ?? ANDROID_AD_UNIT_ID
    : Platform.OS === "ios"
    ? IOS_AD_UNIT_ID
    : ANDROID_AD_UNIT_ID;

export default function AdBanner() {
  if (Platform.OS === "web" || !BannerAd || !BannerAdSize) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: false }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    backgroundColor: "#111",
  },
});
