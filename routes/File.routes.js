const express = require('express');
const router = express.Router();
const multer = require('../middleware/Mutler.middleware');
const AppController = require('../controllers/App.controller');
const verifyToken = require('../middleware/verifyJWT.middleware');

router.post('/upload',verifyToken, multer.single('file'), AppController.uploadFile);
router.get('/files',verifyToken, AppController.listDir);
router.get('/files/:filename',verifyToken, AppController.downloadFile);
router.delete('/files/:filename',verifyToken, AppController.deleteFile);

module.exports = router;