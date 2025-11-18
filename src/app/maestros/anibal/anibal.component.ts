import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-anibal',
  imports: [],
  templateUrl: './anibal.component.html',
  styleUrl: './anibal.component.css'
})
export class AnibalComponent {
  private imageService = inject(ImageService);

  // URLs de las fotos de Anibal desde Cloudinary
  anibalPhotos = this.imageService.getAnibalPhotos();
}
