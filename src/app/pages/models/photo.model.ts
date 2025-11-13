export interface Photo {
  _id?: string;
  userId: string; // ID del usuario que subió la foto
  location: string; // Localidad donde fue tomada
  event: string; // Evento
  date: string; // Fecha en formato ISO string (YYYY-MM-DD)
  comment: string; // Comentario
  imageUrl: string; // URL de la imagen subida
  createdAt?: string; // Fecha de creación (opcional)
}
