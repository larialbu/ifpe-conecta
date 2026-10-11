const express = require('express');
const router = express.Router();
const {
  listarPosts,
  criarPost,
  curtirPost,
  adicionarComentario,
  listarComentarios,
} = require('../controllers/postController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/authMiddleware');

router.get('/', optionalAuthMiddleware, listarPosts);
router.post('/', authMiddleware, criarPost);
router.post('/:id/like', authMiddleware, curtirPost);
router.get('/:id/comentarios', listarComentarios);
router.post('/:id/comentarios', authMiddleware, adicionarComentario);

module.exports = router;
