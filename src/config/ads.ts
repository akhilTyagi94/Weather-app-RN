import { Platform } from "react-native";
import { TestIds } from "react-native-google-mobile-ads";

// Real production banner ad unit IDs from your AdMob account.
// Fill these in before a store release -- until then, dev builds always
// fall back to Google's TestIds below, so nothing needs to change locally.
const PROD_BANNER_AD_UNIT_ID = Platform.select({
  ios: "ca-app-pub-REPLACE_WITH_YOUR_IOS_APP_ID/REPLACE_WITH_YOUR_IOS_BANNER_UNIT_ID",
  android:
    "ca-app-pub-REPLACE_WITH_YOUR_ANDROID_APP_ID/REPLACE_WITH_YOUR_ANDROID_BANNER_UNIT_ID",
  default: TestIds.BANNER,
});

export const BANNER_AD_UNIT_ID = __DEV__ ? TestIds.BANNER : PROD_BANNER_AD_UNIT_ID;
