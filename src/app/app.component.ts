import { Component } from '@angular/core';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { LoginModalComponent } from './shared/components/login-modal/login-modal.component';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    NavbarComponent,
    FooterComponent,
    RouterOutlet,
    LoginModalComponent,
    NotificationToastComponent
  ]
})
export class AppComponent {
  title = 'Aikikainic';
}
