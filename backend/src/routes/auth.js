const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateUserRegistration, validateLogin } = require('../middleware/validation');

// Rotas de autenticação
router.post('/register', validateUserRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/demo', authController.loginDemo);
router.get('/verify', authController.verifyToken);

module.exports = router;
