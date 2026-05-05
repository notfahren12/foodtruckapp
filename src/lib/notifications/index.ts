import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  const permissions = await Notifications.getPermissionsAsync();

  if (permissions.status !== 'granted') {
    return Notifications.requestPermissionsAsync();
  }

  return permissions;
}

export async function schedulePlaceholderReminder(title: string, body: string) {
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null,
  });
}
