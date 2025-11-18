import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImageService } from '../../../../services/image.service';


@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  private imageService = inject(ImageService);

  // URL de la imagen hero desde Cloudinary
  heroImage = this.imageService.getDesktopImageUrl('hero');
}
