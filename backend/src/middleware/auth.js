const { verifyToken } = require('../utils/helpers');

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token de acesso necessário' 
        });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(403).json({ 
            success: false, 
            message: 'Token inválido ou expirado' 
        });
    }

    req.user = decoded;
    next();
};

// Middleware opcional de autenticação (para rotas que podem funcionar com ou sem auth)
const optionalAuth = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
            req.user = decoded;
        }
    }

    next();
};

module.exports = {
    authenticateToken,
    optionalAuth
};
