import { useEffect, useState } from 'react';
import { Modal, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import {
  YStack,
  XStack,
  Text,
  Button,
  Input,
  TextArea,
  Stack,
  ScrollView,
} from 'tamagui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Favorite, FavoriteCategory } from '@/types';

type Props = {
  visible: boolean;
  favorite?: Favorite | null;
  onClose: () => void;
  onSave: (data: Omit<Favorite, 'id' | 'createdAt' | 'createdBy'>) => void;
};

const categories: { value: FavoriteCategory; label: string; emoji: string }[] = [
  { value: 'movie', label: 'Movie', emoji: '🎬' },
  { value: 'food', label: 'Food', emoji: '🍕' },
  { value: 'place', label: 'Place', emoji: '📍' },
  { value: 'quote', label: 'Quote', emoji: '💭' },
  { value: 'link', label: 'Link', emoji: '🔗' },
  { value: 'other', label: 'Other', emoji: '⭐' },
];

export function FavoriteFormModal({ visible, favorite, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<FavoriteCategory>('other');
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [url, setUrl] = useState<string | undefined>();

  useEffect(() => {
    if (favorite) {
      setTitle(favorite.title);
      setDescription(favorite.description);
      setCategory(favorite.category);
      setImageUrl(favorite.imageUrl);
      setUrl(favorite.url);
    } else {
      setTitle('');
      setDescription('');
      setCategory('other');
      setImageUrl(undefined);
      setUrl(undefined);
    }
  }, [favorite, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
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
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Stack flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
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
                    {favorite ? 'Edit Favorite' : 'New Favorite'}
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
                        backgroundColor={category === cat.value ? '$primary' : '$background'}
                        borderColor={category === cat.value ? '$primary' : '$borderColor'}
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
                            color={category === cat.value ? 'white' : '$color'}
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
                  <Button
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderWidth={1}
                    borderRadius="$5"
                    height={44}
                    onPress={pickImage}
                    pressStyle={{ opacity: 0.7 }}
                  >
                    <XStack gap="$2" alignItems="center">
                      <Text fontSize={18}>📷</Text>
                      <Text color="$color" fontSize={15} fontWeight="600">
                        {imageUrl ? 'Change Image' : 'Pick Image'}
                      </Text>
                    </XStack>
                  </Button>
                  {imageUrl && (
                    <Text color="$muted" fontSize={12}>
                      Image selected ✓
                    </Text>
                  )}
                </YStack>

                {/* Save Button */}
                <Button
                  backgroundColor="$primary"
                  borderRadius="$6"
                  height={48}
                  onPress={handleSave}
                  disabled={!title.trim()}
                  opacity={!title.trim() ? 0.5 : 1}
                  pressStyle={{ opacity: 0.8 }}
                  marginTop="$2"
                >
                  <Text color="white" fontWeight="700" fontSize={16}>
                    {favorite ? 'Update' : 'Add'} Favorite
                  </Text>
                </Button>
              </YStack>
            </ScrollView>
          </Stack>
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}