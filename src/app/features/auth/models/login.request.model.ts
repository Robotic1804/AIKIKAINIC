export interface LoginCredenciales {
  email: string;
  password: string;
}

export interface LoginAdminCredenciales extends LoginCredenciales {
  codigo2FA?: string;
}
