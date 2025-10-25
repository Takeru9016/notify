export type TodoPriority = 'low' | 'medium' | 'high';

export type Todo = {
  id: string;
  title: string;
  description: string;
  dueDate: number; // timestamp
  isCompleted: boolean;
  priority: TodoPriority;
  createdBy: string; // uid
  createdAt: number;
};

export type FavoriteCategory = 'movie' | 'food' | 'place' | 'quote' | 'link' | 'other';

export type Favorite = {
  id: string;
  title: string;
  category: FavoriteCategory;
  description: string;
  imageUrl?: string;
  url?: string;
  createdBy: string;
  createdAt: number;
};

export type Sticker = {
  id: string;
  name: string;
  imageUrl: string;
  createdBy: string;
  createdAt: number;
};

export type NotificationType = 'sticker' | 'todo' | 'favorite' | 'note';

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  imageUrl?: string;
  createdBy: string;
  createdAt: number;
  read: boolean;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  pairId?: string;
};