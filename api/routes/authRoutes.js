const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  atualizarPerfil,
  obterPerfilPublico,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/registro', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/perfil', authMiddleware, atualizarPerfil);
router.get('/usuario/:id', obterPerfilPublico);

module.exports = router;
