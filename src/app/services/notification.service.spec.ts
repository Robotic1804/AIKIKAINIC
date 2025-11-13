import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show success notification', () => {
    service.success('Test success message');
    const notifications = service.getNotifications()();

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('success');
    expect(notifications[0].message).toBe('Test success message');
  });

  it('should show error notification', () => {
    service.error('Test error message');
    const notifications = service.getNotifications()();

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('error');
    expect(notifications[0].message).toBe('Test error message');
  });

  it('should show warning notification', () => {
    service.warning('Test warning message');
    const notifications = service.getNotifications()();

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('warning');
    expect(notifications[0].message).toBe('Test warning message');
  });

  it('should show info notification', () => {
    service.info('Test info message');
    const notifications = service.getNotifications()();

    expect(notifications.length).toBe(1);
    expect(notifications[0].type).toBe('info');
    expect(notifications[0].message).toBe('Test info message');
  });

  it('should auto-remove notification after duration', fakeAsync(() => {
    service.success('Test message', 1000);
    expect(service.getNotifications()().length).toBe(1);

    tick(1000);
    expect(service.getNotifications()().length).toBe(0);
  }));

  it('should stack multiple notifications', () => {
    service.success('Message 1');
    service.error('Message 2');
    service.warning('Message 3');

    const notifications = service.getNotifications()();
    expect(notifications.length).toBe(3);
  });

  it('should remove specific notification by id', () => {
    service.success('Message 1');
    service.success('Message 2');

    const notifications = service.getNotifications()();
    const firstId = notifications[0].id;

    service.remove(firstId);
    expect(service.getNotifications()().length).toBe(1);
    expect(service.getNotifications()()[0].id).not.toBe(firstId);
  });

  it('should clear all notifications', () => {
    service.success('Message 1');
    service.error('Message 2');
    service.warning('Message 3');

    service.clear();
    expect(service.getNotifications()().length).toBe(0);
  });

  it('should assign unique ids to notifications', () => {
    service.success('Message 1');
    service.success('Message 2');
    service.success('Message 3');

    const notifications = service.getNotifications()();
    const ids = notifications.map(n => n.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(3);
  });

  it('should use default duration for success (3000ms)', fakeAsync(() => {
    service.success('Test');
    expect(service.getNotifications()().length).toBe(1);

    tick(2999);
    expect(service.getNotifications()().length).toBe(1);

    tick(1);
    expect(service.getNotifications()().length).toBe(0);
  }));

  it('should use default duration for error (5000ms)', fakeAsync(() => {
    service.error('Test');
    expect(service.getNotifications()().length).toBe(1);

    tick(4999);
    expect(service.getNotifications()().length).toBe(1);

    tick(1);
    expect(service.getNotifications()().length).toBe(0);
  }));

  it('should allow custom duration', fakeAsync(() => {
    service.success('Test', 500);
    expect(service.getNotifications()().length).toBe(1);

    tick(500);
    expect(service.getNotifications()().length).toBe(0);
  }));
});
