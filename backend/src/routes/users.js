const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { validateSettings } = require('../middleware/validation');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de usuário
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/password', userController.changePassword);
router.get('/settings', userController.getSettings);
router.put('/settings', validateSettings, userController.updateSettings);
router.get('/stats', userController.getStats);
router.get('/export', userController.exportData);

module.exports = router;
