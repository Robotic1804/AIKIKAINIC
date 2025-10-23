// Tipos personalizados
export type OpcionAuth = 'registro' | 'login' | null;

export interface DatosRegistro {
  nombre: string;
  email: string;
  password: string;
}

export interface DatosLogin {
  email: string;
  password: string;
}

export interface ErrorResponse {
  error?: {
    mensaje?: string;
    message?: string;
  };
  message?: string;
}
export interface RegistroFormValues {
  nombre: string;
  email: string;
  password: string;
  confirmarPassword: string;
}