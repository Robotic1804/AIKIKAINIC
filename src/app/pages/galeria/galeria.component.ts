import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PhotoService } from '../../services/photo.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { Photo } from '../../models/photo.model';
import { NotificationService } from '../../services/notification.service';
import { FILE_UPLOAD, TIMING } from '../../core/constants/app.constants';
import AOS from 'aos';

@Component({
  selector: 'app-galeria',
  imports: [FormsModule, DatePipe],
  templateUrl: './galeria.component.html',
  styleUrls: ['./galeria.component.css'],
})
export class GaleriaComponent implements OnInit {
  photos: Photo[] = [];
  showForm = false;
  isAdmin = false;
  isWebmaster = false;
  selectedPhoto: Photo | null = null;

  // Formulario
  photoForm = {
    location: '',
    event: '',
    date: '',
    comment: '',
    image: null as File | null,
  };

  private photoService = inject(PhotoService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  ngOnInit(): void {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: false,
      mirror: true,
    });

    this.loadPhotos();
    this.checkPermissions();
  }

  loadPhotos(): void {
    this.photoService.getPhotos().subscribe({
      next: (photos) => {
        this.photos = photos.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTimeout(() => AOS.refresh(), TIMING.AOS_REFRESH_DELAY_MS);
      },
      error: () => this.notificationService.error('Error al cargar fotos'),
    });
  }

  checkPermissions(): void {
    this.isAdmin = this.authService.esAdmin();
    this.isWebmaster = this.authService.esWebmaster();
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    // Si estamos abriendo el formulario, resetear todos los campos
    if (this.showForm) {
      this.resetForm();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      // ✅ Validaciones en el frontend
      if (!(FILE_UPLOAD.ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
        this.notificationService.error('Solo se permiten imágenes JPG, PNG o WebP');
        input.value = ''; // Limpiar input
        return;
      }

      if (file.size > FILE_UPLOAD.MAX_FILE_SIZE_BYTES) {
        this.notificationService.error(`La imagen no puede superar ${FILE_UPLOAD.MAX_FILE_SIZE_MB}MB`);
        input.value = '';
        return;
      }

      this.photoForm.image = file;
    }
  }

  onSubmit(): void {
    // ✅ Validaciones antes de enviar
    if (!this.photoForm.image) {
      this.notificationService.warning('Por favor selecciona una imagen');
      return;
    }

    if (
      !this.photoForm.location ||
      !this.photoForm.event ||
      !this.photoForm.date
    ) {
      this.notificationService.warning('Por favor completa todos los campos obligatorios');
      return;
    }

    // ✅ Construir FormData correctamente
    const formData = new FormData();
    formData.append('location', this.photoForm.location);
    formData.append('event', this.photoForm.event);
    formData.append('date', this.photoForm.date);
    formData.append('comment', this.photoForm.comment || '');
    formData.append('image', this.photoForm.image, this.photoForm.image.name);

    // ✅ CORREGIDO: Ahora maneja correctamente el array de fotos
    this.photoService.createPhoto(formData).subscribe({
      next: (newPhotos: Photo[]) => {
        // Agregar las nuevas fotos al inicio del array
        this.photos = [...newPhotos, ...this.photos];

        // Mensaje de éxito
        const message =
          newPhotos.length === 1
            ? 'Foto subida correctamente'
            : `${newPhotos.length} fotos subidas correctamente`;
        this.notificationService.success(message);

        // Cerrar formulario y resetear
        this.showForm = false;
        this.resetForm();

        // Refrescar animaciones
        setTimeout(() => AOS.refresh(), TIMING.AOS_REFRESH_DELAY_MS);
      },
      error: (error) => {
        let errorMsg = 'Error al subir foto';

        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.message) {
          errorMsg = error.message;
        } else if (error.status) {
          errorMsg = `Error ${error.status}: ${error.statusText}`;
        }

        this.notificationService.error(errorMsg);
      },
    });
  }

  deletePhoto(id: string): void {
    if (confirm('¿Eliminar esta foto?')) {
      this.photoService.deletePhoto(id).subscribe({
        next: () => {
          this.photos = this.photos.filter((p) => p._id !== id);
          this.notificationService.success('Foto eliminada correctamente');
        },
        error: (error) => {
          const errorMsg = error.error?.message || error.message || 'Error al eliminar foto';
          this.notificationService.error('Error al eliminar: ' + errorMsg);
        },
      });
    }
  }

  openLightbox(photo: Photo): void {
    this.selectedPhoto = photo;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.selectedPhoto = null;
    document.body.style.overflow = 'auto';
  }

  private resetForm(): void {
    this.photoForm = {
      location: '',
      event: '',
      date: '',
      comment: '',
      image: null,
    };

    // Limpiar el input file
    const fileInput = document.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }
}
