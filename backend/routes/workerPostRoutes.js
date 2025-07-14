const express = require('express');
const router = express.Router();
const workerPostController = require('../controllers/workerPostController');
const auth = require('../middlewares/auth');

router.post('/', auth, workerPostController.createWorkerPost);
router.get('/', workerPostController.getAllWorkerPosts);
router.get('/:id', workerPostController.getWorkerPostById);
router.put('/:id', auth, workerPostController.updateWorkerPost);
router.delete('/:id', auth, workerPostController.deleteWorkerPost);

module.exports = router; 