self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/whattodo/icon-192.png",
      badge: "/whattodo/badge.png",
      vibrate: [200, 100, 200], // 더 강한 진동 피드백
      tag: "whattodo-reminder-" + Date.now(), // 알림이 중복되더라도 개별적으로 쌓이게 설정
      renotify: true, // 새로운 알림이 올 때마다 소리/진동 발생 시도
      data: {
        url: data.url || "/whattodo/",
      },
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
