const database = require('../utils/database');
const { formatDate, calculateFinancialStats, paginate } = require('../utils/helpers');

class TransactionController {
    // Criar nova transação
    async create(req, res) {
        try {
            const { description, amount, type, category, date } = req.body;
            const userId = req.user.id;

            const result = await database.run(
                `INSERT INTO transactions (user_id, description, amount, type, category, date) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, description, amount, type, category, formatDate(date)]
            );

            // Buscar transação criada
            const transaction = await database.get(
                'SELECT * FROM transactions WHERE id = ?',
                [result.id]
            );

            res.status(201).json({
                success: true,
                message: 'Transação criada com sucesso',
                data: { transaction }
            });

        } catch (error) {
            console.error('Erro ao criar transação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Listar transações com filtros
    async list(req, res) {
        try {
            const userId = req.user.id;
            const { 
                page = 1, 
                limit = 25, 
                type, 
                category, 
                startDate, 
                endDate,
                search 
            } = req.query;

            let sql = 'SELECT * FROM transactions WHERE user_id = ?';
            const params = [userId];

            // Aplicar filtros
            if (type) {
                sql += ' AND type = ?';
                params.push(type);
            }

            if (category) {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (startDate) {
                sql += ' AND date >= ?';
                params.push(formatDate(startDate));
            }

            if (endDate) {
                sql += ' AND date <= ?';
                params.push(formatDate(endDate));
            }

            if (search) {
                sql += ' AND (description LIKE ? OR category LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            // Ordenar por data (mais recente primeiro)
            sql += ' ORDER BY date DESC, created_at DESC';

            // Buscar todas as transações para filtros
            const allTransactions = await database.all(sql, params);
            
            // Aplicar paginação
            const paginatedData = paginate(allTransactions, page, limit);

            res.json({
                success: true,
                data: {
                    transactions: paginatedData.data,
                    pagination: paginatedData.pagination
                }
            });

        } catch (error) {
            console.error('Erro ao listar transações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Buscar transação por ID
    async getById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const transaction = await database.get(
                'SELECT * FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!transaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transação não encontrada'
                });
            }

            res.json({
                success: true,
                data: { transaction }
            });

        } catch (error) {
            console.error('Erro ao buscar transação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Atualizar transação
    async update(req, res) {
        try {
            const { id } = req.params;
            const { description, amount, type, category, date } = req.body;
            const userId = req.user.id;

            // Verificar se transação existe e pertence ao usuário
            const existingTransaction = await database.get(
                'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!existingTransaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transação não encontrada'
                });
            }

            // Atualizar transação
            await database.run(
                `UPDATE transactions 
                 SET description = ?, amount = ?, type = ?, category = ?, date = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ? AND user_id = ?`,
                [description, amount, type, category, formatDate(date), id, userId]
            );

            // Buscar transação atualizada
            const updatedTransaction = await database.get(
                'SELECT * FROM transactions WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Transação atualizada com sucesso',
                data: { transaction: updatedTransaction }
            });

        } catch (error) {
            console.error('Erro ao atualizar transação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Excluir transação
    async delete(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            // Verificar se transação existe e pertence ao usuário
            const existingTransaction = await database.get(
                'SELECT id FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            if (!existingTransaction) {
                return res.status(404).json({
                    success: false,
                    message: 'Transação não encontrada'
                });
            }

            // Excluir transação
            await database.run(
                'DELETE FROM transactions WHERE id = ? AND user_id = ?',
                [id, userId]
            );

            res.json({
                success: true,
                message: 'Transação excluída com sucesso'
            });

        } catch (error) {
            console.error('Erro ao excluir transação:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Estatísticas financeiras
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const { startDate, endDate, type } = req.query;

            let sql = 'SELECT * FROM transactions WHERE user_id = ?';
            const params = [userId];

            // Aplicar filtros de data
            if (startDate) {
                sql += ' AND date >= ?';
                params.push(formatDate(startDate));
            }

            if (endDate) {
                sql += ' AND date <= ?';
                params.push(formatDate(endDate));
            }

            if (type) {
                sql += ' AND type = ?';
                params.push(type);
            }

            const transactions = await database.all(sql, params);
            const stats = calculateFinancialStats(transactions);

            res.json({
                success: true,
                data: { stats }
            });

        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Transações recentes (para dashboard)
    async getRecent(req, res) {
        try {
            const userId = req.user.id;
            const { limit = 5 } = req.query;

            const transactions = await database.all(
                `SELECT * FROM transactions 
                 WHERE user_id = ? 
                 ORDER BY date DESC, created_at DESC 
                 LIMIT ?`,
                [userId, parseInt(limit)]
            );

            res.json({
                success: true,
                data: { transactions }
            });

        } catch (error) {
            console.error('Erro ao buscar transações recentes:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    // Excluir múltiplas transações
    async deleteMultiple(req, res) {
        try {
            const { ids } = req.body;
            const userId = req.user.id;

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'IDs das transações são obrigatórios'
                });
            }

            // Verificar se todas as transações pertencem ao usuário
            const placeholders = ids.map(() => '?').join(',');
            const transactions = await database.all(
                `SELECT id FROM transactions WHERE id IN (${placeholders}) AND user_id = ?`,
                [...ids, userId]
            );

            if (transactions.length !== ids.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Algumas transações não foram encontradas ou não pertencem ao usuário'
                });
            }

            // Excluir transações
            await database.run(
                `DELETE FROM transactions WHERE id IN (${placeholders}) AND user_id = ?`,
                [...ids, userId]
            );

            res.json({
                success: true,
                message: `${ids.length} transação(ões) excluída(s) com sucesso`
            });

        } catch (error) {
            console.error('Erro ao excluir múltiplas transações:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new TransactionController();
