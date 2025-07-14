const express = require('express');
const router = express.Router();
const savedItemController = require('../controllers/savedItemController');
const auth = require('../middlewares/auth');

router.post('/', auth, savedItemController.saveItem);
router.get('/', auth, savedItemController.getSavedItems);
router.delete('/', auth, savedItemController.unsaveItem);

module.exports = router; 