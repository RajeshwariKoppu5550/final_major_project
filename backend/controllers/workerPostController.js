const WorkerPost = require('../models/WorkerPost');

exports.createWorkerPost = async (req, res) => {
  try {
    const post = new WorkerPost(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllWorkerPosts = async (req, res) => {
  try {
    const posts = await WorkerPost.find();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getWorkerPostById = async (req, res) => {
  try {
    const post = await WorkerPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Worker post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateWorkerPost = async (req, res) => {
  try {
    const post = await WorkerPost.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ message: 'Worker post not found.' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteWorkerPost = async (req, res) => {
  try {
    const post = await WorkerPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Worker post not found.' });
    res.json({ message: 'Worker post deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 