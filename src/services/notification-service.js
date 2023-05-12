const supportsNotifications = typeof(Notification) === 'function';

export function notify(notificationData) {
    if (!supportsNotifications) return;
    new Notification(notificationData.title, notificationData);
}
