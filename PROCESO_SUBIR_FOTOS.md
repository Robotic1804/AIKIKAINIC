# 📸 Guía: Cómo Subir Nuevas Fotos a Cloudinary

## 🎯 Caso 1: Fotos de Galería (Automático)

### Proceso:
1. Login como Admin/Webmaster en tu aplicación
2. Ve a `/galeria`
3. Click en "Subir Fotos"
4. Completa el formulario y selecciona las imágenes
5. ¡Listo! Las fotos aparecen automáticamente

**Ubicación en Cloudinary:** `aikido-photos/`

---

## 🖼️ Caso 2: Fotos Estáticas (Manual)

### Ejemplo: Agregar foto de un nuevo maestro llamado "Carlos"

#### Paso 1: Preparar la imagen
```
Archivo: carlos.jpg
Ubicación temporal: C:\Norman\L0_FrontEnd\L01_Angular\Aikikainic\temp-images\
```

#### Paso 2: Actualizar script de migración
```typescript
// File: Aikikainic-backend/src/scripts/migrate-images.ts

const imageMappings: ImageMapping[] = [
  // ... imágenes existentes ...

  // ✅ AGREGAR NUEVA IMAGEN:
  {
    fileName: "carlos.jpg",
    publicId: "carlos",
    folder: "aikikainic/maestros",
    resourceType: "image",
  }
];
```

#### Paso 3: Ejecutar migración
```bash
cd C:\Norman\L0_FrontEnd\L01_Angular\Aikikainic-backend
npm run migrate-images
```

**Resultado:**
```
✅ Subido exitosamente: https://res.cloudinary.com/dvotyd4uj/image/upload/.../aikikainic/maestros/carlos.jpg
```

#### Paso 4: Actualizar ImageService (Frontend)
```typescript
// File: src/app/services/image.service.ts

private readonly imageIds = {
  maestros: {
    bruce: 'aikikainic/maestros/bruce',
    heriberto: 'aikikainic/maestros/heriberto',
    mario: 'aikikainic/maestros/mario',
    // ... otros maestros ...
    carlos: 'aikikainic/maestros/carlos', // ✅ AGREGAR AQUÍ
  }
}
```

#### Paso 5: Usar en tu componente
```typescript
// En tu componente .ts:
export class MaestrosComponent {
  private imageService = inject(ImageService);

  carlosImage = this.imageService.getImageUrl('maestros.carlos');
  // O con optimización:
  carlosImageMobile = this.imageService.getMobileImageUrl('maestros.carlos');
}
```

```html
<!-- En tu template .html: -->
<img [src]="carlosImage" alt="Maestro Carlos">
```

---

## 🔄 Alternativa: Subida Manual a Cloudinary

Si prefieres no usar el script:

### 1. Accede a Cloudinary Dashboard
```
URL: https://console.cloudinary.com/
```

### 2. Sube la imagen
- Media Library → Upload
- Especifica carpeta: `aikikainic/maestros/`
- Asigna Public ID: `carlos`

### 3. Copia el Public ID
```
Public ID: aikikainic/maestros/carlos
```

### 4. Actualiza ImageService
(Mismo paso 4 de arriba)

### 5. Usa en componente
(Mismo paso 5 de arriba)

---

## 📁 Estructura de Carpetas en Cloudinary

```
dvotyd4uj/
├── aikido-photos/          ← Fotos de galería (automáticas)
│   ├── imagen-evento-1.jpg
│   └── imagen-evento-2.jpg
│
└── aikikainic/             ← Fotos estáticas (manuales)
    ├── hero/
    │   └── hero-aikido
    ├── maestros/
    │   ├── bruce
    │   ├── heriberto
    │   ├── mario
    │   └── carlos          ← Nueva imagen
    ├── anibal/
    │   ├── anibal-1
    │   └── ...
    ├── general/
    │   └── foto-marcadeagua
    └── videos/
        └── dojo-video
```

---

## 🎨 Métodos Útiles del ImageService

```typescript
// URL básica con optimización automática
getImageUrl('maestros.carlos')
// → https://res.cloudinary.com/.../q_auto,f_auto/.../carlos.jpg

// Optimizada para móvil (800px)
getMobileImageUrl('maestros.carlos')
// → https://res.cloudinary.com/.../w_800,c_scale,q_auto,f_auto/.../carlos.jpg

// Optimizada para desktop (1920px)
getDesktopImageUrl('maestros.carlos')
// → https://res.cloudinary.com/.../w_1920,c_scale,q_auto,f_auto/.../carlos.jpg

// Thumbnail (200x200)
getThumbnailUrl('maestros.carlos')
// → https://res.cloudinary.com/.../w_200,h_200,c_fill,q_auto,f_auto/.../carlos.jpg

// Todas las fotos de maestros
getMaestrosPhotos()
// → { bruce: 'url...', heriberto: 'url...', ... }

// Video
getVideoUrl('dojo')
// → https://res.cloudinary.com/.../videos/dojo-video.mp4
```

---

## ✅ Checklist antes de hacer commit

- [ ] Imagen subida a Cloudinary
- [ ] Public ID agregado en `imageIds` del ImageService
- [ ] URL funcionando en el navegador
- [ ] Componente actualizado para usar la nueva imagen
- [ ] Probado en móvil y desktop
- [ ] Commit y push a GitHub

---

## 🆘 Problemas Comunes

### Error: "Image key not found"
**Solución:** Verifica que el Public ID esté correctamente agregado en `imageIds`

### Imagen no carga
**Solución:**
1. Verifica la URL en DevTools (F12 → Network)
2. Confirma que el Public ID en Cloudinary coincida con el del código

### Imagen muy pesada
**Solución:** Usa los métodos con transformaciones:
```typescript
getMobileImageUrl()  // Para móviles
getDesktopImageUrl() // Para desktop
```

---

## 📞 Contacto

Si tienes dudas, revisa:
- Dashboard Cloudinary: https://console.cloudinary.com/
- Documentación: https://cloudinary.com/documentation
- Public ID de tus imágenes: Media Library → Selecciona imagen → Info

---

**Última actualización:** 2025-11-18
**Cloud Name:** dvotyd4uj
