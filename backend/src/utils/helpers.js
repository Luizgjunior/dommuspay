const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Configurações
const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-2024';
const JWT_EXPIRES_IN = '7d';

// Hash de senha
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// Verificar senha
const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

// Gerar JWT
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verificar JWT
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Formatar data para SQLite
const formatDate = (date) => {
    if (!date) return new Date().toISOString().split('T')[0];
    return new Date(date).toISOString().split('T')[0];
};

// Formatar moeda
const formatCurrency = (amount, currency = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Validar email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Gerar ID único
const generateId = () => {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// Sanitizar string
const sanitizeString = (str) => {
    if (!str) return '';
    return str.toString().trim().replace(/[<>]/g, '');
};

// Calcular estatísticas financeiras
const calculateFinancialStats = (transactions) => {
    const stats = {
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        transactionCount: transactions.length,
        categories: {}
    };

    transactions.forEach(transaction => {
        if (transaction.type === 'income') {
            stats.totalIncome += transaction.amount;
        } else {
            stats.totalExpense += transaction.amount;
        }

        // Agrupar por categoria
        if (!stats.categories[transaction.category]) {
            stats.categories[transaction.category] = {
                income: 0,
                expense: 0,
                total: 0
            };
        }

        if (transaction.type === 'income') {
            stats.categories[transaction.category].income += transaction.amount;
        } else {
            stats.categories[transaction.category].expense += transaction.amount;
        }
        stats.categories[transaction.category].total += transaction.amount;
    });

    stats.balance = stats.totalIncome - stats.totalExpense;
    return stats;
};

// Paginação
const paginate = (data, page = 1, limit = 25) => {
    const offset = (page - 1) * limit;
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    
    return {
        data: data.slice(offset, offset + limit),
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    formatDate,
    formatCurrency,
    isValidEmail,
    generateId,
    sanitizeString,
    calculateFinancialStats,
    paginate
};
