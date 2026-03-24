const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/login', auth.login);
router.post('/register', auth.register);
router.get('/my-account', authMiddleware, auth.getMe);

// User management
router.post('/accounts', authMiddleware, auth.createAccount);   // POST /api/auth/accounts
router.get('/', authMiddleware, auth.getUsers);          // GET  /api/auth/accounts?page=1&limit=10

module.exports = router;