const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/Auth.controller');

router.get('/refresh', AuthController.handleRefreshToken);
router.post('/register', AuthController.handleNewUser);
router.post('/login', AuthController.handleLogin);
router.get('/logout', AuthController.handleLogout);

module.exports = router;