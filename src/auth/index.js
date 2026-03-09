
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET_KEY = process.env.JWT_SECRET || 'minha_chave_secreta';

// Usuário de exemplo
const users = [
  { id: 1, username: 'admin', password: '$2b$10$rX9zWWMNztjTDqLCdZXS8uLAwXYI1ckGWumG98g.uOumzXPAKQNqa' }
  // senha: "123456" (hash)
];

// Login: retorna token
async function login(username, password) {
  const user = users.find(u => u.username === username);
  if (!user) return null;

  const match = await bcrypt.compare(password, user.password);
  if (!match) return null;

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
    expiresIn: '1h'
  });

  return token;
}

// Verifica token
function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET_KEY);
  } catch (err) {
    return null;
  }
}

module.exports = { login, verifyToken };
