import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { WelcomeSectionComponent } from './components/welcome-section/welcome-section.component';
import { VideoSectionComponent } from './components/video-section/video-section.component';
import { NewsSidebarComponent } from '../../shared/components/news-sidebar/news-sidebar.component';





@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    HeroSectionComponent,
    WelcomeSectionComponent,
    VideoSectionComponent,
    NewsSidebarComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],

})
export class HomeComponent {

}
 