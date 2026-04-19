import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import api from '../api';

export const usePushNotifications = () => {
  const isPushSupported = () => {
    return Capacitor.getPlatform() !== 'web';
  };

  const registerNotifications = async () => {
    if (!isPushSupported()) {
      console.log('Push notifications not supported on web');
      return;
    }

    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      throw new Error('User denied permissions!');
    }

    await PushNotifications.register();
  };

  const addListeners = async () => {
    if (!isPushSupported()) return;

    await PushNotifications.addListener('registration', async (token) => {
      console.info('Registration token: ', token.value);
      // Here you would typically send the token to your backend
      try {
        await api.post('/auth/register-push-token', { token: token.value });
      } catch (err) {
        console.error('Failed to register push token with backend', err);
      }
    });

    await PushNotifications.addListener('registrationError', (err) => {
      console.error('Registration error: ', err.error);
    });

    await PushNotifications.addListener(
      'pushNotificationReceived',
      (notification) => {
        console.info('Push notification received: ', notification);
      },
    );

    await PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification) => {
        console.info('Push notification action performed', notification.actionId, notification.notification);
      },
    );
  };

  return {
    isPushSupported,
    registerNotifications,
    addListeners,
  };
};
