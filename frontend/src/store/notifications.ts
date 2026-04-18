import { defineStore } from 'pinia';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timeout?: number;
}

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
  }),
  actions: {
    add(message: string, type: NotificationType = 'info', timeout = 5000) {
      const id = Math.random().toString(36).substring(2, 9);
      this.notifications.push({ id, message, type, timeout });
      
      if (timeout > 0) {
        setTimeout(() => {
          this.remove(id);
        }, timeout);
      }
    },
    success(message: string) {
      this.add(message, 'success');
    },
    error(message: string) {
      this.add(message, 'error');
    },
    remove(id: string) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    },
  },
});
