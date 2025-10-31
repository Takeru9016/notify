import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
  limit,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { FavoriteService } from "@/services/favorites/favorites.service";
import { Favorite, FavoriteCategory } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreatePayload = {
  title: string;
  category: FavoriteCategory;
  description: string;
  imageUrl?: string;
  url?: string;
};

type UpdatePayload = {
  id: string;
  updates: Partial<Omit<Favorite, "id" | "createdBy" | "createdAt">>;
};

const key = (pairId?: string) => ["favorites", pairId || "none"] as const;

export function useFavorites() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  console.log("🔄 [useFavorites] Hook called with pairId:", pairId);

  // Set up real-time listener
  useEffect(() => {
    if (!pairId) {
      console.log("⚠️ [useFavorites] No pairId, skipping listener");
      return;
    }

    console.log(
      "👂 [useFavorites] Setting up real-time listener for pairId:",
      pairId
    );

    const q = query(
      collection(db, "favorites"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "🔔 [useFavorites] Real-time update received:",
          snapshot.docs.length,
          "favorites"
        );

        const favorites: Favorite[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            title: String(data.title ?? ""),
            category: (data.category as FavoriteCategory) || "other",
            description: String(data.description ?? ""),
            imageUrl: data.imageUrl ? String(data.imageUrl) : undefined,
            url: data.url ? String(data.url) : undefined,
            createdBy: String(data.createdBy ?? ""),
            createdAt: Number(data.createdAt ?? 0),
          };
        });

        // Update React Query cache directly
        qc.setQueryData<Favorite[]>(key(pairId), favorites);
      },
      (error) => {
        console.error("❌ [useFavorites] Listener error:", error);
      }
    );

    return () => {
      console.log("🔌 [useFavorites] Unsubscribing from real-time listener");
      unsubscribe();
    };
  }, [pairId, qc]);

  return useQuery({
    queryKey: key(pairId),
    queryFn: () => {
      console.log(
        "🔄 [useFavorites] Query function executing for pairId:",
        pairId
      );
      return FavoriteService.listByPair();
    },
    enabled: !!pairId,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateFavorite() {
  return useMutation({
    mutationFn: (payload: CreatePayload) => {
      console.log("➕ [useCreateFavorite] Mutation called with:", payload);
      return FavoriteService.create(payload);
    },
    onSuccess: async (newId) => {
      console.log("✅ [useCreateFavorite] Success, created ID:", newId);
    },
    onError: (error) => {
      console.error("❌ [useCreateFavorite] Error:", error);
    },
  });
}

export function useUpdateFavorite() {
  return useMutation({
    mutationFn: ({ id, updates }: UpdatePayload) => {
      console.log(
        "✏️ [useUpdateFavorite] Mutation called for id:",
        id,
        "updates:",
        updates
      );

      const { createdAt, createdBy, id: _ignore, ...safe } = updates as any;

      console.log("✏️ [useUpdateFavorite] Safe updates after stripping:", safe);
      return FavoriteService.update(id, safe);
    },
    onError: (error) => {
      console.error("❌ [useUpdateFavorite] Error:", error);
    },
    onSuccess: (_, vars) => {
      console.log("✅ [useUpdateFavorite] Success for id:", vars.id);
    },
  });
}

export function useDeleteFavorite() {
  return useMutation({
    mutationFn: (id: string) => {
      console.log("🗑️ [useDeleteFavorite] Mutation called for id:", id);
      return FavoriteService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteFavorite] Error:", error);
    },
    onSuccess: (_, id) => {
      console.log("✅ [useDeleteFavorite] Success for id:", id);
    },
  });
}
