const ConnectionRequest = require('../models/ConnectionRequest');

exports.createConnectionRequest = async (req, res) => {
  try {
    const { senderId, receiverId, type } = req.body;

    if (!senderId || !receiverId) {
      return res.status(400).json({ message: 'Sender ID and Receiver ID are required.' });
    }

    if (senderId === receiverId) {
      return res.status(400).json({ message: 'You cannot send a contact request to yourself.' });
    }

    // Check for existing pending request
    const existingRequest = await ConnectionRequest.findOne({
      senderId,
      receiverId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'A pending request already exists.' });
    }

    const request = new ConnectionRequest(req.body);
    await request.save();
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllConnectionRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getConnectionRequestById = async (req, res) => {
  try {
    const request = await ConnectionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Connection request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateConnectionRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!request) return res.status(404).json({ message: 'Connection request not found.' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteConnectionRequest = async (req, res) => {
  try {
    const request = await ConnectionRequest.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: 'Connection request not found.' });
    res.json({ message: 'Connection request deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 