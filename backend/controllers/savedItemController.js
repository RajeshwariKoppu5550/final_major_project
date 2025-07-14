const SavedItem = require('../models/SavedItem');

exports.saveItem = async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;
    const existing = await SavedItem.findOne({ userId, itemId, itemType });
    if (existing) return res.status(400).json({ message: 'Already saved.' });
    const saved = new SavedItem({ userId, itemId, itemType });
    await saved.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getSavedItems = async (req, res) => {
  try {
    const { userId } = req.query;
    const items = await SavedItem.find({ userId });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.unsaveItem = async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;
    const deleted = await SavedItem.findOneAndDelete({ userId, itemId, itemType });
    if (!deleted) return res.status(404).json({ message: 'Not found.' });
    res.json({ message: 'Item unsaved.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 