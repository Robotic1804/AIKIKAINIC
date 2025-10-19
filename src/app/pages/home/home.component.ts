import { Component } from '@angular/core';
import { HeroSectionComponent } from './components/hero-section/hero-section.component';
import { WelcomeSectionComponent } from './components/welcome-section/welcome-section.component';
import { VideoSectionComponent } from './components/video-section/video-section.component';





@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSectionComponent, WelcomeSectionComponent, VideoSectionComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],

})
export class HomeComponent {

}
 