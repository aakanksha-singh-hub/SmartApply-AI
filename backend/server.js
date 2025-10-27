const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { connectDb } = require('./db');
const User = require('./models/User');
const Resume = require('./models/Resume');
const { hashPassword, comparePassword } = require('./utils/password');

dotenv.config();

const app = express();
app.use(cors()); // allow all origins
app.use(express.json());

// If frontend calls endpoints under /api, strip the prefix so existing routes work
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    req.url = req.url.replace(/^\/api/, '')
  }
  next()
})

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.slice(7);
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/', (req, res) => {
  res.json({ message: 'SmartApply-AI backend running' });
});

// Register: expects { username, password }
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
  const existing = await User.findOne({ username }).exec();
  if (existing) return res.status(409).json({ error: 'User already exists' });
  const hash = await hashPassword(password);
  const user = new User({ username, passwordHash: hash });
    await user.save();
  const token = generateToken({ id: user._id, username: user.username, accessLevel: user.accessLevel });
  res.json({ user: { id: user._id, username: user.username, accessLevel: user.accessLevel }, token });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Login: expects { username, password }
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  try {
  const user = await User.findOne({ username }).exec();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = generateToken({ id: user._id, username: user.username, accessLevel: user.accessLevel });
  res.json({ user: { id: user._id, username: user.username, accessLevel: user.accessLevel }, token });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Protected route: returns current user info (from token)
app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash').exec();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Me error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

// Simple resume endpoints (filler)
app.post('/resume', authMiddleware, async (req, res) => {
  // expects { filename, text, metadata }
  const { filename, text, metadata } = req.body || {};
  const resume = new Resume({ userId: req.user.id, filename, text, metadata });
  await resume.save();
  res.json({ resume });
});

app.get('/resume', authMiddleware, async (req, res) => {
  const list = await Resume.find({ userId: req.user.id }).exec();
  res.json({ resumes: list });
});

// Enhanced Profile endpoints
// Save enhanced profile
app.post('/user/enhanced-profile', authMiddleware, async (req, res) => {
  try {
    const enhancedProfileData = req.body;
    
    // Add metadata
    enhancedProfileData.profileCreatedAt = new Date();
    enhancedProfileData.profileUpdatedAt = new Date();
    
    console.log('Saving enhanced profile for user:', req.user.id);
    console.log('Enhanced profile data keys:', Object.keys(enhancedProfileData));
    
    // First, find the user
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Set the enhanced profile directly
    user.enhancedProfile = enhancedProfileData;
    
    // Save the user
    await user.save();
    
    console.log('Enhanced profile saved successfully');
    res.json(user.enhancedProfile);
  } catch (err) {
    console.error('Save enhanced profile error:', err);
    console.error('Error details:', err.message);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ error: 'Failed to save enhanced profile', details: err.message });
  }
});

// Load enhanced profile
app.get('/user/enhanced-profile', authMiddleware, async (req, res) => {
  try {
    console.log('Loading enhanced profile for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('enhancedProfile').exec();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if enhanced profile exists and has meaningful data
    const profile = user.enhancedProfile;
    if (!profile || 
        (!profile.name && 
         !profile.careerRecommendations?.length && 
         !profile.careerAssessment?.completedAt)) {
      console.log('No meaningful enhanced profile found for user');
      return res.status(404).json({ error: 'Enhanced profile not found' });
    }
    
    console.log('Enhanced profile loaded successfully');
    res.json(user.enhancedProfile);
  } catch (err) {
    console.error('Load enhanced profile error:', err);
    res.status(500).json({ error: 'Failed to load enhanced profile' });
  }
});

// Update enhanced profile
app.patch('/user/enhanced-profile', authMiddleware, async (req, res) => {
  try {
    const updates = req.body;
    console.log('Updating enhanced profile for user:', req.user.id);
    console.log('Updates:', updates);
    
    // Prepare update object with dot notation for nested updates
    const updateObj = {};
    Object.keys(updates).forEach(key => {
      updateObj[`enhancedProfile.${key}`] = updates[key];
    });
    updateObj['enhancedProfile.profileUpdatedAt'] = new Date();
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateObj,
      { new: true, upsert: false }
    ).select('enhancedProfile').exec();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.enhancedProfile) {
      return res.status(404).json({ error: 'Enhanced profile not found' });
    }
    
    console.log('Enhanced profile updated successfully');
    res.json(user.enhancedProfile);
  } catch (err) {
    console.error('Update enhanced profile error:', err);
    res.status(500).json({ error: 'Failed to update enhanced profile' });
  }
});

// Delete enhanced profile
app.delete('/user/enhanced-profile', authMiddleware, async (req, res) => {
  try {
    console.log('Deleting enhanced profile for user:', req.user.id);
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { enhancedProfile: 1 } },
      { new: true }
    ).select('-passwordHash').exec();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('Enhanced profile deleted successfully');
    res.json({ message: 'Enhanced profile deleted successfully' });
  } catch (err) {
    console.error('Delete enhanced profile error:', err);
    res.status(500).json({ error: 'Failed to delete enhanced profile' });
  }
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`SmartApply backend listening on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

// Prevent server crashes from unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
