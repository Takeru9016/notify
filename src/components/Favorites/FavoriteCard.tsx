import { Image } from 'tamagui';
import { YStack, XStack, Text, Stack, Button } from 'tamagui';

import { Favorite, FavoriteCategory } from '@/types';

type Props = {
  favorite: Favorite;
  onPress: (favorite: Favorite) => void;
};

const categoryEmojis: Record<FavoriteCategory, string> = {
  movie: '🎬',
  food: '🍕',
  place: '📍',
  quote: '💭',
  link: '🔗',
  other: '⭐',
};

const categoryColors: Record<FavoriteCategory, string> = {
  movie: '#e91e63',
  food: '#ff9800',
  place: '#4caf50',
  quote: '#9c27b0',
  link: '#2196f3',
  other: '#607d8b',
};

export function FavoriteCard({ favorite, onPress }: Props) {
  return (
    <Button
      unstyled
      onPress={() => onPress(favorite)}
      pressStyle={{ opacity: 0.8 }}
    >
      <YStack
        backgroundColor="$background"
        borderRadius="$6"
        overflow="hidden"
        gap="$2"
      >
        {/* Image */}
        {favorite.imageUrl ? (
          <Image
            source={{ uri: favorite.imageUrl }}
            width="100%"
            height={140}
            resizeMode="cover"
          />
        ) : (
          <Stack
            width="100%"
            height={140}
            backgroundColor={categoryColors[favorite.category]}
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize={48}>{categoryEmojis[favorite.category]}</Text>
          </Stack>
        )}

        {/* Content */}
        <YStack padding="$3" gap="$1">
          <XStack alignItems="center" gap="$2">
            <Text fontSize={16}>{categoryEmojis[favorite.category]}</Text>
            <Text
              color="$muted"
              fontSize={11}
              fontWeight="600"
              textTransform="uppercase"
              letterSpacing={0.5}
            >
              {favorite.category}
            </Text>
          </XStack>
          <Text
            color="$color"
            fontSize={15}
            fontWeight="700"
            numberOfLines={2}
          >
            {favorite.title}
          </Text>
          {favorite.description && (
            <Text color="$muted" fontSize={13} numberOfLines={2}>
              {favorite.description}
            </Text>
          )}
        </YStack>
      </YStack>
    </Button>
  );
}