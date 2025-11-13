// Tipos personalizados
export type OpcionAuth = 'registro' | 'login' | null;

export interface DatosRegistro {
  name: string;
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
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}