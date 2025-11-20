// frontend/pages/admin/news-editor/news-editor.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import { NewsService } from '../../../services/news.service';
import { ImageService } from '../../../services/image.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import {
  News,
  NewsCategory,
  NewsStatus,
  NewsImage,
  NEWS_CATEGORY_LABELS,
  CreateNewsRequest,
  UpdateNewsRequest,
} from '../../../models/news.model';

@Component({
  selector: 'app-news-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CKEditorModule],
  templateUrl: './news-editor.component.html',
  styleUrls: ['./news-editor.component.css'],
})
export class NewsEditorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private newsService = inject(NewsService);
  private imageService = inject(ImageService);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Editor
  public Editor = ClassicEditor;
  public editorConfig = {
    toolbar: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      'bulletedList',
      'numberedList',
      '|',
      'blockQuote',
      'undo',
      'redo',
    ],
    placeholder: 'Escribe el contenido de la noticia aquí...',
  };

  // Form
  newsForm!: FormGroup;
  isEditMode = false;
  editingNewsId: string | null = null;

  // State
  isLoading = false;
  isSaving = false;
  isUploadingFeatured = false;
  isUploadingGallery = false;
  currentUser: any = null;
  showPreview = false;

  // Images
  featuredImagePreview: string | null = null;
  galleryPreviews: NewsImage[] = [];
  maxGalleryImages = 5;

  // Tags
  currentTag = '';

  // Enums
  NewsCategory = NewsCategory;
  NewsStatus = NewsStatus;
  categoryLabels = NEWS_CATEGORY_LABELS;
  categories = Object.values(NewsCategory);
  statuses = Object.values(NewsStatus);

  ngOnInit(): void {
    this.loadCurrentUser();
    this.initForm();
    this.checkEditMode();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCurrentUser(): void {
    this.authService.usuarioActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  initForm(): void {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      subtitle: ['', Validators.maxLength(300)],
      content: ['', Validators.required],
      excerpt: ['', [Validators.required, Validators.maxLength(300)]],
      category: [NewsCategory.GENERAL, Validators.required],
      tags: [[]],
      status: [NewsStatus.DRAFT, Validators.required],
      scheduledFor: [''],
      isPinned: [false],
      allowComments: [true],
      eventDate: [''],
      eventLocation: ['', Validators.maxLength(200)],
      // SEO (opcional)
      metaTitle: ['', Validators.maxLength(60)],
      metaDescription: ['', Validators.maxLength(160)],
      keywords: [[]],
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.editingNewsId = id;
      this.loadNewsForEdit(id);
    }
  }

  loadNewsForEdit(id: string): void {
    this.isLoading = true;

    // TODO: Necesitamos un endpoint GET /api/news/admin/:id para obtener por ID
    // Por ahora, buscaremos en la lista
    this.newsService
      .getAdminNews()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const news = response.news.find((n) => n._id === id);
          if (news) {
            this.populateForm(news);
          } else {
            this.notificationService.error('Noticia no encontrada');
            this.router.navigate(['/admin/noticias']);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.notificationService.error('Error al cargar la noticia');
          this.router.navigate(['/admin/noticias']);
        },
      });
  }

  populateForm(news: News): void {
    this.newsForm.patchValue({
      title: news.title,
      subtitle: news.subtitle || '',
      content: news.content,
      excerpt: news.excerpt,
      category: news.category,
      tags: news.tags || [],
      status: news.status,
      scheduledFor: news.scheduledFor
        ? new Date(news.scheduledFor).toISOString().slice(0, 16)
        : '',
      isPinned: news.isPinned,
      allowComments: news.allowComments,
      eventDate: news.eventDate
        ? new Date(news.eventDate).toISOString().slice(0, 16)
        : '',
      eventLocation: news.eventLocation || '',
      metaTitle: news.seo?.metaTitle || '',
      metaDescription: news.seo?.metaDescription || '',
      keywords: news.seo?.keywords || [],
    });

    // Cargar imágenes
    this.featuredImagePreview = news.featuredImage.url;
    this.galleryPreviews = news.gallery || [];
  }

  // ==========================================
  // SUBIDA DE IMÁGENES
  // ==========================================

  async onFeaturedImageSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validar tipo y tamaño
    if (!file.type.startsWith('image/')) {
      this.notificationService.error('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.notificationService.error('La imagen no puede exceder 5MB');
      return;
    }

    this.isUploadingFeatured = true;

    try {
      const result = await this.imageService.uploadToCloudinary(file, 'news-featured');
      this.featuredImagePreview = result.url;
      this.notificationService.success('Imagen principal subida exitosamente');
    } catch (error) {
      this.notificationService.error('Error al subir la imagen');
      console.error('Upload error:', error);
    } finally {
      this.isUploadingFeatured = false;
    }
  }

  async onGalleryImagesSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const files = Array.from(input.files);

    // Validar límite
    if (this.galleryPreviews.length + files.length > this.maxGalleryImages) {
      this.notificationService.error(
        `Solo puedes subir hasta ${this.maxGalleryImages} imágenes en la galería`
      );
      return;
    }

    this.isUploadingGallery = true;

    try {
      for (const file of files) {
        // Validar cada archivo
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;

        const result = await this.imageService.uploadToCloudinary(file, 'news-gallery');
        this.galleryPreviews.push({
          url: result.url,
          publicId: result.publicId,
          alt: file.name,
          caption: '',
        });
      }

      this.notificationService.success(
        `${files.length} imagen(es) subidas exitosamente`
      );
    } catch (error) {
      this.notificationService.error('Error al subir imágenes de la galería');
      console.error('Gallery upload error:', error);
    } finally {
      this.isUploadingGallery = false;
      // Reset input
      input.value = '';
    }
  }

  removeGalleryImage(index: number): void {
    this.galleryPreviews.splice(index, 1);
    this.notificationService.success('Imagen eliminada de la galería');
  }

  updateGalleryCaption(index: number, caption: string): void {
    this.galleryPreviews[index].caption = caption;
  }

  // ==========================================
  // TAGS
  // ==========================================

  addTag(): void {
    const tag = this.currentTag.trim().toLowerCase();
    if (!tag) return;

    const tags = this.newsForm.get('tags')?.value || [];

    if (tags.includes(tag)) {
      this.notificationService.warning('Esta etiqueta ya existe');
      return;
    }

    if (tags.length >= 10) {
      this.notificationService.warning('Máximo 10 etiquetas permitidas');
      return;
    }

    tags.push(tag);
    this.newsForm.patchValue({ tags });
    this.currentTag = '';
  }

  removeTag(tag: string): void {
    const tags = this.newsForm.get('tags')?.value || [];
    const index = tags.indexOf(tag);
    if (index >= 0) {
      tags.splice(index, 1);
      this.newsForm.patchValue({ tags });
    }
  }

  // ==========================================
  // SUBMIT
  // ==========================================

  async saveNews(publishNow: boolean = false): Promise<void> {
    if (this.newsForm.invalid) {
      this.newsForm.markAllAsTouched();
      this.notificationService.warning('Por favor completa todos los campos requeridos');
      return;
    }

    if (!this.featuredImagePreview) {
      this.notificationService.error('Debes subir una imagen principal');
      return;
    }

    this.isSaving = true;

    try {
      const formValue = this.newsForm.value;

      // Preparar datos
      const newsData: CreateNewsRequest | UpdateNewsRequest = {
        title: formValue.title,
        subtitle: formValue.subtitle || undefined,
        content: formValue.content,
        excerpt: formValue.excerpt,
        featuredImage: {
          url: this.featuredImagePreview,
          publicId: 'temp', // TODO: Obtener del resultado de Cloudinary
          alt: formValue.title,
        },
        gallery: this.galleryPreviews.length > 0 ? this.galleryPreviews : undefined,
        category: formValue.category,
        tags: formValue.tags,
        status: publishNow ? NewsStatus.PUBLISHED : formValue.status,
        scheduledFor: formValue.scheduledFor || undefined,
        isPinned: formValue.isPinned,
        allowComments: formValue.allowComments,
        eventDate: formValue.eventDate || undefined,
        eventLocation: formValue.eventLocation || undefined,
        authorName: this.currentUser?.name || 'Admin',
        seo:
          formValue.metaTitle || formValue.metaDescription
            ? {
                metaTitle: formValue.metaTitle || undefined,
                metaDescription: formValue.metaDescription || undefined,
                keywords: formValue.keywords || undefined,
              }
            : undefined,
      };

      if (this.isEditMode && this.editingNewsId) {
        // Actualizar
        await this.newsService
          .updateNews(this.editingNewsId, newsData)
          .pipe(takeUntil(this.destroy$))
          .toPromise();

        this.notificationService.success('Noticia actualizada exitosamente');
      } else {
        // Crear
        await this.newsService
          .createNews(newsData as CreateNewsRequest)
          .pipe(takeUntil(this.destroy$))
          .toPromise();

        this.notificationService.success(
          publishNow
            ? 'Noticia publicada exitosamente'
            : 'Noticia guardada como borrador'
        );
      }

      this.router.navigate(['/admin/noticias']);
    } catch (error: any) {
      this.notificationService.error(
        error?.error?.message || 'Error al guardar la noticia'
      );
      console.error('Save error:', error);
    } finally {
      this.isSaving = false;
    }
  }

  saveDraft(): void {
    this.saveNews(false);
  }

  publishNews(): void {
    this.saveNews(true);
  }

  cancel(): void {
    if (confirm('¿Estás seguro? Los cambios no guardados se perderán.')) {
      this.router.navigate(['/admin/noticias']);
    }
  }

  togglePreview(): void {
    this.showPreview = !this.showPreview;
  }

  // ==========================================
  // PREVIEW DATA
  // ==========================================

  get previewData(): any {
    return {
      title: this.newsForm.get('title')?.value || 'Sin título',
      subtitle: this.newsForm.get('subtitle')?.value,
      content: this.newsForm.get('content')?.value || 'Sin contenido',
      excerpt: this.newsForm.get('excerpt')?.value || 'Sin resumen',
      featuredImage: this.featuredImagePreview,
      gallery: this.galleryPreviews,
      category: this.newsForm.get('category')?.value,
      tags: this.newsForm.get('tags')?.value || [],
      authorName: this.currentUser?.name || 'Admin',
      publishedAt: new Date(),
    };
  }
}
