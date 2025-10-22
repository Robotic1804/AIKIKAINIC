export type UserRole = 'user' | 'admin' | 'webmaster';

export interface Privilegios {
  gestionarUsuarios?: boolean;
  gestionarContenido?: boolean;
  verReportes?: boolean;
  configurarSistema?: boolean;
  [key: string]: boolean | undefined;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  role: UserRole;
  token?: string;
 
}

export interface PerfilResponse {
  _id: string;
  nombre: string;
  email: string;
  role: UserRole;

}
export interface UsuarioLista {
  _id: string;
  nombre: string;
  email: string;
  role: UserRole;
  fechaRegistro?: Date;
}

export interface CrearAdminResponse {
  message: string;
  usuario: UsuarioLista
 
}