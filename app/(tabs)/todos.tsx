import { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { YStack, XStack, Text, Button, ScrollView } from "tamagui";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { TodoItem, TodoModal } from "@/components";
import { Todo } from "@/types";
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
} from "@/services/mock/todo.mock";

type Filter = "all" | "active" | "completed";

export default function TodosScreen() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const data = await getTodos();
    setTodos(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleToggle = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo) return;
    await updateTodo(id, { isCompleted: !todo.isCompleted });
    await load();
  };

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id);
    await load();
  };

  const handleSave = async (
    data: Omit<Todo, "id" | "createdAt" | "createdBy">
  ) => {
    if (editingTodo) {
      await updateTodo(editingTodo.id, data);
    } else {
      await addTodo({ ...data, createdBy: "user1" });
    }
    await load();
    setEditingTodo(null);
  };

  const handleAdd = () => {
    setEditingTodo(null);
    setModalVisible(true);
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === "active") return !t.isCompleted;
    if (filter === "completed") return t.isCompleted;
    return true;
  });

  const groupedTodos = {
    overdue: filteredTodos.filter(
      (t) => !t.isCompleted && t.dueDate < Date.now()
    ),
    today: filteredTodos.filter((t) => {
      const today = new Date().toDateString();
      return !t.isCompleted && new Date(t.dueDate).toDateString() === today;
    }),
    upcoming: filteredTodos.filter((t) => {
      const today = new Date().toDateString();
      return (
        !t.isCompleted &&
        t.dueDate > Date.now() &&
        new Date(t.dueDate).toDateString() !== today
      );
    }),
    completed: filteredTodos.filter((t) => t.isCompleted),
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <YStack flex={1} backgroundColor="$bg">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <YStack flex={1} padding="$4" paddingTop="$6" gap="$4">
            {/* Header */}
            <XStack alignItems="center" justifyContent="space-between">
              <Text color="$color" fontSize={28} fontWeight="900">
                Reminders
              </Text>
              <Button
                backgroundColor="$primary"
                borderRadius="$6"
                height={40}
                paddingHorizontal="$4"
                onPress={handleAdd}
                pressStyle={{ opacity: 0.8 }}
              >
                <Text color="white" fontWeight="700" fontSize={15}>
                  + Add
                </Text>
              </Button>
            </XStack>

            {/* Filter Tabs */}
            <XStack gap="$2">
              {(["all", "active", "completed"] as Filter[]).map((f) => (
                <Button
                  key={f}
                  flex={1}
                  backgroundColor={filter === f ? "$primary" : "$background"}
                  borderRadius="$5"
                  height={36}
                  onPress={() => setFilter(f)}
                  pressStyle={{ opacity: 0.7 }}
                >
                  <Text
                    color={filter === f ? "white" : "$color"}
                    fontSize={14}
                    fontWeight="600"
                    textTransform="capitalize"
                  >
                    {f}
                  </Text>
                </Button>
              ))}
            </XStack>

            {/* Todos List */}
            {filteredTodos.length === 0 ? (
              <YStack
                flex={1}
                alignItems="center"
                justifyContent="center"
                gap="$3"
              >
                <Text fontSize={60}>📝</Text>
                <Text color="$muted" fontSize={16} textAlign="center">
                  {filter === "completed"
                    ? "No completed reminders yet"
                    : "No reminders yet.\nTap + Add to create one!"}
                </Text>
              </YStack>
            ) : (
              <YStack gap="$4">
                {/* Overdue */}
                {groupedTodos.overdue.length > 0 && (
                  <YStack gap="$2">
                    <Text color="#f44336" fontSize={16} fontWeight="700">
                      Overdue ({groupedTodos.overdue.length})
                    </Text>
                    {groupedTodos.overdue.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Today */}
                {groupedTodos.today.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      Today ({groupedTodos.today.length})
                    </Text>
                    {groupedTodos.today.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Upcoming */}
                {groupedTodos.upcoming.length > 0 && (
                  <YStack gap="$2">
                    <Text color="$color" fontSize={16} fontWeight="700">
                      Upcoming ({groupedTodos.upcoming.length})
                    </Text>
                    {groupedTodos.upcoming.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}

                {/* Completed */}
                {groupedTodos.completed.length > 0 && filter !== "active" && (
                  <YStack gap="$2">
                    <Text color="$muted" fontSize={16} fontWeight="700">
                      Completed ({groupedTodos.completed.length})
                    </Text>
                    {groupedTodos.completed.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </YStack>
                )}
              </YStack>
            )}
          </YStack>
        </ScrollView>

        {/* Add/Edit Modal */}
        <TodoModal
          visible={modalVisible}
          todo={editingTodo}
          onClose={() => {
            setModalVisible(false);
            setEditingTodo(null);
          }}
          onSave={handleSave}
        />
      </YStack>
    </GestureHandlerRootView>
  );
}
