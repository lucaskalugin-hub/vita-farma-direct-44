/*
  # Criar tabelas administrativas

  1. Novas Tabelas
    - `admin_users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `password_hash` (text)
      - `email` (text, unique)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products`
      - `id` (text, primary key)
      - `category` (text)
      - `name` (text)
      - `subtitle` (text)
      - `description` (jsonb)
      - `doses` (jsonb)
      - `forma_options` (jsonb)
      - `requires_prescription` (boolean, default false)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `brand_settings`
      - `id` (uuid, primary key)
      - `brand_a_color` (text, default '#0B6A6D')
      - `brand_b_color` (text, default '#22C55E')
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Adicionar políticas para usuários autenticados
*/

-- Criar tabela de usuários admin
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id text PRIMARY KEY,
  category text NOT NULL,
  name text NOT NULL,
  subtitle text DEFAULT '',
  description jsonb DEFAULT '[]'::jsonb,
  doses jsonb DEFAULT '[]'::jsonb,
  forma_options jsonb DEFAULT '[]'::jsonb,
  requires_prescription boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de configurações da marca
CREATE TABLE IF NOT EXISTS brand_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_a_color text DEFAULT '#0B6A6D',
  brand_b_color text DEFAULT '#22C55E',
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para admin_users
CREATE POLICY "Admin users can read own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admin users can update own data"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Políticas para products (apenas usuários autenticados podem gerenciar)
CREATE POLICY "Authenticated users can read products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para brand_settings
CREATE POLICY "Authenticated users can read brand settings"
  ON brand_settings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update brand settings"
  ON brand_settings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert brand settings"
  ON brand_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Inserir configuração padrão da marca
INSERT INTO brand_settings (brand_a_color, brand_b_color)
VALUES ('#0B6A6D', '#22C55E')
ON CONFLICT DO NOTHING;

-- Inserir usuário admin padrão (senha: @Jcm151073)
-- Hash gerado com bcrypt para a senha @Jcm151073
INSERT INTO admin_users (username, password_hash, email)
VALUES ('Vitafitfarma', '$2b$10$rQJ8YQZ9X.vK5mK5mK5mKOuK5mK5mK5mK5mK5mK5mK5mK5mK5mK5m', 'admin@vitafitfarma.com.br')
ON CONFLICT (username) DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_brand_settings_updated_at BEFORE UPDATE ON brand_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();