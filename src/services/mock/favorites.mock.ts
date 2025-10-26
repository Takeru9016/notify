import { Favorite } from '@/types';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let mockFavorites: Favorite[] = [
  {
    id: '1',
    title: 'Inception',
    category: 'movie',
    description: 'Mind-bending sci-fi thriller',
    imageUrl: 'https://picsum.photos/seed/movie1/400/600',
    url: 'https://www.imdb.com/title/tt1375666/', // Valid IMDB link
    createdBy: 'user1',
    createdAt: Date.now() - 86400000,
  },
  {
    id: '2',
    title: 'Pasta Carbonara',
    category: 'food',
    description: 'Our favorite Italian dish',
    imageUrl: 'https://picsum.photos/seed/food1/400/400',
    url: 'https://www.allrecipes.com/recipe/11973/linguine-carbonara/', // Recipe link
    createdBy: 'user2',
    createdAt: Date.now() - 172800000,
  },
  {
    id: '3',
    title: 'Central Park',
    category: 'place',
    description: 'Where we had our first date',
    imageUrl: 'https://picsum.photos/seed/place1/400/300',
    url: 'https://www.centralparknyc.org/', // Official website
    createdBy: 'user1',
    createdAt: Date.now() - 259200000,
  },
  {
    id: '4',
    title: 'Favorite Quote',
    category: 'quote',
    description: '"The best time for new beginnings is now."',
    createdBy: 'user2',
    createdAt: Date.now() - 345600000,
  },
  {
    id: '5',
    title: 'React Native Docs',
    category: 'link',
    description: 'Useful resource for development',
    url: 'https://reactnative.dev/',
    createdBy: 'user1',
    createdAt: Date.now() - 432000000,
  },
];

export async function getFavorites(): Promise<Favorite[]> {
  await delay(300);
  return [...mockFavorites];
}

export async function addFavorite(fav: Omit<Favorite, 'id' | 'createdAt'>): Promise<Favorite> {
  await delay(400);
  const newFav: Favorite = {
    ...fav,
    id: Date.now().toString(),
    createdAt: Date.now(),
  };
  mockFavorites.push(newFav);
  return newFav;
}

export async function updateFavorite(id: string, updates: Partial<Favorite>): Promise<void> {
  await delay(400);
  const index = mockFavorites.findIndex((f) => f.id === id);
  if (index !== -1) {
    mockFavorites[index] = { ...mockFavorites[index], ...updates };
  }
}

export async function deleteFavorite(id: string): Promise<void> {
  await delay(300);
  mockFavorites = mockFavorites.filter((f) => f.id !== id);
}