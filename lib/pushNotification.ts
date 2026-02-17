import { supabase } from "./supabase";

// VAPID Public Key
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export async function registerServiceWorker() {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      const registration = await navigator.serviceWorker.register(
        "/whattodo/sw.js",
        {
          scope: "/whattodo/",
        },
      );
      console.log("SW Registered:", registration);
      return registration;
    } catch (error) {
      console.error("SW Registration failed:", error);
    }
  }
}

export async function subscribeToPush() {
  try {
    const registration = await navigator.serviceWorker.ready;

    // 알림 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Permission not granted for notifications");
      return;
    }

    // 기존 구독 확인
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      // 새 구독 생성
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }

    // Supabase에 저장
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("push_subscriptions").upsert({
        user_id: user.id,
        subscription: subscription.toJSON(),
      });
    }

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push:", error);
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
