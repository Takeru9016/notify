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
import { StickerService } from "@/services/sticker/sticker.service";
import { Sticker } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreatePayload = {
  name: string;
  imageUrl: string;
};

type UpdatePayload = {
  id: string;
  name: string;
};

const key = (pairId?: string) => ["stickers", pairId || "none"] as const;

export function useStickers() {
  const pairId = useProfileStore((s) => s.profile?.pairId);
  const qc = useQueryClient();

  console.log("🔄 [useStickers] Hook called with pairId:", pairId);

  // Set up real-time listener
  useEffect(() => {
    if (!pairId) {
      console.log("⚠️ [useStickers] No pairId, skipping listener");
      return;
    }

    console.log(
      "👂 [useStickers] Setting up real-time listener for pairId:",
      pairId
    );

    const q = query(
      collection(db, "stickers"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(
          "🔔 [useStickers] Real-time update received:",
          snapshot.docs.length,
          "stickers"
        );

        const stickers: Sticker[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: String(data.name ?? ""),
            imageUrl: String(data.imageUrl ?? ""),
            createdBy: String(data.createdBy ?? ""),
            createdAt: Number(data.createdAt ?? 0),
          };
        });

        // Update React Query cache directly
        qc.setQueryData<Sticker[]>(key(pairId), stickers);
      },
      (error) => {
        console.error("❌ [useStickers] Listener error:", error);
      }
    );

    return () => {
      console.log("🔌 [useStickers] Unsubscribing from real-time listener");
      unsubscribe();
    };
  }, [pairId, qc]);

  return useQuery({
    queryKey: key(pairId),
    queryFn: () => {
      console.log(
        "🔄 [useStickers] Query function executing for pairId:",
        pairId
      );
      return StickerService.listByPair();
    },
    enabled: !!pairId,
    staleTime: 30_000,
    refetchOnMount: "always",
  });
}

export function useCreateSticker() {
  return useMutation({
    mutationFn: (payload: CreatePayload) => {
      console.log("➕ [useCreateSticker] Mutation called with:", payload);
      return StickerService.create(payload);
    },
    onSuccess: async (newId) => {
      console.log("✅ [useCreateSticker] Success, created ID:", newId);
    },
    onError: (error) => {
      console.error("❌ [useCreateSticker] Error:", error);
    },
  });
}

export function useUpdateSticker() {
  return useMutation({
    mutationFn: ({ id, name }: UpdatePayload) => {
      console.log(
        "✏️ [useUpdateSticker] Mutation called for id:",
        id,
        "name:",
        name
      );
      return StickerService.update(id, { name });
    },
    onError: (error) => {
      console.error("❌ [useUpdateSticker] Error:", error);
    },
    onSuccess: (_, vars) => {
      console.log("✅ [useUpdateSticker] Success for id:", vars.id);
    },
  });
}

export function useDeleteSticker() {
  return useMutation({
    mutationFn: (id: string) => {
      console.log("🗑️ [useDeleteSticker] Mutation called for id:", id);
      return StickerService.remove(id);
    },
    onError: (error) => {
      console.error("❌ [useDeleteSticker] Error:", error);
    },
    onSuccess: (_, id) => {
      console.log("✅ [useDeleteSticker] Success for id:", id);
    },
  });
}
