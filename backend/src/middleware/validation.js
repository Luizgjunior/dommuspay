const Joi = require('joi');

// Validação de registro de usuário
const validateUserRegistration = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(100).required().messages({
            'string.min': 'Nome deve ter pelo menos 2 caracteres',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
        email: Joi.string().email().required().messages({
            'string.email': 'Email deve ter formato válido',
            'any.required': 'Email é obrigatório'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Senha deve ter pelo menos 6 caracteres',
            'any.required': 'Senha é obrigatória'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

// Validação de login
const validateLogin = (req, res, next) => {
    const schema = Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email deve ter formato válido',
            'any.required': 'Email é obrigatório'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Senha é obrigatória'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

// Validação de transação
const validateTransaction = (req, res, next) => {
    const schema = Joi.object({
        description: Joi.string().min(1).max(255).required().messages({
            'string.min': 'Descrição é obrigatória',
            'string.max': 'Descrição deve ter no máximo 255 caracteres',
            'any.required': 'Descrição é obrigatória'
        }),
        amount: Joi.number().positive().required().messages({
            'number.positive': 'Valor deve ser positivo',
            'any.required': 'Valor é obrigatório'
        }),
        type: Joi.string().valid('income', 'expense').required().messages({
            'any.only': 'Tipo deve ser "income" ou "expense"',
            'any.required': 'Tipo é obrigatório'
        }),
        category: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Categoria é obrigatória',
            'string.max': 'Categoria deve ter no máximo 100 caracteres',
            'any.required': 'Categoria é obrigatória'
        }),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({
            'string.pattern.base': 'Data deve estar no formato YYYY-MM-DD',
            'any.required': 'Data é obrigatória'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

// Validação de categoria
const validateCategory = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Nome da categoria é obrigatório',
            'string.max': 'Nome deve ter no máximo 100 caracteres',
            'any.required': 'Nome é obrigatório'
        }),
        type: Joi.string().valid('income', 'expense').required().messages({
            'any.only': 'Tipo deve ser "income" ou "expense"',
            'any.required': 'Tipo é obrigatório'
        }),
        color: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional().messages({
            'string.pattern.base': 'Cor deve estar no formato hexadecimal (#RRGGBB)'
        }),
        icon: Joi.string().max(50).optional().messages({
            'string.max': 'Ícone deve ter no máximo 50 caracteres'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

// Validação de configurações
const validateSettings = (req, res, next) => {
    const schema = Joi.object({
        monthly_limit: Joi.number().min(0).optional().messages({
            'number.min': 'Limite mensal deve ser positivo ou zero'
        }),
        daily_limit: Joi.number().min(0).optional().messages({
            'number.min': 'Limite diário deve ser positivo ou zero'
        }),
        alert_threshold: Joi.number().min(0).max(100).optional().messages({
            'number.min': 'Threshold deve ser entre 0 e 100',
            'number.max': 'Threshold deve ser entre 0 e 100'
        }),
        items_per_page: Joi.number().min(5).max(100).optional().messages({
            'number.min': 'Itens por página deve ser entre 5 e 100',
            'number.max': 'Itens por página deve ser entre 5 e 100'
        }),
        notifications: Joi.boolean().optional(),
        auto_save: Joi.boolean().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

module.exports = {
    validateUserRegistration,
    validateLogin,
    validateTransaction,
    validateCategory,
    validateSettings
};
