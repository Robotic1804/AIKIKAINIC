import { Component, inject } from '@angular/core';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-aikidohistory',
  standalone: true,
  imports: [],
  templateUrl: './aikidohistory.component.html',
  styleUrl: './aikidohistory.component.css'
})
export class AikidohistoryComponent {
  private imageService = inject(ImageService);

  // URL de la imagen hero desde Cloudinary
  heroImage = this.imageService.getImageUrl('hero');
}
