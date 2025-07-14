const express = require('express');
const router = express.Router();
const chatMessageController = require('../controllers/chatMessageController');
const auth = require('../middlewares/auth');

router.post('/', auth, chatMessageController.sendMessage);
router.get('/', auth, chatMessageController.getMessages);

module.exports = router; 