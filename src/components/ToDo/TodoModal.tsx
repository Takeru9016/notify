import { useEffect, useState } from 'react';
import { Modal, Platform, KeyboardAvoidingView } from 'react-native';
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
import DateTimePicker from '@react-native-community/datetimepicker';

import { Todo, TodoPriority } from '@/types';

type Props = {
  visible: boolean;
  todo?: Todo | null;
  onClose: () => void;
  onSave: (data: Omit<Todo, 'id' | 'createdAt' | 'createdBy'>) => void;
};

export function TodoModal({ visible, todo, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 3600000)); // 1 hour from now
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description);
      setDueDate(new Date(todo.dueDate));
      setPriority(todo.priority);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(new Date(Date.now() + 3600000));
      setPriority('medium');
    }
  }, [todo, visible]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate.getTime(),
      priority,
      isCompleted: todo?.isCompleted ?? false,
    });
    onClose();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
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
                paddingBottom: Math.max(insets.bottom, 20) + 80, // Extra space for tab bar + button
              }}
              showsVerticalScrollIndicator={true}
            >
              <YStack padding="$4" gap="$4">
                {/* Header */}
                <XStack alignItems="center" justifyContent="space-between">
                  <Text color="$color" fontSize={22} fontWeight="900">
                    {todo ? 'Edit Reminder' : 'New Reminder'}
                  </Text>
                  <Button unstyled onPress={onClose}>
                    <Text color="$muted" fontSize={28}>
                      ✕
                    </Text>
                  </Button>
                </XStack>

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
                    placeholder="Add details (optional)"
                    backgroundColor="$background"
                    borderColor="$borderColor"
                    borderRadius="$5"
                    minHeight={80}
                    fontSize={15}
                  />
                </YStack>

                {/* Date & Time */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Due Date & Time
                  </Text>
                  <XStack gap="$2">
                    <Button
                      flex={1}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$5"
                      height={44}
                      onPress={() => setShowDatePicker(true)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$color" fontSize={15}>
                        {formatDate(dueDate)}
                      </Text>
                    </Button>
                    <Button
                      flex={1}
                      backgroundColor="$background"
                      borderColor="$borderColor"
                      borderWidth={1}
                      borderRadius="$5"
                      height={44}
                      onPress={() => setShowTimePicker(true)}
                      pressStyle={{ opacity: 0.7 }}
                    >
                      <Text color="$color" fontSize={15}>
                        {formatTime(dueDate)}
                      </Text>
                    </Button>
                  </XStack>
                </YStack>

                {/* Priority */}
                <YStack gap="$2">
                  <Text color="$color" fontSize={14} fontWeight="600">
                    Priority
                  </Text>
                  <XStack gap="$2">
                    {(['low', 'medium', 'high'] as TodoPriority[]).map((p) => (
                      <Button
                        key={p}
                        flex={1}
                        backgroundColor={priority === p ? '$primary' : '$background'}
                        borderColor={priority === p ? '$primary' : '$borderColor'}
                        borderWidth={1}
                        borderRadius="$5"
                        height={44}
                        onPress={() => setPriority(p)}
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <Text
                          color={priority === p ? 'white' : '$color'}
                          fontSize={15}
                          fontWeight="600"
                          textTransform="capitalize"
                        >
                          {p}
                        </Text>
                      </Button>
                    ))}
                  </XStack>
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
                    {todo ? 'Update' : 'Create'} Reminder
                  </Text>
                </Button>
              </YStack>
            </ScrollView>
          </Stack>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="time"
              display="default"
              onChange={(event, date) => {
                setShowTimePicker(false);
                if (date) setDueDate(date);
              }}
            />
          )}
        </Stack>
      </KeyboardAvoidingView>
    </Modal>
  );
}