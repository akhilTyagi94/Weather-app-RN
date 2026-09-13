import { useEffect, useState } from "react";
import { Platform } from "react-native";
import mobileAds, { AdsConsent } from "react-native-google-mobile-ads";
import {
  getTrackingPermissionsAsync,
  requestTrackingPermissionsAsync,
  PermissionStatus,
} from "expo-tracking-transparency";

let adsReadyPromise: Promise<void> | null = null;

// Gathers GDPR/UK consent (Google's UMP flow) and, on iOS, the App Tracking
// Transparency permission, before the Mobile Ads SDK initializes. Both are
// required by policy: UMP because Google requires a consent decision before
// serving personalized ads in the EEA/UK, and ATT because Apple requires it
// before an app can use the IDFA for tracking.
async function prepareAds(): Promise<void> {
  try {
    await AdsConsent.gatherConsent();
  } catch (error) {
    console.warn("Failed to gather ad consent", error);
  }

  if (Platform.OS === "ios") {
    try {
      const { status } = await getTrackingPermissionsAsync();
      if (status === PermissionStatus.UNDETERMINED) {
        await requestTrackingPermissionsAsync();
      }
    } catch (error) {
      console.warn("Failed to request tracking permission", error);
    }
  }

  try {
    await mobileAds().initialize();
  } catch (error) {
    console.warn("Failed to initialize mobile ads", error);
  }
}

// Runs once for the app's lifetime, however many callers await it.
export function initializeAds(): Promise<void> {
  if (!adsReadyPromise) {
    adsReadyPromise = prepareAds();
  }
  return adsReadyPromise;
}

// True once consent has been gathered (and ATT requested on iOS) and the
// Mobile Ads SDK has initialized -- gate ad components behind this so no ad
// is requested before that sequence completes.
export function useAdsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    initializeAds().then(() => {
      if (mounted) setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return ready;
}
