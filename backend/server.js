const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const workPostRoutes = require('./routes/workPostRoutes');
const workerPostRoutes = require('./routes/workerPostRoutes');
const connectionRequestRoutes = require('./routes/connectionRequestRoutes');
const chatMessageRoutes = require('./routes/chatMessageRoutes');
const savedItemRoutes = require('./routes/savedItemRoutes');
const errorHandler = require('./middlewares/errorHandler');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/users', userRoutes);
app.use('/api/work-posts', workPostRoutes);
app.use('/api/worker-posts', workerPostRoutes);
app.use('/api/connection-requests', connectionRequestRoutes);
app.use('/api/chats', chatMessageRoutes);
app.use('/api/saved-items', savedItemRoutes);

// Serve static files from React
app.use(express.static(path.join(__dirname, '../project/dist')));

// Fallback: serve React index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../project/dist', 'index.html'));
});

// Error handler
app.use(errorHandler);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 