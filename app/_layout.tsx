import { useEffect, useRef, useState } from "react";
import { useColorScheme } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { TamaguiProvider, Theme, YStack, Text } from "tamagui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import config from "../tamagui.config";
import { usePairingStore } from "@/store/pairing";
import { useThemeStore } from "@/state/theme";
import { useAuthStore } from "@/store/auth";
import { initializeAuthListener } from "@/services/auth/auth.service";
import { getProfile } from "@/services/profile.service";
import { testFirebaseConnection } from "@/utils/test/testFirebase";

const qc = new QueryClient();

function LoadingScreen() {
  return (
    <YStack
      flex={1}
      alignItems="center"
      justifyContent="center"
      backgroundColor="$bg"
    >
      <Text color="$color" fontSize={20} fontWeight="700">
        Loading...
      </Text>
    </YStack>
  );
}

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { isPaired, pairId } = usePairingStore();
  const { initialized, user } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [pairingChecked, setPairingChecked] = useState(false);
  const firstRun = useRef(true);

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check pairing status when user is authenticated
  useEffect(() => {
    if (initialized && user && !pairingChecked) {
      checkPairingStatus();
    }
  }, [initialized, user, pairingChecked]);

  const checkPairingStatus = async () => {
    try {
      const profile = await getProfile();
      if (profile?.pairId) {
        usePairingStore.setState({
          isPaired: true,
          pairId: profile.pairId,
        });
      } else {
        usePairingStore.setState({
          isPaired: false,
          pairId: null,
        });
      }
    } catch (error) {
      console.error("❌ Error checking pairing status:", error);
      // Default to not paired on error
      usePairingStore.setState({
        isPaired: false,
        pairId: null,
      });
    } finally {
      setPairingChecked(true);
    }
  };

  // Router guard
  useEffect(() => {
    if (!mounted || !initialized || !pairingChecked) return;

    const inTabs = segments[0] === "(tabs)";
    const inPair = segments[0] === "pair";

    // Skip first run to prevent flash
    if (firstRun.current) {
      firstRun.current = false;

      // Initial navigation
      if (user && !isPaired && !inPair) {
        router.replace("/pair");
      } else if (user && isPaired && !inTabs) {
        router.replace("/(tabs)");
      }

      return;
    }

    // Subsequent navigation
    if (user && !isPaired && inTabs) {
      // User is authenticated but not paired, and trying to access tabs
      router.replace("/pair");
    } else if (user && isPaired && inPair) {
      // User is paired but still on pair screen
      router.replace("/(tabs)");
    }
  }, [mounted, initialized, pairingChecked, user, isPaired, segments]);

  // Show loading screen until auth and pairing status are checked
  if (!initialized || !pairingChecked) {
    return <LoadingScreen />;
  }

  return <Slot />;
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  const activeTheme =
    mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  useEffect(() => {
    // Test Firebase connection (only in dev)
    if (__DEV__) {
      testFirebaseConnection();
      // testSecurityRules(); // Uncomment to test security rules
    }

    // Initialize auth listener
    const unsubscribe = initializeAuthListener();

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={qc}>
      <TamaguiProvider config={config}>
        <Theme name={activeTheme}>
          <Gate />
        </Theme>
      </TamaguiProvider>
    </QueryClientProvider>
  );
}
