import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
  timeoutId?: number;
  isClosing?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications = signal<Notification[]>([]);
  private notificationCounter = 0;

  getNotifications() {
    return this.notifications.asReadonly();
  }

  success(message: string, duration: number = 3000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 5000): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration: number = 4000): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration: number = 3000): void {
    this.show(message, 'info', duration);
  }

  private show(message: string, type: Notification['type'], duration: number): void {
    const id = `notification-${++this.notificationCounter}`;
    const notification: Notification = { id, message, type, duration };

    this.notifications.update(notifications => [...notifications, notification]);

    if (duration > 0) {
      const timeoutId = window.setTimeout(() => {
        this.remove(id);
      }, duration);

      // Store timeout ID for potential cleanup
      this.notifications.update(notifications =>
        notifications.map(n => n.id === id ? { ...n, timeoutId } : n)
      );
    }
  }

  remove(id: string): void {
    // Clear timeout if exists
    const notification = this.notifications().find(n => n.id === id);
    if (notification?.timeoutId) {
      window.clearTimeout(notification.timeoutId);
    }

    // Mark as closing to trigger animation
    this.notifications.update(notifications =>
      notifications.map(n => n.id === id ? { ...n, isClosing: true } : n)
    );

    // Actually remove after animation completes (300ms)
    setTimeout(() => {
      this.notifications.update(notifications =>
        notifications.filter(n => n.id !== id)
      );
    }, 300);
  }

  clear(): void {
    // Clear all timeouts
    this.notifications().forEach(n => {
      if (n.timeoutId) {
        window.clearTimeout(n.timeoutId);
      }
    });

    this.notifications.set([]);
  }
}
