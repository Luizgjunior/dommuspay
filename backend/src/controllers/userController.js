const database = require('../utils/database');
const { hashPassword, verifyPassword } = require('../utils/helpers');

class UserController {
    // Buscar perfil do usuário
    async getProfile(req, res) {
        try {
            const userId = req.user.id;

            const user = await database.get(
                'SELECT id, name, email, avatar_url, currency, date_format, theme FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            res.json({
                success: true,
                data: { user }
            });

        } catch (error) {
            console.error('Erro ao buscar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar perfil do usuário
    async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, email, currency, dateFormat, theme } = req.body;

            // Verificar se email já existe em outro usuário
            if (email) {
                const existingUser = await database.get(
                    'SELECT id FROM users WHERE email = ? AND id != ?',
                    [email, userId]
                );

                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        message: 'Email já está em uso por outro usuário'
                    });
                }
            }

            // Atualizar usuário
            await database.run(
                `UPDATE users 
                 SET name = COALESCE(?, name), 
                     email = COALESCE(?, email), 
                     currency = COALESCE(?, currency),
                     date_format = COALESCE(?, date_format),
                     theme = COALESCE(?, theme),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`,
                [name, email, currency, dateFormat, theme, userId]
            );

            // Buscar usuário atualizado
            const updatedUser = await database.get(
                'SELECT id, name, email, avatar_url, currency, date_format, theme FROM users WHERE id = ?',
                [userId]
            );

            res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                data: { user: updatedUser }
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Alterar senha
    async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;

            // Buscar hash da senha atual
            const user = await database.get(
                'SELECT password_hash FROM users WHERE id = ?',
                [userId]
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuário não encontrado'
                });
            }

            // Verificar senha atual
            const isValidPassword = await verifyPassword(currentPassword, user.password_hash);
            if (!isValidPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Senha atual incorreta'
                });
            }

            // Hash da nova senha
            const newPasswordHash = await hashPassword(newPassword);

            // Atualizar senha
            await database.run(
                'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [newPasswordHash, userId]
            );

            res.json({
                success: true,
                message: 'Senha alterada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar configurações do usuário
    async getSettings(req, res) {
        try {
            const userId = req.user.id;

            const settings = await database.get(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (!settings) {
                // Criar configurações padrão se não existirem
                await database.run(
                    `INSERT INTO user_settings (user_id, monthly_limit, daily_limit, alert_threshold) 
                     VALUES (?, ?, ?, ?)`,
                    [userId, 0, 0, 80]
                );

                const newSettings = await database.get(
                    'SELECT * FROM user_settings WHERE user_id = ?',
                    [userId]
                );

                return res.json({
                    success: true,
                    data: { settings: newSettings }
                });
            }

            res.json({
                success: true,
                data: { settings }
            });

        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar configurações do usuário
    async updateSettings(req, res) {
        try {
            const userId = req.user.id;
            const { 
                monthlyLimit, 
                dailyLimit, 
                alertThreshold, 
                itemsPerPage, 
                notifications, 
                autoSave 
            } = req.body;

            // Verificar se configurações existem
            const existingSettings = await database.get(
                'SELECT id FROM user_settings WHERE user_id = ?',
                [userId]
            );

            if (!existingSettings) {
                // Criar configurações se não existirem
                await database.run(
                    `INSERT INTO user_settings (user_id, monthly_limit, daily_limit, alert_threshold, items_per_page, notifications, auto_save) 
                     VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [userId, monthlyLimit || 0, dailyLimit || 0, alertThreshold || 80, itemsPerPage || 25, notifications !== false, autoSave !== false]
                );
            } else {
                // Atualizar configurações existentes
                await database.run(
                    `UPDATE user_settings 
                     SET monthly_limit = COALESCE(?, monthly_limit),
                         daily_limit = COALESCE(?, daily_limit),
                         alert_threshold = COALESCE(?, alert_threshold),
                         items_per_page = COALESCE(?, items_per_page),
                         notifications = COALESCE(?, notifications),
                         auto_save = COALESCE(?, auto_save),
                         updated_at = CURRENT_TIMESTAMP
                     WHERE user_id = ?`,
                    [monthlyLimit, dailyLimit, alertThreshold, itemsPerPage, notifications, autoSave, userId]
                );
            }

            // Buscar configurações atualizadas
            const updatedSettings = await database.get(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );

            res.json({
                success: true,
                message: 'Configurações atualizadas com sucesso',
                data: { settings: updatedSettings }
            });

        } catch (error) {
            console.error('Erro ao atualizar configurações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Estatísticas gerais do usuário
    async getStats(req, res) {
        try {
            const userId = req.user.id;

            // Total de transações
            const totalTransactions = await database.get(
                'SELECT COUNT(*) as count FROM transactions WHERE user_id = ?',
                [userId]
            );

            // Total de receitas
            const totalIncome = await database.get(
                'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "income"',
                [userId]
            );

            // Total de despesas
            const totalExpense = await database.get(
                'SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE user_id = ? AND type = "expense"',
                [userId]
            );

            // Saldo
            const balance = totalIncome.total - totalExpense.total;

            // Transações do mês atual
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            const monthlyTransactions = await database.get(
                'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND date LIKE ?',
                [userId, `${currentMonth}%`]
            );

            // Categorias mais usadas
            const topCategories = await database.all(
                `SELECT category, COUNT(*) as count, SUM(amount) as total
                 FROM transactions 
                 WHERE user_id = ? 
                 GROUP BY category 
                 ORDER BY count DESC 
                 LIMIT 5`,
                [userId]
            );

            res.json({
                success: true,
                data: {
                    stats: {
                        totalTransactions: totalTransactions.count,
                        totalIncome: totalIncome.total,
                        totalExpense: totalExpense.total,
                        balance,
                        monthlyTransactions: monthlyTransactions.count,
                        topCategories
                    }
                }
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Exportar dados do usuário
    async exportData(req, res) {
        try {
            const userId = req.user.id;

            // Buscar todos os dados do usuário
            const user = await database.get(
                'SELECT id, name, email, currency, date_format, theme, created_at FROM users WHERE id = ?',
                [userId]
            );

            const transactions = await database.all(
                'SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC',
                [userId]
            );

            const categories = await database.all(
                'SELECT * FROM categories WHERE user_id = ? ORDER BY type, name',
                [userId]
            );

            const settings = await database.get(
                'SELECT * FROM user_settings WHERE user_id = ?',
                [userId]
            );

            const exportData = {
                user,
                transactions,
                categories,
                settings,
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };

            res.json({
                success: true,
                data: { exportData }
            });

        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new UserController();
