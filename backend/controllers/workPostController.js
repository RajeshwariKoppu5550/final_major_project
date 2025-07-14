const WorkPost = require('../models/WorkPost');

exports.createWorkPost = async (req, res) => {
  try {
    const post = new WorkPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllWorkPosts = async (req, res) => {
  try {
    const posts = await WorkPost.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getWorkPostById = async (req, res) => {
  try {
    const post = await WorkPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Work post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateWorkPost = async (req, res) => {
  try {
    const post = await WorkPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Work post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteWorkPost = async (req, res) => {
  try {
    const post = await WorkPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Work post not found.' });
    res.json({ message: 'Work post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 