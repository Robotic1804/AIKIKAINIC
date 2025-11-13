export type UserRole = 'user' | 'admin' | 'webmaster';

export interface Privilegios {
  gestionarUsuarios?: boolean;
  gestionarContenido?: boolean;
  verReportes?: boolean;
  configurarSistema?: boolean;
  [key: string]: boolean | undefined;
}

// ✅ Para login, registro, etc.
export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  instructorId?: string;
  token?: string;
}

export interface PerfilResponse {
  _id: string;
  name: string; // ✅
  email: string;
  role: UserRole;
}

// ✅ Lista de usuarios (para admin)
export interface UsuarioLista {
  _id: string;
  name: string; // ✅
  email: string;
  role: UserRole;
  fechaRegistro?: Date; // ✅ Esto puede mantenerse en español si lo usas solo en frontend
}

// ✅ Respuesta al crear admin
export interface CrearAdminResponse {
  message: string;
  usuario: UsuarioLista;
}
