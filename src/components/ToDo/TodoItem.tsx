import { useState } from 'react';
import { Alert } from 'react-native';
import { XStack, YStack, Text, Stack, Button } from 'tamagui';
import { Swipeable } from 'react-native-gesture-handler';

import { Todo } from '@/types';

type Props = {
  todo: Todo;
  onToggle: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
};

export function TodoItem({ todo, onToggle, onEdit, onDelete }: Props) {
  const [swiping, setSwiping] = useState(false);

  const formatDate = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow =
      date.toDateString() === new Date(now.getTime() + 86400000).toDateString();

    if (isToday) return `Today ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    if (isTomorrow) return `Tomorrow ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const getPriorityColor = () => {
    if (todo.priority === 'high') return '#ff7b7b';
    if (todo.priority === 'medium') return '#ffa726';
    return '#66bb6a';
  };

  const handleDelete = () => {
    Alert.alert('Delete Todo', 'Are you sure you want to delete this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(todo.id) },
    ]);
  };

  const renderRightActions = () => (
    <XStack gap="$2" paddingLeft="$2">
      <Button
        backgroundColor="#2196f3"
        borderRadius="$5"
        width={70}
        onPress={() => onEdit(todo)}
        pressStyle={{ opacity: 0.8 }}
      >
        <Text color="white" fontWeight="700" fontSize={14}>
          Edit
        </Text>
      </Button>
      <Button
        backgroundColor="#f44336"
        borderRadius="$5"
        width={70}
        onPress={handleDelete}
        pressStyle={{ opacity: 0.8 }}
      >
        <Text color="white" fontWeight="700" fontSize={14}>
          Delete
        </Text>
      </Button>
    </XStack>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableWillOpen={() => setSwiping(true)}
      onSwipeableClose={() => setSwiping(false)}
    >
      <Stack
        backgroundColor="$background"
        borderRadius="$6"
        padding="$3"
        marginBottom="$2"
        opacity={todo.isCompleted ? 0.6 : 1}
      >
        <XStack gap="$3" alignItems="flex-start">
          {/* Checkbox */}
          <Button
            unstyled
            width={24}
            height={24}
            borderRadius={12}
            borderWidth={2}
            borderColor={todo.isCompleted ? '$primary' : '$borderColor'}
            backgroundColor={todo.isCompleted ? '$primary' : 'transparent'}
            alignItems="center"
            justifyContent="center"
            onPress={() => onToggle(todo.id)}
            marginTop={2}
          >
            {todo.isCompleted && (
              <Text color="white" fontSize={14} fontWeight="900">
                ✓
              </Text>
            )}
          </Button>

          {/* Content */}
          <YStack flex={1} gap="$1">
            <Text
              color="$color"
              fontSize={16}
              fontWeight="700"
              textDecorationLine={todo.isCompleted ? 'line-through' : 'none'}
            >
              {todo.title}
            </Text>
            {todo.description ? (
              <Text
                color="$muted"
                fontSize={14}
                numberOfLines={2}
                textDecorationLine={todo.isCompleted ? 'line-through' : 'none'}
              >
                {todo.description}
              </Text>
            ) : null}
            <XStack gap="$2" alignItems="center" marginTop="$1">
              <Text color="$muted" fontSize={12}>
                {formatDate(todo.dueDate)}
              </Text>
              <Stack
                width={8}
                height={8}
                borderRadius={4}
                backgroundColor={getPriorityColor()}
              />
            </XStack>
          </YStack>
        </XStack>
      </Stack>
    </Swipeable>
  );
}