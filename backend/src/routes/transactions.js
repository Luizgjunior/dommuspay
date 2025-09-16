const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateToken } = require('../middleware/auth');
const { validateTransaction } = require('../middleware/validation');

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Rotas de transações
router.post('/', validateTransaction, transactionController.create);
router.get('/', transactionController.list);
router.get('/recent', transactionController.getRecent);
router.get('/stats', transactionController.getStats);
router.get('/:id', transactionController.getById);
router.put('/:id', validateTransaction, transactionController.update);
router.delete('/:id', transactionController.delete);
router.delete('/bulk/delete', transactionController.deleteMultiple);

module.exports = router;
