import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      @for (notification of notificationService.getNotifications()(); track notification.id) {
        <div
          class="notification notification-{{notification.type}} animate-fade-in-up"
          (click)="notificationService.remove(notification.id)"
          role="alert"
        >
          <div class="notification-icon">
            @switch (notification.type) {
              @case ('success') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('error') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('warning') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                </svg>
              }
              @case ('info') {
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
                </svg>
              }
            }
          </div>
          <div class="notification-content">
            <p>{{ notification.message }}</p>
          </div>
          <button
            class="notification-close"
            (click)="notificationService.remove(notification.id); $event.stopPropagation()"
            aria-label="Close notification"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 400px;
      pointer-events: none;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.5rem;
      box-shadow: var(--shadow-lg);
      cursor: pointer;
      pointer-events: all;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .notification:hover {
      transform: translateX(-4px);
      box-shadow: var(--shadow-xl);
    }

    .notification-success {
      background-color: rgba(16, 185, 129, 0.95);
      color: white;
    }

    .notification-error {
      background-color: rgba(239, 68, 68, 0.95);
      color: white;
    }

    .notification-warning {
      background-color: rgba(245, 158, 11, 0.95);
      color: white;
    }

    .notification-info {
      background-color: rgba(59, 130, 246, 0.95);
      color: white;
    }

    .notification-icon {
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .notification-content {
      flex: 1;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    .notification-content p {
      margin: 0;
    }

    .notification-close {
      flex-shrink: 0;
      background: transparent;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s ease;
    }

    .notification-close:hover {
      opacity: 1;
    }

    @media (max-width: 640px) {
      .notification-container {
        left: 1rem;
        right: 1rem;
        max-width: none;
      }

      .notification {
        font-size: 0.875rem;
      }
    }
  `]
})
export class NotificationToastComponent {
  notificationService = inject(NotificationService);
}
