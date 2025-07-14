const express = require('express');
const router = express.Router();
const connectionRequestController = require('../controllers/connectionRequestController');
const auth = require('../middlewares/auth');

router.post('/', auth, connectionRequestController.createConnectionRequest);
router.get('/', auth, connectionRequestController.getAllConnectionRequests);
router.get('/:id', auth, connectionRequestController.getConnectionRequestById);
router.put('/:id', auth, connectionRequestController.updateConnectionRequest);
router.delete('/:id', auth, connectionRequestController.deleteConnectionRequest);

module.exports = router; 