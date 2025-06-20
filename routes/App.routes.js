const express = require('express');
const router = express.Router();

const AuthRoutes = require('./Auth.routes');
const FileRoutes = require('./File.routes');

router.use('/auth', AuthRoutes);
router.use('/files', FileRoutes);

module.exports = router;
