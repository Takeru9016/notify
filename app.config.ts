import "dotenv/config";
import type { ExpoConfig } from "@expo/config";

const config: ExpoConfig = {
  name: "Notify",
  slug: "notify",
  version: "1.0.0",
  orientation: "portrait",
  scheme: "notify",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  icon: "./assets/images/icon.png",

  // Add splash config at root level
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  ios: {
    bundleIdentifier: "com.sahiljadhav.notify",
    buildNumber: "1",
    supportsTablet: false, // Changed to false - you're portrait-only couple app
    infoPlist: {
      UIBackgroundModes: ["remote-notification"],
      // Required permission descriptions:
      NSUserTrackingUsageDescription:
        "We use analytics to improve app performance. No ads or cross-app tracking.",
      NSPhotoLibraryUsageDescription:
        "Notify needs access to your photos to upload avatars and stickers.",
      NSCameraUsageDescription:
        "Notify needs camera access to take photos for avatars and stickers.",
      UNUserNotificationCenterDelegateDescription:
        "Notify sends you reminders and updates about shared tasks and events.",
    },
  },

  android: {
    package: "com.sahiljadhav.notify",
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    permissions: [
      "INTERNET",
      "VIBRATE",
      "WAKE_LOCK",
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.RECEIVE_BOOT_COMPLETED",
    ],
  },

  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/images/splash-icon.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#ffffff",
      },
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow Notify to access your photos to upload avatars and stickers.",
        cameraPermission:
          "Allow Notify to use your camera to take photos for avatars and stickers.",
      },
    ],
    [
      "expo-notifications",
      {
        icon: "./assets/images/notification-icon.png", // ⚠️ Verify this file exists (96x96 transparent PNG)
        color: "#4F46E5",
        mode: "production",
        sounds: [], // Add custom notification sounds here if you have them
      },
    ],
    [
      "@sentry/react-native/expo",
      {
        url: process.env.SENTRY_URL,
        organization: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
    },
    // Firebase config from environment variables
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    // Cloudinary
    CLOUDINARY_CLOUD_NAME: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_UNSIGNED_PRESET:
      process.env.EXPO_PUBLIC_CLOUDINARY_UNSIGNED_PRESET,
  },
};

export default config;
