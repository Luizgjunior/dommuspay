const database = require('../utils/database');

class CategoryController {
    // Listar categorias do usuário
    async list(req, res) {
        try {
            const userId = req.user.id;
            const { type } = req.query;

            let sql = 'SELECT * FROM categories WHERE user_id = ?';
            const params = [userId];

            if (type) {
                sql += ' AND type = ?';
                params.push(type);
            }

            sql += ' ORDER BY name ASC';

            const categories = await database.all(sql, params);

            res.json({
                success: true,
                data: { categories }
            });

        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Criar nova categoria
    async create(req, res) {
        try {
            const { name, type, color = '#8b5cf6', icon } = req.body;
            const userId = req.user.id;

            // Verificar se categoria já existe para este usuário
            const existingCategory = await database.get(
                'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ?',
                [userId, name, type]
            );

            if (existingCategory) {
                return res.status(409).json({
                    success: false,
                    message: 'Categoria já existe para este tipo'
                });
            }

            const result = await database.run(
                `INSERT INTO categories (user_id, name, type, color, icon) 
                 VALUES (?, ?, ?, ?, ?)`,
                [userId, name, type, color, icon]
            );

            // Buscar categoria criada
            const category = await database.get(
                'SELECT * FROM categories WHERE id = ?',
                [result.id]
            );

            res.status(201).json({
                success: true,
                message: 'Categoria criada com sucesso',
                data: { category }
            });

        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar categoria
    async update(req, res) {
        try {
            const { id } = req.params;
            const { name, color, icon } = req.body;
            const userId = req.user.id;

            // Verificar se categoria existe e pertence ao usuário
            const existingCategory = await database.get(
                'SELECT id, type FROM categories WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }

            // Verificar se novo nome já existe para este tipo
            if (name && name !== existingCategory.name) {
                const duplicateCategory = await database.get(
                    'SELECT id FROM categories WHERE user_id = ? AND name = ? AND type = ? AND id != ?',
                    [userId, name, existingCategory.type, id]
                );

                if (duplicateCategory) {
                    return res.status(409).json({
                        success: false,
                        message: 'Já existe uma categoria com este nome para este tipo'
                    });
                }
            }

            // Atualizar categoria
            await database.run(
                `UPDATE categories 
                 SET name = ?, color = ?, icon = ?
                 WHERE id = ? AND user_id = ?`,
                [name, color, icon, id, userId]
            );

            // Buscar categoria atualizada
            const updatedCategory = await database.get(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Categoria atualizada com sucesso',
                data: { category: updatedCategory }
            });

        } catch (error) {
            console.error('Erro ao atualizar categoria:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Excluir categoria
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Verificar se categoria existe e pertence ao usuário
            const existingCategory = await database.get(
                'SELECT id FROM categories WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!existingCategory) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }

            // Verificar se há transações usando esta categoria
            const transactionsCount = await database.get(
                'SELECT COUNT(*) as count FROM transactions WHERE user_id = ? AND category = (SELECT name FROM categories WHERE id = ?)',
                [userId, id]
            );

            if (transactionsCount.count > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Não é possível excluir esta categoria. Ela está sendo usada em ${transactionsCount.count} transação(ões).`
                });
            }

            // Excluir categoria
            await database.run(
                'DELETE FROM categories WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            res.json({
                success: true,
                message: 'Categoria excluída com sucesso'
            });

        } catch (error) {
            console.error('Erro ao excluir categoria:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar categoria por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const category = await database.get(
                'SELECT * FROM categories WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: 'Categoria não encontrada'
                });
            }

            res.json({
                success: true,
                data: { category }
            });

        } catch (error) {
            console.error('Erro ao buscar categoria:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Estatísticas de categorias
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, type } = req.query;

            let sql = `
                SELECT 
                    c.name,
                    c.type,
                    c.color,
                    c.icon,
                    COALESCE(SUM(t.amount), 0) as total_amount,
                    COUNT(t.id) as transaction_count
                FROM categories c
                LEFT JOIN transactions t ON c.name = t.category AND t.user_id = ?
            `;
            
            const params = [userId];

            // Aplicar filtros de data
            if (startDate || endDate) {
                sql += ' WHERE ';
                const conditions = [];

                if (startDate) {
                    conditions.push('t.date >= ?');
                    params.push(startDate);
                }

                if (endDate) {
                    conditions.push('t.date <= ?');
                    params.push(endDate);
                }

                sql += conditions.join(' AND ');
            }

            if (type) {
                sql += (startDate || endDate) ? ' AND ' : ' WHERE ';
                sql += 'c.type = ?';
                params.push(type);
            }

            sql += ' GROUP BY c.id, c.name, c.type, c.color, c.icon ORDER BY total_amount DESC';

            const categoryStats = await database.all(sql, params);

            res.json({
                success: true,
                data: { categoryStats }
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas de categorias:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new CategoryController();
