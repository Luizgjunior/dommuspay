const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateCategory } = require('../middleware/validation');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de categorias
router.get('/', categoryController.list);
router.get('/stats', categoryController.getStats);
router.get('/:id', categoryController.getById);
router.post('/', validateCategory, categoryController.create);
router.put('/:id', validateCategory, categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
