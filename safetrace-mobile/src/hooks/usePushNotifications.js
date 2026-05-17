import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import client from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function usePushNotifications(navigationRef) {
  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    (async () => {
      if (!Device.isDevice) return;
      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      await client.patch('/auth/users/me/push-token', { pushToken: token }).catch(() => {});
    })();

    notifListener.current = Notifications.addNotificationReceivedListener((notif) => {
      console.log('Notification reçue:', notif);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const caseId = response.notification.request.content.data?.caseId;
      if (caseId && navigationRef?.current) {
        navigationRef.current.navigate('CaseDetail', { caseId });
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notifListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);
}
