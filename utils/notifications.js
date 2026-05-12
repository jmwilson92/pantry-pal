import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
    });
  }

  return true;
}

export async function scheduleExpiringNotifications(items) {
  // Cancel all previous notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const expiringItems = items.filter(item => {
    if (!item.expiry) return false;
    const expiryDate = new Date(item.expiry);
    const today = new Date();
    const diffTime = expiryDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 2; // Expiring today or tomorrow
  });

  if (expiringItems.length === 0) return;

  const itemNames = expiringItems.map(i => i.name).join(', ');
  const count = expiringItems.length;

  // Schedule notifications at meal times
  const mealTimes = [
    { hour: 7, minute: 0, title: 'Good morning! 🍾' },
    { hour: 12, minute: 0, title: 'Lunch time! 🥪' },
    { hour: 18, minute: 0, title: 'Dinner time! 🍖' },
  ];

  for (const meal of mealTimes) {
    const trigger = {
      hour: meal.hour,
      minute: meal.minute,
      repeats: true,
    };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: meal.title,
        body: `${count} item${count > 1 ? 's' : ''} expiring soon: ${itemNames}`,
        sound: 'default',
      },
      trigger,
    });
  }

  console.log(`Scheduled notifications for ${count} expiring items`);
}