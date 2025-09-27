import { supabase } from './supabaseClient';

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export class AdminAuthService {
  private static instance: AdminAuthService;
  private currentUser: AdminUser | null = null;

  static getInstance(): AdminAuthService {
    if (!AdminAuthService.instance) {
      AdminAuthService.instance = new AdminAuthService();
    }
    return AdminAuthService.instance;
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    try {
      // Verificar credenciais hardcoded primeiro (fallback)
      if (credentials.username === 'Vitafitfarma' && credentials.password === '@Jcm151073') {
        const hardcodedUser: AdminUser = {
          id: 'hardcoded-admin',
          username: 'Vitafitfarma',
          email: 'admin@vitafitfarma.com.br',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        this.currentUser = hardcodedUser;
        this.setSession(hardcodedUser);
        return { success: true, user: hardcodedUser };
      }

      // Tentar autenticação via Supabase
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('username', credentials.username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return { success: false, error: 'Credenciais inválidas' };
      }

      // Verificar senha (por simplicidade, comparação direta - em produção usar bcrypt)
      if (credentials.password !== '@Jcm151073') {
        return { success: false, error: 'Credenciais inválidas' };
      }

      this.currentUser = data;
      this.setSession(data);
      return { success: true, user: data };

    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do servidor' };
    }
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('adminKey');
    localStorage.removeItem('adminSessionExpiry');
    localStorage.removeItem('adminUser');
  }

  getCurrentUser(): AdminUser | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Tentar recuperar da sessão
    const adminKey = localStorage.getItem('adminKey');
    const sessionExpiry = localStorage.getItem('adminSessionExpiry');
    const adminUser = localStorage.getItem('adminUser');

    if (adminKey === 'vitafit-admin' && sessionExpiry && adminUser) {
      const expiryTime = parseInt(sessionExpiry, 10);
      const now = Date.now();

      if (now < expiryTime) {
        try {
          this.currentUser = JSON.parse(adminUser);
          return this.currentUser;
        } catch (error) {
          console.error('Erro ao recuperar usuário da sessão:', error);
        }
      }
    }

    return null;
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  private setSession(user: AdminUser): void {
    const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 horas
    localStorage.setItem('adminKey', 'vitafit-admin');
    localStorage.setItem('adminSessionExpiry', expirationTime.toString());
    localStorage.setItem('adminUser', JSON.stringify(user));
  }

  checkSession(): boolean {
    const adminKey = localStorage.getItem('adminKey');
    const sessionExpiry = localStorage.getItem('adminSessionExpiry');

    if (adminKey === 'vitafit-admin' && sessionExpiry) {
      const expiryTime = parseInt(sessionExpiry, 10);
      const now = Date.now();

      if (now < expiryTime) {
        return true;
      } else {
        this.logout();
      }
    }

    return false;
  }
}

export const adminAuth = AdminAuthService.getInstance();