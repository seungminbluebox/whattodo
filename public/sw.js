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
  const urlToOpen = event.notification.data.url;

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then(function (clientList) {
        // 이미 열려있는 탭이 있으면 해당 탭으로 이동하고 탐색
        for (let i = 0; i < clientList.length; i++) {
          let client = clientList[i];
          if (client.url.includes("/whattodo") && "navigate" in client) {
            return client.navigate(urlToOpen).then((c) => c.focus());
          }
        }
        // 열린 탭이 없으면 새 창 열기
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});
