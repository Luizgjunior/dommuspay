-- Inicialização do banco SQLite para Sistema de Controle Financeiro

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    currency TEXT DEFAULT 'BRL',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    theme TEXT DEFAULT 'dark',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de categorias personalizadas
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    color TEXT DEFAULT '#8b5cf6',
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabela de configurações do usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    monthly_limit REAL DEFAULT 0,
    daily_limit REAL DEFAULT 0,
    alert_threshold INTEGER DEFAULT 80,
    items_per_page INTEGER DEFAULT 25,
    notifications BOOLEAN DEFAULT 1,
    auto_save BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Inserir categorias padrão para usuário demo
INSERT OR IGNORE INTO users (id, name, email, password_hash) VALUES 
('demo-user-123', 'Usuário Demo', 'demo@financeiro.com', '$2a$10$demo.hash.here');

INSERT OR IGNORE INTO categories (user_id, name, type, color, icon) VALUES 
('demo-user-123', 'Salário', 'income', '#10b981', 'fas fa-money-bill-wave'),
('demo-user-123', 'Freelance', 'income', '#3b82f6', 'fas fa-laptop'),
('demo-user-123', 'Investimentos', 'income', '#8b5cf6', 'fas fa-chart-line'),
('demo-user-123', 'Vendas', 'income', '#f59e0b', 'fas fa-shopping-cart'),
('demo-user-123', 'Outros', 'income', '#6b7280', 'fas fa-ellipsis-h'),
('demo-user-123', 'Alimentação', 'expense', '#ef4444', 'fas fa-utensils'),
('demo-user-123', 'Moradia', 'expense', '#f59e0b', 'fas fa-home'),
('demo-user-123', 'Transporte', 'expense', '#3b82f6', 'fas fa-car'),
('demo-user-123', 'Saúde', 'expense', '#10b981', 'fas fa-heart'),
('demo-user-123', 'Educação', 'expense', '#8b5cf6', 'fas fa-graduation-cap'),
('demo-user-123', 'Lazer', 'expense', '#ec4899', 'fas fa-gamepad'),
('demo-user-123', 'Roupas', 'expense', '#f97316', 'fas fa-tshirt'),
('demo-user-123', 'Contas', 'expense', '#ef4444', 'fas fa-file-invoice'),
('demo-user-123', 'Outros', 'expense', '#6b7280', 'fas fa-ellipsis-h');

INSERT OR IGNORE INTO user_settings (user_id, monthly_limit, daily_limit, alert_threshold) VALUES 
('demo-user-123', 5000.00, 200.00, 80);
