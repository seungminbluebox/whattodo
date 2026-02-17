import { supabase } from "./supabase";

// VAPID Public Key
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export async function registerServiceWorker() {
  console.log("registerServiceWorker starting check...");
  if ("serviceWorker" in navigator && "PushManager" in window) {
    try {
      console.log("SW and PushManager supported, registering...");
      const registration = await navigator.serviceWorker.register(
        "/whattodo/sw.js",
        {
          scope: "/whattodo/",
        },
      );
      console.log("SW Registered successfully:", registration);
      return registration;
    } catch (error) {
      console.error("SW Registration failed in try/catch:", error);
    }
  } else {
    console.warn("ServiceWorker or PushManager not supported in this browser");
  }
}

export async function subscribeToPush(userId: string) {
  console.log("subscribeToPush phase 1: starting for user", userId);
  try {
    // navigator.serviceWorker.ready가 가끔 무한 대기할 수 있으므로, getRegistration()을 시도합니다.
    let registration =
      await navigator.serviceWorker.getRegistration("/whattodo/");

    if (!registration) {
      console.log("No registration found with scope, trying generic ready...");
      registration = await navigator.serviceWorker.ready;
    }

    console.log(
      "subscribeToPush phase 2: SW registration found",
      registration?.scope,
    );

    if (!registration) {
      console.error("Critical: Could not find Service Worker registration");
      return;
    }

    // 알림 권한 요청 (브라우저 정책상 사용자 인터랙션 후에만 뜰 수 있음)
    console.log("subscribeToPush phase 3: requesting permission...");
    const permission = await Notification.requestPermission();
    console.log("subscribeToPush phase 4: permission status", permission);

    if (permission !== "granted") {
      console.warn("Permission not granted. Status:", permission);
      return;
    }

    // 기존 구독 확인
    console.log("subscribeToPush phase 5: checking existing subscription...");
    let subscription = await registration.pushManager.getSubscription();
    console.log(
      "subscribeToPush phase 6: existing subscription exists?",
      !!subscription,
    );

    if (!subscription) {
      console.log(
        "subscribeToPush phase 7: creating new subscription with key:",
        VAPID_PUBLIC_KEY,
      );
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log("subscribeToPush phase 8: new subscription created");
    }

    // Supabase에 저장
    console.log("subscribeToPush phase 9: upserting to Supabase...");
    try {
      const { data, error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: userId,
          subscription: subscription.toJSON(),
        },
        { onConflict: "user_id" },
      );

      if (error) {
        console.error("Supabase upsert failure (returned error):", error);
        alert("DB 저장 실패: " + error.message);
      } else {
        console.log("Successfully saved/updated subscription in DB! 🎉", data);
        alert("알림 설정이 완료되었습니다! 🔔");
      }
    } catch (dbError) {
      console.error("Critical error during DB upsert:", dbError);
      alert("DB 연결 중 예상치 못한 오류가 발생했습니다.");
    }

    return subscription;
  } catch (error) {
    console.error("Failed to subscribe to push (catch block):", error);
  }

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}
