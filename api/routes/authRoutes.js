const express = require('express');
const router = express.Router();
const {
  register,
  login,
  me,
  atualizarPerfil,
} = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/registro', register);
router.post('/login', login);
router.get('/me', authMiddleware, me);
router.put('/perfil', authMiddleware, atualizarPerfil);

module.exports = router;
