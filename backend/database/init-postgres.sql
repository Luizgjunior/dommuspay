-- Inicialização do banco PostgreSQL para Sistema de Controle Financeiro

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    currency VARCHAR(3) DEFAULT 'BRL',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    theme VARCHAR(10) DEFAULT 'dark',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias personalizadas
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#8b5cf6',
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    monthly_limit DECIMAL(10,2) DEFAULT 0,
    daily_limit DECIMAL(10,2) DEFAULT 0,
    alert_threshold INTEGER DEFAULT 80,
    items_per_page INTEGER DEFAULT 25,
    notifications BOOLEAN DEFAULT true,
    auto_save BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Inserir usuário demo (apenas se não existir)
INSERT INTO users (id, name, email, password_hash) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Usuário Demo', 'demo@financeiro.com', '$2a$10$demo.hash.here'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@financeiro.com');

-- Inserir categorias padrão para usuário demo (apenas se não existirem)
INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Salário', 'income', '#10b981', 'fas fa-money-bill-wave'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Salário');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Freelance', 'income', '#3b82f6', 'fas fa-laptop'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Freelance');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Investimentos', 'income', '#8b5cf6', 'fas fa-chart-line'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Investimentos');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Vendas', 'income', '#f59e0b', 'fas fa-shopping-cart'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Vendas');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Outros', 'income', '#6b7280', 'fas fa-ellipsis-h'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Outros');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Alimentação', 'expense', '#ef4444', 'fas fa-utensils'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Alimentação');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Moradia', 'expense', '#f59e0b', 'fas fa-home'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Moradia');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Transporte', 'expense', '#3b82f6', 'fas fa-car'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Transporte');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Saúde', 'expense', '#10b981', 'fas fa-heart'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Saúde');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Educação', 'expense', '#8b5cf6', 'fas fa-graduation-cap'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Educação');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Lazer', 'expense', '#ec4899', 'fas fa-gamepad'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Lazer');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Roupas', 'expense', '#f97316', 'fas fa-tshirt'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Roupas');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Contas', 'expense', '#ef4444', 'fas fa-file-invoice'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Contas');

INSERT INTO categories (user_id, name, type, color, icon) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 'Outros', 'expense', '#6b7280', 'fas fa-ellipsis-h'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE user_id = '550e8400-e29b-41d4-a716-446655440000' AND name = 'Outros');

-- Inserir configurações do usuário demo (apenas se não existir)
INSERT INTO user_settings (user_id, monthly_limit, daily_limit, alert_threshold) 
SELECT '550e8400-e29b-41d4-a716-446655440000', 5000.00, 200.00, 80
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_id = '550e8400-e29b-41d4-a716-446655440000');
