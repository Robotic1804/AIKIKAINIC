import { Usuario } from './user.model';

export interface RespuestaAuth {
  mensaje: string;
  token: string;
  usuario?: Usuario;
  admin?: Usuario;
}

export interface CrearAdminResponse {
  mensaje: string;
  admin?: Usuario;
}

export interface ListaAdminsResponse {
  admins: Usuario[];
  total: number;
  limitAlcanzado: boolean;
}

export interface RefreshTokenResponse {
  token: string;
}
