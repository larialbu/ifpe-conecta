const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { adminMiddleware } = require('../middleware/adminMiddleware');

// Rota pública de login administrativo
router.post('/login', adminController.adminLogin);

// Rotas protegidas por autenticação de administrador
router.get('/stats', adminMiddleware, adminController.getStats);
router.get('/usuarios', adminMiddleware, adminController.listarUsuarios);
router.delete('/usuarios/:id', adminMiddleware, adminController.removerUsuario);
router.post('/disparar-email', adminMiddleware, adminController.dispararEmail);

module.exports = router;

