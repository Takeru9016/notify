import { Modal, Linking, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Stack,
  ScrollView,
  Image,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Favorite, FavoriteCategory } from "@/types";

type Props = {
  visible: boolean;
  favorite: Favorite | null;
  onClose: () => void;
  onEdit: (favorite: Favorite) => void;
  onDelete: (id: string) => void;
};

const categoryEmojis: Record<FavoriteCategory, string> = {
  movie: "🎬",
  food: "🍕",
  place: "📍",
  quote: "💭",
  link: "🔗",
  other: "⭐",
};

export function FavoriteDetailModal({
  visible,
  favorite,
  onClose,
  onEdit,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();

  if (!favorite) return null;

  const handleDelete = () => {
    Alert.alert(
      "Delete Favorite",
      "Are you sure you want to delete this favorite?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(favorite.id);
            onClose();
          },
        },
      ]
    );
  };

  const handleOpenUrl = async () => {
    if (!favorite.url) return;

    let urlToOpen = favorite.url.trim();

    // Add https:// if no protocol specified
    if (!urlToOpen.startsWith("http://") && !urlToOpen.startsWith("https://")) {
      urlToOpen = "https://" + urlToOpen;
    }

    // Check if URL can be opened
    const canOpen = await Linking.canOpenURL(urlToOpen);

    if (canOpen) {
      Linking.openURL(urlToOpen).catch((err) => {
        console.error("Failed to open URL:", err);
        Alert.alert("Error", "Could not open this link");
      });
    } else {
      Alert.alert("Invalid URL", "This link cannot be opened");
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
          maxHeight="85%"
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: Math.max(insets.bottom, 20) + 20,
            }}
            showsVerticalScrollIndicator={true}
          >
            <YStack gap="$4">
              {/* Header */}
              <XStack
                alignItems="center"
                justifyContent="space-between"
                padding="$4"
                paddingBottom="$2"
              >
                <Text color="$color" fontSize={22} fontWeight="900">
                  {categoryEmojis[favorite.category]} {favorite.category}
                </Text>
                <Button unstyled onPress={onClose}>
                  <Text color="$muted" fontSize={28}>
                    ✕
                  </Text>
                </Button>
              </XStack>

              {/* Image */}
              {favorite.imageUrl && (
                <Image
                  source={{ uri: favorite.imageUrl }}
                  width="100%"
                  height={250}
                  resizeMode="cover"
                />
              )}

              {/* Content */}
              <YStack paddingHorizontal="$4" gap="$3">
                <Text color="$color" fontSize={24} fontWeight="900">
                  {favorite.title}
                </Text>

                {favorite.description && (
                  <Text color="$color" fontSize={16} lineHeight={24}>
                    {favorite.description}
                  </Text>
                )}

                {favorite.url && (
                  <YStack gap="$2">
                    <Button
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$5"
                      height={44}
                      onPress={handleOpenUrl}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <XStack gap="$2" alignItems="center">
                        <Text fontSize={18}>🔗</Text>
                        <Text color="$primary" fontSize={15} fontWeight="600">
                          Open Link
                        </Text>
                      </XStack>
                    </Button>
                    <Text color="$muted" fontSize={12} numberOfLines={1}>
                      {favorite.url}
                    </Text>
                  </YStack>
                )}

                <Text color="$muted" fontSize={13}>
                  Added on {formatDate(favorite.createdAt)}
                </Text>
              </YStack>

              {/* Actions */}
              <YStack paddingHorizontal="$4" gap="$2" marginTop="$2">
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={() => {
                    onEdit(favorite);
                    onClose();
                  }}
                  pressStyle={{ opacity: 0.8 }}
                >
                  <Text color="white" fontWeight="700" fontSize={16}>
                    Edit Favorite
                  </Text>
                </Button>
                <Button
                  backgroundColor="transparent"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius="$6"
                  height={48}
                  onPress={handleDelete}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text color="#f44336" fontWeight="700" fontSize={16}>
                    Delete Favorite
                  </Text>
                </Button>
              </YStack>
            </YStack>
          </ScrollView>
        </Stack>
      </Stack>
    </Modal>
  );
}
