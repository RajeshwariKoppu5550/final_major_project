const ChatMessage = require('../models/ChatMessage');

exports.sendMessage = async (req, res) => {
  try {
    const message = new ChatMessage(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { chatId } = req.query;
    // chatId can be a composite key or filter by sender/receiver
    const messages = await ChatMessage.find({
      $or: [
        { senderId: req.query.userId },
        { receiverId: req.query.userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 