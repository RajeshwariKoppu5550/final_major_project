const express = require('express');
const router = express.Router();
const workPostController = require('../controllers/workPostController');
const auth = require('../middlewares/auth');

router.post('/', auth, workPostController.createWorkPost);
router.get('/', workPostController.getAllWorkPosts);
router.get('/:id', workPostController.getWorkPostById);
router.put('/:id', auth, workPostController.updateWorkPost);
router.delete('/:id', auth, workPostController.deleteWorkPost);

module.exports = router; 