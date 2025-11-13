import { Usuario } from "./user.model";

export type UserRole = 'user' | 'admin' | 'webmaster';



/**
 * Respuesta de verificación de email
 */
export interface RespuestaVerificacion {
  success: boolean;
  message: string;
  data?: {
    email: string;
    nombre: string;
  };
}

/**
 * Respuesta de reenvío de verificación
 */
export interface RespuestaReenvio {
  success: boolean;
  message: string;
}

/**
 * Respuesta de solicitud de reset de contraseña
 */
export interface RespuestaSolicitudReset {
  success: boolean;
  message: string;
}

/**
 * Respuesta de verificación de token de reset
 */
export interface RespuestaVerificacionToken {
  success: boolean;
  message: string;
  email?: string;
}

/**
 * Respuesta de reset de contraseña
 */
export interface RespuestaResetPassword {
  success: boolean;
  message: string;
}

/**
 * Datos para solicitar reset de contraseña
 */
export interface SolicitudResetPassword {
  email: string;
}

/**
 * Datos para resetear contraseña
 */
export interface DatosResetPassword {
  password: string;
}

export interface VerificacionConLoginResponse {
  mensaje: string; // El mensaje del backend
  token: string; // El JWT
  refreshToken?: string; // Opcional
  usuario: Usuario; // El objeto Usuario (con id, name, email, role, etc.)
}
