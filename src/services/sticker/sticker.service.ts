import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { getCurrentUserId } from "@/services/auth/auth.service";
import { Sticker } from "@/types";
import { useProfileStore } from "@/store/profile";

type CreateStickerInput = {
  name: string;
  imageUrl: string;
};

type UpdateStickerInput = {
  name: string;
};

function nowMs(): number {
  return Date.now();
}

function requirePairId(): string {
  const profile = useProfileStore.getState().profile;
  console.log("🔍 [StickerService] Current profile:", profile);

  const pairId = profile?.pairId;
  if (!pairId) {
    console.error("❌ [StickerService] No pairId found in profile");
    throw new Error("Pair not established");
  }

  console.log("✅ [StickerService] Using pairId:", pairId);
  return pairId;
}

export const StickerService = {
  async listByPair(): Promise<Sticker[]> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    console.log(
      "📋 [StickerService.listByPair] Querying stickers for pairId:",
      pairId,
      "uid:",
      uid
    );

    const q = query(
      collection(db, "stickers"),
      where("pairId", "==", pairId),
      orderBy("createdAt", "desc"),
      limit(500)
    );

    const snap = await getDocs(q);
    console.log(
      "📋 [StickerService.listByPair] Found",
      snap.docs.length,
      "stickers"
    );

    const stickers = snap.docs.map((d) => {
      const data = d.data() as any;
      console.log("📄 [StickerService.listByPair] Sticker doc:", d.id, data);

      const sticker: Sticker = {
        id: d.id,
        name: String(data.name ?? ""),
        imageUrl: String(data.imageUrl ?? ""),
        createdBy: String(data.createdBy ?? ""),
        createdAt: Number(data.createdAt ?? 0),
      };
      return sticker;
    });

    return stickers;
  },

  async create(input: CreateStickerInput): Promise<string> {
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("❌ [StickerService.create] Not authenticated");
      throw new Error("Not authenticated");
    }

    const pairId = requirePairId();

    const payload = {
      pairId,
      name: input.name,
      imageUrl: input.imageUrl,
      createdBy: uid,
      createdAt: nowMs(),
      updatedAt: serverTimestamp(),
    };

    console.log(
      "➕ [StickerService.create] Creating sticker with payload:",
      payload
    );

    try {
      const ref = await addDoc(collection(db, "stickers"), payload);
      console.log(
        "✅ [StickerService.create] Created sticker with ID:",
        ref.id
      );
      return ref.id;
    } catch (error) {
      console.error("❌ [StickerService.create] Error:", error);
      throw error;
    }
  },

  async update(id: string, updates: UpdateStickerInput): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    console.log(
      "✏️ [StickerService.update] Updating sticker:",
      id,
      "updates:",
      updates,
      "uid:",
      uid,
      "pairId:",
      pairId
    );

    const ref = doc(db, "stickers", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.error("❌ [StickerService.update] Sticker not found:", id);
        throw new Error("Sticker not found");
      }

      const data = snap.data() as any;
      console.log("📄 [StickerService.update] Current sticker data:", data);

      if (data.pairId !== pairId) {
        console.error(
          "❌ [StickerService.update] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      const patch: Record<string, any> = {
        name: updates.name,
        updatedAt: serverTimestamp(),
      };

      console.log("📝 [StickerService.update] Applying patch:", patch);

      await updateDoc(ref, patch);
      console.log(
        "✅ [StickerService.update] Successfully updated sticker:",
        id
      );
    } catch (error) {
      console.error(
        "❌ [StickerService.update] Error updating sticker:",
        error
      );
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const pairId = requirePairId();
    const uid = getCurrentUserId();

    console.log(
      "🗑️ [StickerService.remove] Deleting sticker:",
      id,
      "uid:",
      uid,
      "pairId:",
      pairId
    );

    const ref = doc(db, "stickers", id);

    try {
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        console.warn("⚠️ [StickerService.remove] Sticker not found:", id);
        return;
      }

      const data = snap.data() as any;
      console.log("📄 [StickerService.remove] Current sticker data:", data);

      if (data.pairId !== pairId) {
        console.error(
          "❌ [StickerService.remove] PairId mismatch. Doc pairId:",
          data.pairId,
          "Current pairId:",
          pairId
        );
        throw new Error("Forbidden: not in this pair");
      }

      await deleteDoc(ref);
      console.log(
        "✅ [StickerService.remove] Successfully deleted sticker:",
        id
      );
    } catch (error) {
      console.error(
        "❌ [StickerService.remove] Error deleting sticker:",
        error
      );
      throw error;
    }
  },
};
