const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_ifpe_olinda_Conecta_jwt_key_2026';

function adminMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso negado. Token administrativo não fornecido.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Token administrativo inválido ou expirado.' });
    }

    if (decoded.role !== 'admin' && decoded.tipo !== 'admin') {
      return res.status(403).json({
        error: 'Acesso restrito. Usuários normais só têm acesso ao sistema principal. Apenas administradores podem acessar esta área.',
      });
    }

    req.admin = decoded;
    next();
  });
}

module.exports = { adminMiddleware };

