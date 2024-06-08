const supportsNotifications = "Notification" in window;

export function notify(notificationData) {
  if (!supportsNotifications) return;
  new Notification(notificationData.title, notificationData);
}
