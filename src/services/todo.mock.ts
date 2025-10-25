import { Todo } from '@/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let mockTodos: Todo[] = [
  {
    id: '1',
    title: 'Movie night',
    description: 'Watch the new Marvel movie together',
    dueDate: Date.now() + 86400000, // tomorrow
    isCompleted: false,
    priority: 'high',
    createdBy: 'user1',
    createdAt: Date.now() - 3600000,
  },
  {
    id: '2',
    title: 'Buy groceries',
    description: 'Milk, eggs, bread, coffee',
    dueDate: Date.now() + 7200000, // 2 hours
    isCompleted: false,
    priority: 'medium',
    createdBy: 'user2',
    createdAt: Date.now() - 7200000,
  },
  {
    id: '3',
    title: 'Anniversary dinner',
    description: 'Book restaurant reservation',
    dueDate: Date.now() + 604800000, // 1 week
    isCompleted: true,
    priority: 'high',
    createdBy: 'user1',
    createdAt: Date.now() - 86400000,
  },
];

export async function getTodos(): Promise<Todo[]> {
  await delay(300);
  return [...mockTodos];
}

export async function addTodo(todo: Omit<Todo, 'id' | 'createdAt'>): Promise<Todo> {
  await delay(400);
  const newTodo: Todo = {
    ...todo,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  mockTodos.push(newTodo);
  return newTodo;
}

export async function updateTodo(id: string, updates: Partial<Todo>): Promise<void> {
  await delay(400);
  const index = mockTodos.findIndex((t) => t.id === id);
  if (index !== -1) {
    mockTodos[index] = { ...mockTodos[index], ...updates };
  }
}

export async function deleteTodo(id: string): Promise<void> {
  await delay(300);
  mockTodos = mockTodos.filter((t) => t.id !== id);
}