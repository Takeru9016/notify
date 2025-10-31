import { useEffect, useState } from "react";
import { Modal, Platform, KeyboardAvoidingView, Alert } from "react-native";
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Stack,
  ScrollView,
  Spinner,
  Image,
} from "tamagui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

import { Favorite, FavoriteCategory } from "@/types";
import { CloudinaryStorage } from "@/services/storage/cloudinary.adapter";

type Props = {
  visible: boolean;
  favorite?: Favorite | null;
  onClose: () => void;
  onSave: (data: Omit<Favorite, "id" | "createdAt" | "createdBy">) => void;
};

const categories: { value: FavoriteCategory; label: string; emoji: string }[] =
  [
    { value: "movie", label: "Movie", emoji: "🎬" },
    { value: "food", label: "Food", emoji: "🍕" },
    { value: "place", label: "Place", emoji: "📍" },
    { value: "quote", label: "Quote", emoji: "💭" },
    { value: "link", label: "Link", emoji: "🔗" },
    { value: "other", label: "Other", emoji: "⭐" },
  ];

export function FavoriteFormModal({
  visible,
  favorite,
  onClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FavoriteCategory>("other");
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | undefined>();

  useEffect(() => {
    if (favorite) {
      setTitle(favorite.title);
      setDescription(favorite.description);
      setCategory(favorite.category);
      setImageUrl(favorite.imageUrl);
      setUrl(favorite.url);
      setLocalPreview(favorite.imageUrl);
    } else {
      setTitle("");
      setDescription("");
      setCategory("other");
      setImageUrl(undefined);
      setUrl(undefined);
      setLocalPreview(undefined);
    }
  }, [favorite, visible]);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a title for your favorite");
      return;
    }

    if (uploading) {
      Alert.alert(
        "Upload in progress",
        "Please wait for image upload to complete"
      );
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl,
      url: url?.trim(),
    });
    onClose();
  };

  const pickImage = async () => {
    console.log("📷 [FavoriteFormModal] Requesting media library permissions");

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      console.warn("⚠️ [FavoriteFormModal] Permission denied");
      Alert.alert("Permission needed", "Please grant photo library access");
      return;
    }

    console.log("📷 [FavoriteFormModal] Launching image picker");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (result.canceled) {
      console.log("❌ [FavoriteFormModal] Image picker canceled");
      return;
    }

    if (!result.assets[0]) {
      console.error("❌ [FavoriteFormModal] No asset selected");
      return;
    }

    const localUri = result.assets[0].uri;
    console.log("✅ [FavoriteFormModal] Image selected:", localUri);

    // Show local preview immediately
    setLocalPreview(localUri);
    setUploading(true);

    try {
      console.log("☁️ [FavoriteFormModal] Starting Cloudinary upload");
      const result = await CloudinaryStorage.upload(localUri, {
        folder: "favorites",
      });
      console.log("✅ [FavoriteFormModal] Upload successful:", result.url);

      setImageUrl(result.url);
      setLocalPreview(result.url);
      Alert.alert("Success", "Image uploaded successfully!");
    } catch (error) {
      console.error("❌ [FavoriteFormModal] Upload failed:", error);
      Alert.alert("Upload failed", "Could not upload image. Please try again.");
      setLocalPreview(undefined);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl(undefined);
    setLocalPreview(undefined);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
                paddingBottom: Math.max(insets.bottom, 20) + 80,
              }}
              showsVerticalScrollIndicator={true}
            >
              <YStack padding="$4" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$color" fontSize={22} fontWeight="900">
                    {favorite ? "Edit Favorite" : "New Favorite"}
                  </Text>
                  <Button unstyled onPress={onClose}>
                    <Text color="$muted" fontSize={28}>
                      ✕
                    </Text>
                  </Button>
                </XStack>

                {/* Category */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Category
                  </Text>
                  <XStack gap="$2" flexWrap="wrap">
                    {categories.map((cat) => (
                      <Button
                        key={cat.value}
                        backgroundColor={
                          category === cat.value ? "$primary" : "$background"
                        }
                        borderColor={
                          category === cat.value ? "$primary" : "$borderColor"
                        }
                        borderWidth={1}
                        borderRadius="$5"
                        height={40}
                        paddingHorizontal="$3"
                        onPress={() => setCategory(cat.value)}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <XStack gap="$1" alignItems="center">
                          <Text fontSize={16}>{cat.emoji}</Text>
                          <Text
                            color={category === cat.value ? "white" : "$color"}
                            fontSize={14}
                            fontWeight="600"
                          >
                            {cat.label}
                          </Text>
                        </XStack>
                      </Button>
                    ))}
                  </XStack>
                </YStack>

                {/* Title */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Title
                  </Text>
                  <Input
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter title"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                  />
                </YStack>

                {/* Description */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Description
                  </Text>
                  <TextArea
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Add details"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    minHeight={80}
                    fontSize={15}
                  />
                </YStack>

                {/* URL (optional) */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Link (Optional)
                  </Text>
                  <Input
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://..."
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    height={44}
                    fontSize={15}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </YStack>

                {/* Image Picker */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Image (Optional)
                  </Text>

                  {/* Image Preview */}
                  {localPreview && (
                    <Stack
                      backgroundColor="$background"
                      borderRadius="$5"
                      overflow="hidden"
                      position="relative"
                    >
                      <Image
                        source={{ uri: localPreview }}
                        width="100%"
                        height={200}
                        resizeMode="cover"
                      />
                      {uploading && (
                        <Stack
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          backgroundColor="rgba(0,0,0,0.6)"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Spinner size="large" color="white" />
                          <Text color="white" fontSize={14} marginTop="$2">
                            Uploading...
                          </Text>
                        </Stack>
                      )}
                      {!uploading && (
                        <Button
                          position="absolute"
                          top="$2"
                          right="$2"
                          backgroundColor="rgba(0,0,0,0.7)"
                          borderRadius="$7"
                          width={32}
                          height={32}
                          padding={0}
                          onPress={removeImage}
                          pressStyle={{ opacity: 0.8 }}
                        >
                          <Text color="white" fontSize={18}>
                            ✕
                          </Text>
                        </Button>
                      )}
                    </Stack>
                  )}

                  {/* Pick Image Button */}
                  <Button
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$5"
                    height={44}
                    onPress={pickImage}
                    disabled={uploading}
                    opacity={uploading ? 0.5 : 1}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <XStack gap="$2" alignItems="center">
                      {uploading ? (
                        <Spinner size="small" />
                      ) : (
                        <Text fontSize={18}>📷</Text>
                      )}
                      <Text color="$color" fontSize={15} fontWeight="600">
                        {uploading
                          ? "Uploading..."
                          : localPreview
                          ? "Change Image"
                          : "Pick Image"}
                      </Text>
                    </XStack>
                  </Button>
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={handleSave}
                  disabled={!title.trim() || uploading}
                  opacity={!title.trim() || uploading ? 0.5 : 1}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                >
                  {uploading ? (
                    <XStack gap="$2" alignItems="center">
                      <Spinner size="small" color="white" />
                      <Text color="white" fontWeight="700" fontSize={16}>
                        Uploading...
                      </Text>
                    </XStack>
                  ) : (
                    <Text color="white" fontWeight="700" fontSize={16}>
                      {favorite ? "Update" : "Add"} Favorite
                    </Text>
                  )}
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}
