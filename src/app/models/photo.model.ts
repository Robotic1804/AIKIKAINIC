export interface Photo {
  _id: string;
  location: string;
  event: string;
  date: string;
  comment: string;
  imageUrl: string;
  cloudinaryPublicId?: string;
  createdAt?: string;
  updatedAt?: string;
}