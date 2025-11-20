// frontend/models/news.model.ts

// ==========================================
// ENUMS Y TIPOS
// ==========================================
export enum NewsCategory {
  EVENTS = "events",
  SEMINARS = "seminars",
  EXAMS = "exams",
  GRADUATIONS = "graduations",
  GENERAL = "general",
  ANNOUNCEMENTS = "announcements",
}

export enum NewsStatus {
  DRAFT = "draft",
  SCHEDULED = "scheduled",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

// ==========================================
// INTERFACES
// ==========================================
export interface NewsImage {
  url: string;
  publicId: string;
  alt: string;
  caption?: string;
}

export interface NewsComment {
  _id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  content: string;
  createdAt: Date | string;
  isApproved: boolean;
  replies?: NewsReply[];
}

export interface NewsReply {
  _id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  content: string;
  createdAt: Date | string;
}

export interface NewsSEO {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  ogImage?: string;
}

export interface News {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;

  featuredImage: NewsImage;
  gallery?: NewsImage[];

  category: NewsCategory;
  tags: string[];

  authorId: string;
  authorName: string;
  authorAvatar?: string;

  status: NewsStatus;
  publishedAt?: Date | string;
  scheduledFor?: Date | string;

  views: number;
  likes: string[];
  comments: NewsComment[];

  seo?: NewsSEO;

  isPinned: boolean;
  allowComments: boolean;
  isActive: boolean;

  eventDate?: Date | string;
  eventLocation?: string;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// ==========================================
// INTERFACES DE RESPUESTA
// ==========================================
export interface NewsListResponse {
  news: News[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NewsStatsResponse {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
}

export interface CommentsResponse {
  comments: NewsComment[];
  allowComments: boolean;
}

// ==========================================
// INTERFACES PARA FORMULARIOS
// ==========================================
export interface CreateNewsRequest {
  title: string;
  subtitle?: string;
  content: string;
  excerpt: string;
  featuredImage: NewsImage;
  gallery?: NewsImage[];
  category: NewsCategory;
  tags?: string[];
  status?: NewsStatus;
  scheduledFor?: Date | string;
  seo?: NewsSEO;
  isPinned?: boolean;
  allowComments?: boolean;
  eventDate?: Date | string;
  eventLocation?: string;
  authorName?: string;
  authorAvatar?: string;
}

export interface UpdateNewsRequest extends Partial<CreateNewsRequest> {}

// ==========================================
// INTERFACES PARA COMENTARIOS
// ==========================================
export interface CreateCommentRequest {
  content: string;
  userName?: string;
  userAvatar?: string;
}

export interface CreateReplyRequest {
  content: string;
  userName?: string;
}

// ==========================================
// UTILIDADES Y CONSTANTES
// ==========================================
export const NEWS_CATEGORY_LABELS: Record<NewsCategory, string> = {
  [NewsCategory.EVENTS]: "📅 Eventos",
  [NewsCategory.SEMINARS]: "🏆 Seminarios",
  [NewsCategory.EXAMS]: "📚 Exámenes",
  [NewsCategory.GRADUATIONS]: "🎓 Graduaciones",
  [NewsCategory.GENERAL]: "📰 Noticias Generales",
  [NewsCategory.ANNOUNCEMENTS]: "📢 Anuncios",
};

export const NEWS_STATUS_LABELS: Record<NewsStatus, string> = {
  [NewsStatus.DRAFT]: "Borrador",
  [NewsStatus.SCHEDULED]: "Programada",
  [NewsStatus.PUBLISHED]: "Publicada",
  [NewsStatus.ARCHIVED]: "Archivada",
};

export const NEWS_CATEGORY_COLORS: Record<NewsCategory, string> = {
  [NewsCategory.EVENTS]: "bg-blue-500",
  [NewsCategory.SEMINARS]: "bg-purple-500",
  [NewsCategory.EXAMS]: "bg-green-500",
  [NewsCategory.GRADUATIONS]: "bg-yellow-500",
  [NewsCategory.GENERAL]: "bg-gray-500",
  [NewsCategory.ANNOUNCEMENTS]: "bg-red-500",
};

export const NEWS_STATUS_COLORS: Record<NewsStatus, string> = {
  [NewsStatus.DRAFT]: "bg-gray-400",
  [NewsStatus.SCHEDULED]: "bg-blue-400",
  [NewsStatus.PUBLISHED]: "bg-green-500",
  [NewsStatus.ARCHIVED]: "bg-orange-400",
};
