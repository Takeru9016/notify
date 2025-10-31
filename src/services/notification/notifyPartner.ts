import { AppNotificationService } from "./notification.service";
import { AppNotificationType } from "@/types";
import { useProfileStore } from "@/store/profile";

type NotifyPartnerInput = {
  type: AppNotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
};

/**
 * Send a notification to the current user's partner
 */
export async function notifyPartner(input: NotifyPartnerInput): Promise<void> {
  try {
    const partnerProfile = useProfileStore.getState().partnerProfile;

    if (!partnerProfile?.uid) {
      console.log("⚠️ [notifyPartner] No partner found, skipping notification");
      return;
    }

    console.log(
      "📤 [notifyPartner] Sending notification to partner:",
      partnerProfile.uid
    );

    await AppNotificationService.create({
      recipientUid: partnerProfile.uid,
      type: input.type,
      title: input.title,
      body: input.body,
      data: input.data,
    });

    console.log("✅ [notifyPartner] Notification sent successfully");
  } catch (error) {
    console.error("❌ [notifyPartner] Failed to send notification:", error);
    // Non-fatal: don't throw, just log
  }
}
