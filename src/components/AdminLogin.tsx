import React, { useState } from 'react';
import { z } from 'zod';

// Login credentials validation schema
const loginSchema = z.object({
  username: z.string().trim().min(1, 'Usuário é obrigatório'),
  password: z.string().trim().min(1, 'Senha é obrigatória')
});

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse(formData);
      
      // Check credentials
      if (validatedData.username === 'Vitafitfarma' && validatedData.password === '@Jcm151073') {
        // Set 24-hour session
        const expirationTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
        localStorage.setItem('adminKey', 'vitafit-admin');
        localStorage.setItem('adminSessionExpiry', expirationTime.toString());
        onLoginSuccess();
      } else {
        setError('Credenciais inválidas.');
      }
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        setError(validationError.errors[0]?.message || 'Dados inválidos');
      } else {
        setError('Erro no login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    setError(''); // Clear error when user types
  };

  return (
    <div className="min-h-screen bg-brand-gradient flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="https://i.ibb.co/N6jMRywM/logo-vitafit-fundobranco-removebg-preview.png" 
            alt="VitaFit Farma" 
            className="h-16 w-auto mx-auto mb-4"
            loading="eager"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            VitaFit — Área Administrativa
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange('username')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Digite seu usuário"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange('password')}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Digite sua senha"
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-lg p-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* Warning Text */}
        <div className="mt-8 text-center">
          <p className="text-red-600 font-bold text-sm">
            🔒 Área restrita 🔒 Área restrita 🔒 Área restrita 🔒
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;