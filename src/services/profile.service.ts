import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { db } from "@/config/firebase";
import { UserProfile } from "@/types";
import { getCurrentUserId } from "./auth/auth.service";

/**
 * Get user profile from Firestore
 */
export async function getProfile(): Promise<UserProfile | null> {
  const uid = getCurrentUserId();
  if (!uid) {
    console.error("❌ No user ID available");
    return null;
  }

  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        uid: data.uid || uid,
        displayName: data.displayName || "User",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
      };
    } else {
      // Create default profile if doesn't exist
      console.log("📝 Creating default profile...");
      const defaultProfile: Omit<UserProfile, "id"> = {
        uid,
        displayName: "User",
        bio: "",
        avatarUrl: "",
      };
      await createProfile(defaultProfile);
      return { id: uid, ...defaultProfile };
    }
  } catch (error: any) {
    console.error("❌ Error getting profile:", error.message);
    throw error;
  }
}

/**
 * Create user profile in Firestore
 */
export async function createProfile(
  profile: Omit<UserProfile, "id">
): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user ID available");

  try {
    const docRef = doc(db, "users", uid);
    await setDoc(docRef, {
      uid: profile.uid,
      displayName: profile.displayName,
      bio: profile.bio || "",
      avatarUrl: profile.avatarUrl || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Profile created successfully");
  } catch (error: any) {
    console.error("❌ Error creating profile:", error.message);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  updates: Partial<Omit<UserProfile, "id" | "uid">>
): Promise<void> {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("No user ID available");

  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
    console.log("✅ Profile updated successfully");
  } catch (error: any) {
    console.error("❌ Error updating profile:", error.message);
    throw error;
  }
}

/**
 * Get partner profile (requires pair lookup first)
 */
export async function getPartnerProfile(
  pairId?: string
): Promise<UserProfile | null> {
  const uid = getCurrentUserId();
  if (!uid) return null;

  try {
    // If no pairId provided, find it
    let partnerUid: string | null = null;

    if (pairId) {
      // Get pair document to find partner UID
      const pairDoc = await getDoc(doc(db, "pairs", pairId));
      if (pairDoc.exists()) {
        const participants = pairDoc.data().participants as string[];
        partnerUid = participants.find((id) => id !== uid) || null;
      }
    } else {
      // Find pair where current user is a participant
      const pairsQuery = query(
        collection(db, "pairs"),
        where("participants", "array-contains", uid),
        where("status", "==", "active")
      );
      const pairsSnap = await getDocs(pairsQuery);

      if (!pairsSnap.empty) {
        const pairData = pairsSnap.docs[0].data();
        const participants = pairData.participants as string[];
        partnerUid = participants.find((id) => id !== uid) || null;
      }
    }

    if (!partnerUid) {
      console.log("⚠️ No partner found");
      return null;
    }

    // Get partner's profile
    const partnerDoc = await getDoc(doc(db, "users", partnerUid));
    if (partnerDoc.exists()) {
      const data = partnerDoc.data();
      return {
        id: partnerDoc.id,
        uid: data.uid || partnerUid,
        displayName: data.displayName || "Partner",
        bio: data.bio || "",
        avatarUrl: data.avatarUrl || "",
      };
    }

    return null;
  } catch (error: any) {
    console.error("❌ Error getting partner profile:", error.message);
    return null;
  }
}
