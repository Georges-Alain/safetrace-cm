import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import { isExpoGo } from '../utils/env';
import client from '../api/client';

export function usePushNotifications(navigationRef) {
  const notifListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // expo-notifications was removed from Expo Go in SDK 53 and causes
    // JSI crashes. We skip it entirely — push notifications only work in
    // development builds and production builds.
    if (isExpoGo) return;

    let Notifications;
    try {
      Notifications = require('expo-notifications');
    } catch {
      return;
    }

    try {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
        }),
      });

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
    } catch (err) {
      console.warn('[PushNotifications] setup failed:', err.message);
    }
  }, []);
}
