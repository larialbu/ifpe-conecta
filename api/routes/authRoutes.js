const express = require('express');
const router = express.Router();
const {
  register,
  login,
  confirmarEmail,
  reenviarConfirmacao,
  me,
  atualizarPerfil,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/registro', register);
router.post('/login', login);
router.post('/confirmar-email', confirmarEmail);
router.get('/confirmar-email', confirmarEmail);
router.post('/reenviar-confirmacao', reenviarConfirmacao);
router.get('/me', authMiddleware, me);
router.put('/perfil', authMiddleware, atualizarPerfil);

module.exports = router;
