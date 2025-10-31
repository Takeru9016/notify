import { useState } from "react";
import { RefreshControl, Dimensions, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  ScrollView,
  Stack,
  Spinner,
} from "tamagui";

import { Sticker } from "@/types";
import { StickerCard, AddStickerModal } from "@/components";
import {
  useStickers,
  useCreateSticker,
  useDeleteSticker,
} from "@/hooks/useStickers";
import { useProfileStore } from "@/store/profile";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 56) / 3; // 3 columns with padding

export default function StickersScreen() {
  const pairId = useProfileStore((s) => s.profile?.pairId);

  const {
    data: stickers = [],
    isLoading,
    refetch,
    isRefetching,
  } = useStickers();
  const createSticker = useCreateSticker();
  const deleteSticker = useDeleteSticker();

  const [modalVisible, setModalVisible] = useState(false);

  const onRefresh = async () => {
    await refetch();
  };

  const handleAdd = () => {
    setModalVisible(true);
  };

  const handleSave = async (name: string, imageUrl: string) => {
    try {
      await createSticker.mutateAsync({
        name,
        imageUrl,
      });
      setModalVisible(false);
      Alert.alert("Success! 🎉", "Sticker created successfully");
    } catch (error) {
      console.error("Failed to create sticker:", error);
      Alert.alert("Error", "Failed to create sticker. Please try again.");
    }
  };

  const handleSend = async (sticker: Sticker) => {
    Alert.alert(
      "Send Sticker",
      `Send "${sticker.name}" to your partner?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            // TODO: Implement send notification in Phase 5
            Alert.alert(
              "Coming Soon! 💌",
              "Sticker notifications will be added in Phase 5"
            );
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Sticker",
      "Are you sure you want to delete this sticker?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSticker.mutateAsync(id);
            } catch (error) {
              console.error("Failed to delete sticker:", error);
              Alert.alert(
                "Error",
                "Failed to delete sticker. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLongPress = (sticker: Sticker) => {
    // Handled in StickerCard component
  };

  return (
    <YStack flex={1} backgroundColor="$bg">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading || isRefetching}
            onRefresh={onRefresh}
          />
        }
      >
        <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
          {/* Header */}
          <XStack alignItems="center" justifyContent="space-between">
            <Text color="$color" fontSize={28} fontWeight="900">
              Stickers
            </Text>
            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={40}
              paddingHorizontal="$4"
              onPress={handleAdd}
              disabled={!pairId || createSticker.isPending}
              opacity={pairId && !createSticker.isPending ? 1 : 0.5}
              pressStyle={{ opacity: 0.8 }}
            >
              {createSticker.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text color="white" fontWeight="700" fontSize={15}>
                  + Add
                </Text>
              )}
            </Button>
          </XStack>

          {/* Info */}
          <Stack backgroundColor="$background" borderRadius="$6" padding="$3">
            <Text color="$muted" fontSize={14} textAlign="center">
              Tap a sticker to send it to your partner 💌
            </Text>
          </Stack>

          {/* Grid */}
          {stickers.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$3"
            >
              <Text fontSize={60}>🎨</Text>
              <Text color="$muted" fontSize={16} textAlign="center">
                {pairId
                  ? "No stickers yet.\nTap + Add to create your first sticker!"
                  : "Pair to start creating stickers."}
              </Text>
            </YStack>
          ) : (
            <XStack flexWrap="wrap" gap="$2">
              {stickers.map((sticker) => (
                <Stack key={sticker.id} width={CARD_WIDTH}>
                  <StickerCard
                    sticker={sticker}
                    onSend={handleSend}
                    onDelete={handleDelete}
                    onLongPress={handleLongPress}
                  />
                </Stack>
              ))}
            </XStack>
          )}

          {/* Instructions */}
          {stickers.length > 0 && (
            <Stack
              backgroundColor="$background"
              borderRadius="$6"
              padding="$3"
              marginTop="$2"
            >
              <Text color="$muted" fontSize={13} textAlign="center">
                💡 Long press a sticker for more options
              </Text>
            </Stack>
          )}
        </YStack>
      </ScrollView>

      {/* Add Modal */}
      <AddStickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </YStack>
  );
}
