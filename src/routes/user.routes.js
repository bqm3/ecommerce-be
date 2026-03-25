const router = require('express').Router();
const user = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', authMiddleware, user.getUsers);
router.get('/:id', authMiddleware, user.getUser);
router.put('/:id', authMiddleware, user.updateUser);
router.delete('/:id', authMiddleware, user.deleteUser);

module.exports = router;
