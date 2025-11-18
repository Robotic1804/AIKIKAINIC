import { Injectable } from '@angular/core';

/**
 * Servicio centralizado para manejar URLs de imágenes desde Cloudinary
 * Optimiza el performance al servir imágenes desde CDN en lugar de assets
 */
@Injectable({
  providedIn: 'root'
})
export class ImageService {
  // Cloud Name de Cloudinary para Aikikainic
  private readonly CLOUD_NAME = 'dvotyd4uj';
  private readonly BASE_URL = `https://res.cloudinary.com/${this.CLOUD_NAME}/image/upload`;
  private readonly VIDEO_URL = `https://res.cloudinary.com/${this.CLOUD_NAME}/video/upload`;

  /**
   * IDs públicos de las imágenes en Cloudinary
   * Estructura sugerida: aikikainic/categoria/nombre
   */
  private readonly imageIds = {
    // Hero e imágenes principales
    hero: 'aikikainic/hero/hero-aikido',
    watermark: 'aikikainic/general/foto-marcadeagua',

    // Maestros
    maestros: {
      bruce: 'aikikainic/maestros/bruce',
      heriberto: 'aikikainic/maestros/heriberto',
      mario: 'aikikainic/maestros/mario',
      marlon: 'aikikainic/maestros/marlon',
      norman: 'aikikainic/maestros/norman',
      ricardo: 'aikikainic/maestros/ricardo',
    },

    // Anibal (biografía)
    anibal: {
      anibal1: 'aikikainic/anibal/anibal-1',
      anibal2: 'aikikainic/anibal/anibal-2',
      anibal3: 'aikikainic/anibal/anibal-3',
      anibal4: 'aikikainic/anibal/anibal-4',
      anibal5: 'aikikainic/anibal/anibal-5',
      anibal6: 'aikikainic/anibal/anibal-6',
    },

    // Video
    video: {
      dojo: 'aikikainic/videos/dojo-video'
    }
  };

  constructor() {}

  /**
   * Obtiene URL de imagen con transformaciones opcionales
   * @param imageKey Ruta del objeto imageIds (ej: 'hero', 'maestros.bruce')
   * @param transformations Transformaciones de Cloudinary (ej: 'w_800,q_auto,f_webp')
   * @returns URL completa de Cloudinary
   */
  getImageUrl(imageKey: string, transformations: string = 'q_auto,f_auto'): string {
    const publicId = this.getPublicId(imageKey);
    if (!publicId) {
      console.warn(`Image key "${imageKey}" not found in imageIds`);
      return '';
    }
    return `${this.BASE_URL}/${transformations}/${publicId}`;
  }

  /**
   * Obtiene URL de video con transformaciones opcionales
   * @param videoKey Ruta del objeto imageIds.video
   * @param transformations Transformaciones de Cloudinary
   * @returns URL completa de Cloudinary para video
   */
  getVideoUrl(videoKey: string, transformations: string = 'q_auto'): string {
    const publicId = this.getPublicId(`video.${videoKey}`);
    if (!publicId) {
      console.warn(`Video key "${videoKey}" not found`);
      return '';
    }
    return `${this.VIDEO_URL}/${transformations}/${publicId}.mp4`;
  }

  /**
   * Obtiene URL optimizada para dispositivos móviles
   * @param imageKey Ruta del objeto imageIds
   * @returns URL con transformaciones para móvil (ancho 800px, calidad auto)
   */
  getMobileImageUrl(imageKey: string): string {
    return this.getImageUrl(imageKey, 'w_800,c_scale,q_auto,f_auto');
  }

  /**
   * Obtiene URL optimizada para desktop
   * @param imageKey Ruta del objeto imageIds
   * @returns URL con transformaciones para desktop (ancho 1920px, calidad auto)
   */
  getDesktopImageUrl(imageKey: string): string {
    return this.getImageUrl(imageKey, 'w_1920,c_scale,q_auto,f_auto');
  }

  /**
   * Obtiene URL de thumbnail
   * @param imageKey Ruta del objeto imageIds
   * @returns URL con transformaciones para thumbnail (200x200, crop, calidad auto)
   */
  getThumbnailUrl(imageKey: string): string {
    return this.getImageUrl(imageKey, 'w_200,h_200,c_fill,q_auto,f_auto');
  }

  /**
   * Obtiene todas las URLs de fotos de Anibal
   * @returns Array de URLs de las 6 fotos de Anibal
   */
  getAnibalPhotos(transformations: string = 'w_1200,c_scale,q_auto,f_auto'): string[] {
    return Object.keys(this.imageIds.anibal).map(key =>
      this.getImageUrl(`anibal.${key}`, transformations)
    );
  }

  /**
   * Obtiene todas las URLs de maestros
   * @returns Objeto con URLs de todos los maestros
   */
  getMaestrosPhotos(transformations: string = 'w_800,c_scale,q_auto,f_auto'): Record<string, string> {
    const maestros: Record<string, string> = {};
    Object.keys(this.imageIds.maestros).forEach(maestro => {
      maestros[maestro] = this.getImageUrl(`maestros.${maestro}`, transformations);
    });
    return maestros;
  }

  /**
   * Método auxiliar para obtener el Public ID desde la estructura anidada
   */
  private getPublicId(path: string): string | undefined {
    const keys = path.split('.');
    let current: any = this.imageIds;

    for (const key of keys) {
      if (current[key] === undefined) {
        return undefined;
      }
      current = current[key];
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Verifica si el servicio está configurado correctamente
   * @returns true si CLOUD_NAME está configurado
   */
  isConfigured(): boolean {
    return true; // Cloud name is configured: dvotyd4uj
  }
}
