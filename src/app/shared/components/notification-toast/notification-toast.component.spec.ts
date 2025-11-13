import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationToastComponent } from './notification-toast.component';
import { NotificationService } from '../../../services/notification.service';

describe('NotificationToastComponent', () => {
  let component: NotificationToastComponent;
  let fixture: ComponentFixture<NotificationToastComponent>;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationToastComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationToastComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display notifications', () => {
    notificationService.success('Test notification');
    fixture.detectChanges();

    const notificationElement = fixture.nativeElement.querySelector('.notification');
    expect(notificationElement).toBeTruthy();
    expect(notificationElement.textContent).toContain('Test notification');
  });

  it('should display multiple notifications', () => {
    notificationService.success('Notification 1');
    notificationService.error('Notification 2');
    fixture.detectChanges();

    const notifications = fixture.nativeElement.querySelectorAll('.notification');
    expect(notifications.length).toBe(2);
  });

  it('should apply correct CSS class for notification types', () => {
    notificationService.success('Success');
    fixture.detectChanges();

    let notification = fixture.nativeElement.querySelector('.notification');
    expect(notification.classList.contains('notification-success')).toBe(true);

    notificationService.clear();
    notificationService.error('Error');
    fixture.detectChanges();

    notification = fixture.nativeElement.querySelector('.notification');
    expect(notification.classList.contains('notification-error')).toBe(true);
  });

  it('should remove notification when close button is clicked', () => {
    notificationService.success('Test notification');
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('.notification-close');
    closeButton.click();
    fixture.detectChanges();

    const notifications = fixture.nativeElement.querySelectorAll('.notification');
    expect(notifications.length).toBe(0);
  });

  it('should remove notification when clicked', () => {
    notificationService.success('Test notification');
    fixture.detectChanges();

    const notification = fixture.nativeElement.querySelector('.notification');
    notification.click();
    fixture.detectChanges();

    const notifications = fixture.nativeElement.querySelectorAll('.notification');
    expect(notifications.length).toBe(0);
  });
});
