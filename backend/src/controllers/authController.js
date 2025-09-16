const database = require('../utils/database');
const { hashPassword, verifyPassword, generateToken, isValidEmail } = require('../utils/helpers');

class AuthController {
    // Registrar novo usuário
    async register(req, res) {
        try {
            const { name, email, password } = req.body;

            // Validar email
            if (!isValidEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
            }

            // Verificar se usuário já existe
            const existingUser = await database.get(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'Usuário já existe com este email'
                });
            }

            // Hash da senha
            const passwordHash = await hashPassword(password);

            // Criar usuário
            const result = await database.run(
                `INSERT INTO users (name, email, password_hash) 
                 VALUES (?, ?, ?)`,
                [name, email, passwordHash]
            );

            // Criar configurações padrão
            await database.run(
                `INSERT INTO user_settings (user_id, monthly_limit, daily_limit, alert_threshold) 
                 VALUES (?, ?, ?, ?)`,
                [result.id, 0, 0, 80]
            );

            // Criar categorias padrão
            const defaultCategories = [
                { name: 'Salário', type: 'income', color: '#10b981', icon: 'fas fa-money-bill-wave' },
                { name: 'Freelance', type: 'income', color: '#3b82f6', icon: 'fas fa-laptop' },
                { name: 'Investimentos', type: 'income', color: '#8b5cf6', icon: 'fas fa-chart-line' },
                { name: 'Vendas', type: 'income', color: '#f59e0b', icon: 'fas fa-shopping-cart' },
                { name: 'Outros', type: 'income', color: '#6b7280', icon: 'fas fa-ellipsis-h' },
                { name: 'Alimentação', type: 'expense', color: '#ef4444', icon: 'fas fa-utensils' },
                { name: 'Moradia', type: 'expense', color: '#f59e0b', icon: 'fas fa-home' },
                { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: 'fas fa-car' },
                { name: 'Saúde', type: 'expense', color: '#10b981', icon: 'fas fa-heart' },
                { name: 'Educação', type: 'expense', color: '#8b5cf6', icon: 'fas fa-graduation-cap' },
                { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'fas fa-gamepad' },
                { name: 'Roupas', type: 'expense', color: '#f97316', icon: 'fas fa-tshirt' },
                { name: 'Contas', type: 'expense', color: '#ef4444', icon: 'fas fa-file-invoice' },
                { name: 'Outros', type: 'expense', color: '#6b7280', icon: 'fas fa-ellipsis-h' }
            ];

            for (const category of defaultCategories) {
                await database.run(
                    `INSERT INTO categories (user_id, name, type, color, icon) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [result.id, category.name, category.type, category.color, category.icon]
                );
            }

            // Gerar token
            const token = generateToken({ 
                id: result.id, 
                email, 
                name 
            });

            res.status(201).json({
                success: true,
                message: 'Usuário criado com sucesso',
                data: {
                    user: {
                        id: result.id,
                        name,
                        email
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erro no registro:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Login do usuário
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Buscar usuário
            const user = await database.get(
                'SELECT id, name, email, password_hash FROM users WHERE email = ?',
                [email]
            );

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            // Verificar senha
            const isValidPassword = await verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciais inválidas'
                });
            }

            // Gerar token
            const token = generateToken({ 
                id: user.id, 
                email: user.email, 
                name: user.name 
            });

            res.json({
                success: true,
                message: 'Login realizado com sucesso',
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Verificar token
    async verifyToken(req, res) {
        try {
            const user = await database.get(
                'SELECT id, name, email, currency, date_format, theme FROM users WHERE id = ?',
                [req.user.id]
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        currency: user.currency,
                        dateFormat: user.date_format,
                        theme: user.theme
                    }
                }
            });

        } catch (error) {
            console.error('Erro na verificação do token:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Login demo (para testes)
    async loginDemo(req, res) {
        try {
            const token = generateToken({ 
                id: 'demo-user-123', 
                email: 'demo@financeiro.com', 
                name: 'Usuário Demo' 
            });

            res.json({
                success: true,
                message: 'Login demo realizado com sucesso',
                data: {
                    user: {
                        id: 'demo-user-123',
                        name: 'Usuário Demo',
                        email: 'demo@financeiro.com'
                    },
                    token
                }
            });

        } catch (error) {
            console.error('Erro no login demo:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new AuthController();
