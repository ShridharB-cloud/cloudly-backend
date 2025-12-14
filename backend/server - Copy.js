import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Cloudly API running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
