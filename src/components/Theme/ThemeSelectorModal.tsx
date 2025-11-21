import { Modal } from "react-native";
import { YStack, XStack, Text, Button, Stack } from "tamagui";

import { ThemeMode, ColorScheme, useThemeStore } from "@/state/theme";
import { triggerLightHaptic, triggerSelectionHaptic } from "@/state/haptics";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ThemeSelectorModal({ visible, onClose }: Props) {
  const { mode, colorScheme, setMode, setColorScheme } = useThemeStore();

  const modeOptions: {
    mode: ThemeMode;
    label: string;
    icon: string;
    description: string;
  }[] = [
    {
      mode: "light",
      label: "Light",
      icon: "☀️",
      description: "Always use light theme",
    },
    {
      mode: "dark",
      label: "Dark",
      icon: "🌙",
      description: "Always use dark theme",
    },
    {
      mode: "system",
      label: "System",
      icon: "⚙️",
      description: "Follow system settings",
    },
  ];

  const colorOptions: {
    scheme: ColorScheme;
    label: string;
    icon: string;
    description: string;
    previewColors: string[];
  }[] = [
    {
      scheme: "coral",
      label: "Coral & Sand",
      icon: "🌅",
      description: "Bright & optimistic",
      previewColors: ["#FF7A7A", "#FFE0DD", "#F4E2D9"],
    },
    {
      scheme: "rose",
      label: "Rose & Latte",
      icon: "🌹",
      description: "Warm & cozy",
      previewColors: ["#E76F7A", "#F9D5DB", "#F1E4DC"],
    },
    {
      scheme: "plum",
      label: "Plum & Mist",
      icon: "🍇",
      description: "Modern & elegant",
      previewColors: ["#A25B88", "#F1D7EA", "#E6E0ED"],
    },
    {
      scheme: "lavender",
      label: "Lavender Dreams",
      icon: "💜",
      description: "Soft & dreamy",
      previewColors: ["#9B7EBD", "#E8DDEF", "#EBE4F3"],
    },
  ];

  const handleModeSelect = (newMode: ThemeMode) => {
    triggerSelectionHaptic();
    setMode(newMode);
  };

  const handleColorSelect = (newScheme: ColorScheme) => {
    triggerSelectionHaptic();
    setColorScheme(newScheme);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Stack
        flex={1}
        backgroundColor="rgba(0,0,0,0.5)"
        justifyContent="flex-end"
      >
        <Stack
          backgroundColor="$bg"
          borderTopLeftRadius="$8"
          borderTopRightRadius="$8"
          paddingBottom="$6"
          maxHeight="85%"
        >
          <YStack padding="$4" gap="$5">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text
                color="$color"
                fontSize={24}
                fontWeight="900"
                fontFamily="$heading"
              >
                Theme Settings
              </Text>
              <Button
                unstyled
                onPress={() => {
                  triggerLightHaptic();
                  onClose();
                }}
              >
                <Text color="$colorMuted" fontSize={28}>
                  ✕
                </Text>
              </Button>
            </XStack>

            {/* Color Scheme Section */}
            <YStack gap="$3">
              <Text
                color="$color"
                fontSize={16}
                fontWeight="700"
                fontFamily="$body"
              >
                Color Scheme
              </Text>
              <YStack gap="$2">
                {colorOptions.map((option) => (
                  <Button
                    key={option.scheme}
                    unstyled
                    onPress={() => handleColorSelect(option.scheme)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Stack
                      backgroundColor="$bgCard"
                      borderRadius="$6"
                      padding="$4"
                      borderWidth={2}
                      borderColor={
                        colorScheme === option.scheme
                          ? "$primary"
                          : "$borderColor"
                      }
                    >
                      <XStack gap="$3" alignItems="center">
                        <Text fontSize={32}>{option.icon}</Text>
                        <YStack flex={1} gap="$1">
                          <Text
                            color="$color"
                            fontSize={16}
                            fontWeight="700"
                            fontFamily="$body"
                          >
                            {option.label}
                          </Text>
                          <Text
                            color="$colorMuted"
                            fontSize={13}
                            fontFamily="$body"
                          >
                            {option.description}
                          </Text>
                        </YStack>
                        {/* Color preview chips */}
                        <XStack gap="$1">
                          {option.previewColors.map((c, i) => (
                            <Stack
                              key={i}
                              width={20}
                              height={20}
                              borderRadius="$2"
                              backgroundColor={c}
                            />
                          ))}
                        </XStack>
                        {colorScheme === option.scheme && (
                          <Text fontSize={20} color="$primary">
                            ✓
                          </Text>
                        )}
                      </XStack>
                    </Stack>
                  </Button>
                ))}
              </YStack>
            </YStack>

            {/* Mode Section */}
            <YStack gap="$3">
              <Text
                color="$color"
                fontSize={16}
                fontWeight="700"
                fontFamily="$body"
              >
                Brightness
              </Text>
              <YStack gap="$2">
                {modeOptions.map((option) => (
                  <Button
                    key={option.mode}
                    unstyled
                    onPress={() => handleModeSelect(option.mode)}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <Stack
                      backgroundColor="$bgCard"
                      borderRadius="$6"
                      padding="$4"
                      borderWidth={2}
                      borderColor={
                        mode === option.mode ? "$primary" : "$borderColor"
                      }
                    >
                      <XStack gap="$3" alignItems="center">
                        <Text fontSize={32}>{option.icon}</Text>
                        <YStack flex={1} gap="$1">
                          <Text
                            color="$color"
                            fontSize={16}
                            fontWeight="700"
                            fontFamily="$body"
                          >
                            {option.label}
                          </Text>
                          <Text
                            color="$colorMuted"
                            fontSize={13}
                            fontFamily="$body"
                          >
                            {option.description}
                          </Text>
                        </YStack>
                        {mode === option.mode && (
                          <Text fontSize={20} color="$primary">
                            ✓
                          </Text>
                        )}
                      </XStack>
                    </Stack>
                  </Button>
                ))}
              </YStack>
            </YStack>
          </YStack>
        </Stack>
      </Stack>
    </Modal>
  );
}
