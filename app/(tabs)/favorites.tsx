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

import { Favorite, FavoriteCategory } from "@/types";
import {
  FavoriteCard,
  FavoriteDetailModal,
  FavoriteFormModal,
} from "@/components";
import {
  useFavorites,
  useCreateFavorite,
  useUpdateFavorite,
  useDeleteFavorite,
} from "@/hooks/useFavorites";
import { useProfileStore } from "@/store/profile";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding

type Filter = "all" | FavoriteCategory;

export default function FavoritesScreen() {
  const pairId = useProfileStore((s) => s.profile?.pairId);

  const {
    data: favorites = [],
    isLoading,
    refetch,
    isRefetching,
  } = useFavorites();
  const createFavorite = useCreateFavorite();
  const updateFavorite = useUpdateFavorite();
  const deleteFavorite = useDeleteFavorite();

  const [filter, setFilter] = useState<Filter>("all");
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [editingFavorite, setEditingFavorite] = useState<Favorite | null>(null);

  const onRefresh = async () => {
    await refetch();
  };

  const handleCardPress = (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    setDetailModalVisible(true);
  };

  const handleAdd = () => {
    setEditingFavorite(null);
    setFormModalVisible(true);
  };

  const handleEdit = (favorite: Favorite) => {
    setDetailModalVisible(false);
    setEditingFavorite(favorite);
    setFormModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFavorite.mutateAsync(id);
      setDetailModalVisible(false);
    } catch (error) {
      console.error("Failed to delete favorite:", error);
      Alert.alert("Error", "Failed to delete favorite. Please try again.");
    }
  };

  const handleSave = async (
    data: Omit<Favorite, "id" | "createdAt" | "createdBy">
  ) => {
    try {
      if (editingFavorite) {
        await updateFavorite.mutateAsync({
          id: editingFavorite.id,
          updates: {
            title: data.title,
            category: data.category,
            description: data.description,
            imageUrl: data.imageUrl,
            url: data.url,
          },
        });
      } else {
        await createFavorite.mutateAsync({
          title: data.title,
          category: data.category,
          description: data.description,
          imageUrl: data.imageUrl,
          url: data.url,
        });
      }
      setFormModalVisible(false);
      setEditingFavorite(null);
    } catch (error) {
      console.error("Failed to save favorite:", error);
      Alert.alert("Error", "Failed to save favorite. Please try again.");
    }
  };

  const filteredFavorites =
    filter === "all"
      ? favorites
      : favorites.filter((f) => f.category === filter);

  const filters: { value: Filter; label: string; emoji: string }[] = [
    { value: "all", label: "All", emoji: "⭐" },
    { value: "movie", label: "Movies", emoji: "🎬" },
    { value: "food", label: "Food", emoji: "🍕" },
    { value: "place", label: "Places", emoji: "📍" },
    { value: "quote", label: "Quotes", emoji: "💭" },
    { value: "link", label: "Links", emoji: "🔗" },
  ];

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
              Favorites
            </Text>
            <Button
              backgroundColor="$primary"
              borderRadius="$6"
              height={40}
              paddingHorizontal="$4"
              onPress={handleAdd}
              disabled={!pairId || createFavorite.isPending}
              opacity={pairId && !createFavorite.isPending ? 1 : 0.5}
              pressStyle={{ opacity: 0.8 }}
            >
              {createFavorite.isPending ? (
                <Spinner size="small" color="white" />
              ) : (
                <Text color="white" fontWeight="700" fontSize={15}>
                  + Add
                </Text>
              )}
            </Button>
          </XStack>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <XStack gap="$2">
              {filters.map((f) => (
                <Button
                  key={f.value}
                  backgroundColor={
                    filter === f.value ? "$primary" : "$background"
                  }
                  borderRadius="$5"
                  height={36}
                  paddingHorizontal="$3"
                  onPress={() => setFilter(f.value)}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <XStack gap="$1" alignItems="center">
                    <Text fontSize={14}>{f.emoji}</Text>
                    <Text
                      color={filter === f.value ? "white" : "$color"}
                      fontSize={14}
                      fontWeight="600"
                    >
                      {f.label}
                    </Text>
                  </XStack>
                </Button>
              ))}
            </XStack>
          </ScrollView>

          {/* Grid */}
          {filteredFavorites.length === 0 ? (
            <YStack
              flex={1}
              alignItems="center"
              justifyContent="center"
              gap="$3"
            >
              <Text fontSize={60}>⭐</Text>
              <Text color="$muted" fontSize={16} textAlign="center">
                {pairId
                  ? "No favorites yet.\nTap + Add to create one!"
                  : "Pair to start creating favorites."}
              </Text>
            </YStack>
          ) : (
            <XStack flexWrap="wrap" gap="$3">
              {filteredFavorites.map((fav) => (
                <Stack key={fav.id} width={CARD_WIDTH}>
                  <FavoriteCard favorite={fav} onPress={handleCardPress} />
                </Stack>
              ))}
            </XStack>
          )}
        </YStack>
      </ScrollView>

      {/* Detail Modal */}
      <FavoriteDetailModal
        visible={detailModalVisible}
        favorite={selectedFavorite}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedFavorite(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Form Modal */}
      <FavoriteFormModal
        visible={formModalVisible}
        favorite={editingFavorite}
        onClose={() => {
          setFormModalVisible(false);
          setEditingFavorite(null);
        }}
        onSave={handleSave}
      />
    </YStack>
  );
}
