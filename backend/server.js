const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { connectDb } = require('./db');
const User = require('./models/User');
const Resume = require('./models/Resume');
const { hashPassword, comparePassword } = require('./utils/password');
const profileRoutes = require('./routes/profileRoutes');

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

// Profile and progress persistence routes
app.use('/profile', authMiddleware, profileRoutes);

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

// Resume Analysis History endpoints
app.post('/user/resume-analysis-history', authMiddleware, async (req, res) => {
  try {
    const { analysisData } = req.body;
    
    // Find user and add to analysis history
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize analysis history if not exists
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }
    if (!user.enhancedProfile.resumeAnalysisHistory) {
      user.enhancedProfile.resumeAnalysisHistory = [];
    }

    // Add new analysis to history
    user.enhancedProfile.resumeAnalysisHistory.push({
      ...analysisData,
      createdAt: new Date()
    });

    // Keep only last 10 analyses
    if (user.enhancedProfile.resumeAnalysisHistory.length > 10) {
      user.enhancedProfile.resumeAnalysisHistory = user.enhancedProfile.resumeAnalysisHistory.slice(-10);
    }

    await user.save();
    res.json({ success: true, history: user.enhancedProfile.resumeAnalysisHistory });
  } catch (error) {
    console.log('Error saving resume analysis history');
    res.status(500).json({ error: 'Processing save' });
  }
});

app.get('/user/resume-analysis-history', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const history = user.enhancedProfile?.resumeAnalysisHistory || [];
    res.json({ history });
  } catch (error) {
    console.log('Error retrieving resume analysis history');
    res.status(500).json({ error: 'Processing retrieval' });
  }
});

// Resume Version Storage endpoints
// Save a resume version with content
app.post('/user/resume-version', authMiddleware, async (req, res) => {
  try {
    const { version } = req.body;
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize resume versions if not exists
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }
    if (!user.enhancedProfile.resumeVersions) {
      user.enhancedProfile.resumeVersions = [];
    }

    // Add new version to history
    user.enhancedProfile.resumeVersions.push({
      ...version,
      savedAt: new Date()
    });

    // Keep only last 20 versions
    if (user.enhancedProfile.resumeVersions.length > 20) {
      user.enhancedProfile.resumeVersions = user.enhancedProfile.resumeVersions.slice(-20);
    }

    await user.save();
    console.log(`✅ Resume version saved for user ${req.user.id}`);
    res.json({ success: true, versions: user.enhancedProfile.resumeVersions });
  } catch (error) {
    console.log('Error saving resume version:', error.message);
    res.status(500).json({ error: 'Processing save' });
  }
});

// Get all resume versions
app.get('/user/resume-versions', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const versions = user.enhancedProfile?.resumeVersions || [];
    console.log(`✅ Retrieved ${versions.length} resume versions for user ${req.user.id}`);
    res.json({ versions });
  } catch (error) {
    console.log('Error retrieving resume versions');
    res.status(500).json({ error: 'Processing retrieval' });
  }
});

// Enhanced Profile endpoints
// Save enhanced profile
app.post('/user/enhanced-profile', authMiddleware, async (req, res) => {
  try {
    const enhancedProfileData = req.body;
    
    // Add metadata
    enhancedProfileData.profileCreatedAt = new Date();
    enhancedProfileData.profileUpdatedAt = new Date();
    
    console.log('=== SAVING ENHANCED PROFILE ===');
    console.log('User ID:', req.user.id);
    console.log('Profile data keys:', Object.keys(enhancedProfileData));
    console.log('Profile name:', enhancedProfileData.name);
    console.log('Career interest:', enhancedProfileData.careerInterest);
    console.log('Has recommendations:', !!enhancedProfileData.careerRecommendations);
    console.log('Recommendations count:', enhancedProfileData.careerRecommendations?.length || 0);
    
    // First, find the user
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      console.error('❌ User not found:', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log('✓ User found:', user.username);
    
    // Set the enhanced profile directly
    user.enhancedProfile = enhancedProfileData;
    
    console.log('Attempting to save to MongoDB...');
    
    // Save the user
    await user.save();
    
    console.log('✅ Enhanced profile saved successfully!');
    console.log('Profile careerInterest:', user.enhancedProfile.careerInterest);
    res.json(user.enhancedProfile);
  } catch (err) {
    console.error('❌❌❌ SAVE ENHANCED PROFILE ERROR ❌❌❌');
    console.error('Error type:', err.name);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    if (err.errors) {
      console.error('Validation errors:', JSON.stringify(err.errors, null, 2));
    }
    console.error('Full error:', err);
    console.error('Stack trace:', err.stack);
    res.status(500).json({ 
      error: 'Failed to save enhanced profile', 
      details: err.message,
      code: err.code,
      name: err.name
    });
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

// Learning Resources endpoints

// Get learning progress for user
app.get('/user/learning-progress', authMiddleware, async (req, res) => {
  try {
    const { domain, subfield } = req.query;
    console.log('Getting learning progress for user:', req.user.id, { domain, subfield });
    
    const user = await User.findById(req.user.id).select('enhancedProfile').exec();
    if (!user || !user.enhancedProfile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Get or create learning progress
    let learningProgress = user.enhancedProfile.learningProgress || {
      userId: req.user.id,
      domain: domain || 'all',
      subfield,
      overallProgress: 0,
      completedResources: [],
      inProgressResources: [],
      skillsAcquired: [],
      timeSpent: 0,
      studyStreak: 0,
      lastActivityDate: new Date(),
      milestones: [],
      achievements: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json(learningProgress);
  } catch (err) {
    console.error('Get learning progress error:', err);
    res.status(500).json({ error: 'Failed to get learning progress' });
  }
});

// Update learning progress
app.post('/user/learning-progress', authMiddleware, async (req, res) => {
  try {
    const progressUpdate = req.body;
    console.log('Updating learning progress for user:', req.user.id, progressUpdate);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Update learning progress
    user.enhancedProfile.learningProgress = {
      ...user.enhancedProfile.learningProgress,
      ...progressUpdate,
      updatedAt: new Date()
    };

    await user.save();
    
    console.log('Learning progress updated successfully');
    res.json(user.enhancedProfile.learningProgress);
  } catch (err) {
    console.error('Update learning progress error:', err);
    res.status(500).json({ error: 'Failed to update learning progress' });
  }
});

// Update resource completion
app.post('/user/resource-completion', authMiddleware, async (req, res) => {
  try {
    const { resourceId, completed, progress, timeSpent, rating, notes, skillsPracticed } = req.body;
    console.log('Updating resource completion for user:', req.user.id, { resourceId, completed });
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Initialize learning progress if it doesn't exist
    if (!user.enhancedProfile.learningProgress) {
      user.enhancedProfile.learningProgress = {
        userId: req.user.id,
        domain: 'all',
        overallProgress: 0,
        completedResources: [],
        inProgressResources: [],
        skillsAcquired: [],
        timeSpent: 0,
        studyStreak: 0,
        lastActivityDate: new Date(),
        milestones: [],
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    const learningProgress = user.enhancedProfile.learningProgress;

    // Update resource completion status
    if (completed && !learningProgress.completedResources.includes(resourceId)) {
      learningProgress.completedResources.push(resourceId);
      // Remove from in-progress if it was there
      learningProgress.inProgressResources = learningProgress.inProgressResources.filter(id => id !== resourceId);
    } else if (!completed && !learningProgress.inProgressResources.includes(resourceId)) {
      learningProgress.inProgressResources.push(resourceId);
    }

    // Update skills acquired
    if (skillsPracticed && skillsPracticed.length > 0) {
      skillsPracticed.forEach(skill => {
        if (!learningProgress.skillsAcquired.includes(skill)) {
          learningProgress.skillsAcquired.push(skill);
        }
      });
    }

    // Update time spent
    if (timeSpent) {
      learningProgress.timeSpent = (learningProgress.timeSpent || 0) + timeSpent;
    }

    // Update timestamps
    learningProgress.lastActivityDate = new Date();
    learningProgress.updatedAt = new Date();

    // Recalculate overall progress
    const totalResources = learningProgress.completedResources.length + learningProgress.inProgressResources.length;
    if (totalResources > 0) {
      learningProgress.overallProgress = Math.round((learningProgress.completedResources.length / totalResources) * 100);
    }

    await user.save();
    
    console.log('Resource completion updated successfully');
    res.json({ 
      success: true, 
      learningProgress: user.enhancedProfile.learningProgress 
    });
  } catch (err) {
    console.error('Update resource completion error:', err);
    res.status(500).json({ error: 'Failed to update resource completion' });
  }
});

// Save learning checklist
app.post('/user/learning-checklist', authMiddleware, async (req, res) => {
  try {
    const checklist = req.body;
    console.log('Saving learning checklist for user:', req.user.id, checklist.id);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Initialize learning checklists array if it doesn't exist
    if (!user.enhancedProfile.learningChecklists) {
      user.enhancedProfile.learningChecklists = [];
    }

    // Update or add checklist
    const existingIndex = user.enhancedProfile.learningChecklists.findIndex(c => c.id === checklist.id);
    if (existingIndex >= 0) {
      user.enhancedProfile.learningChecklists[existingIndex] = checklist;
    } else {
      user.enhancedProfile.learningChecklists.push(checklist);
    }

    await user.save();
    
    console.log('Learning checklist saved successfully');
    res.json(checklist);
  } catch (err) {
    console.error('Save learning checklist error:', err);
    res.status(500).json({ error: 'Failed to save learning checklist' });
  }
});

// Get learning checklists
app.get('/user/learning-checklists', authMiddleware, async (req, res) => {
  try {
    const { domain } = req.query;
    console.log('Getting learning checklists for user:', req.user.id, { domain });
    
    const user = await User.findById(req.user.id).select('enhancedProfile.learningChecklists').exec();
    if (!user || !user.enhancedProfile) {
      return res.json([]);
    }

    let checklists = user.enhancedProfile.learningChecklists || [];
    
    // Filter by domain if specified
    if (domain) {
      checklists = checklists.filter(checklist => checklist.domain === domain);
    }

    res.json(checklists);
  } catch (err) {
    console.error('Get learning checklists error:', err);
    res.status(500).json({ error: 'Failed to get learning checklists' });
  }
});

// Update learning resources completed
app.post('/user/learning-resources-completed', authMiddleware, async (req, res) => {
  try {
    const { completedResources } = req.body;
    console.log('Updating completed resources for user:', req.user.id, 'Count:', completedResources?.length);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Update completed resources
    user.enhancedProfile.learningResourcesCompleted = completedResources || [];

    await user.save();
    
    console.log('Completed resources updated successfully');
    res.json({ 
      success: true, 
      learningResourcesCompleted: user.enhancedProfile.learningResourcesCompleted 
    });
  } catch (err) {
    console.log('Update completed resources - processing');
    res.status(500).json({ error: 'Processing update' });
  }
});

// Get learning resources completed
app.get('/user/learning-resources-completed', authMiddleware, async (req, res) => {
  try {
    console.log('Getting completed resources for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('enhancedProfile.learningResourcesCompleted').exec();
    if (!user || !user.enhancedProfile) {
      return res.json([]);
    }

    res.json(user.enhancedProfile.learningResourcesCompleted || []);
  } catch (err) {
    console.log('Get completed resources - processing');
    res.json([]);
  }
});

// User Profile and Dashboard State endpoints

// Save dashboard state
app.post('/user/dashboard-state', authMiddleware, async (req, res) => {
  try {
    const dashboardState = req.body;
    console.log('Saving dashboard state for user:', req.user.id);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Save dashboard state
    user.enhancedProfile.dashboardState = {
      ...dashboardState,
      lastVisited: new Date()
    };

    await user.save();
    
    console.log('Dashboard state saved successfully');
    res.json({ success: true, dashboardState: user.enhancedProfile.dashboardState });
  } catch (err) {
    console.error('Save dashboard state error:', err);
    res.status(500).json({ error: 'Failed to save dashboard state' });
  }
});

// Get dashboard state
app.get('/user/dashboard-state', authMiddleware, async (req, res) => {
  try {
    console.log('Getting dashboard state for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('enhancedProfile.dashboardState').exec();
    if (!user || !user.enhancedProfile || !user.enhancedProfile.dashboardState) {
      return res.status(404).json({ error: 'Dashboard state not found' });
    }

    res.json(user.enhancedProfile.dashboardState);
  } catch (err) {
    console.error('Get dashboard state error:', err);
    res.status(500).json({ error: 'Failed to get dashboard state' });
  }
});

// Save session progress
app.post('/user/session-progress', authMiddleware, async (req, res) => {
  try {
    const sessionData = req.body;
    console.log('Saving session progress for user:', req.user.id, sessionData.sessionId);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Initialize session progress array if it doesn't exist
    if (!user.enhancedProfile.sessionProgress) {
      user.enhancedProfile.sessionProgress = [];
    }

    // Update or add session progress
    const existingIndex = user.enhancedProfile.sessionProgress.findIndex(
      s => s.sessionId === sessionData.sessionId
    );
    
    if (existingIndex >= 0) {
      user.enhancedProfile.sessionProgress[existingIndex] = sessionData;
    } else {
      user.enhancedProfile.sessionProgress.push(sessionData);
    }

    await user.save();
    
    console.log('Session progress saved successfully');
    res.json({ success: true, sessionData });
  } catch (err) {
    console.error('Save session progress error:', err);
    res.status(500).json({ error: 'Failed to save session progress' });
  }
});

// Get session progress
app.get('/user/session-progress/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Getting session progress for user:', req.user.id, sessionId);
    
    const user = await User.findById(req.user.id).select('enhancedProfile.sessionProgress').exec();
    if (!user || !user.enhancedProfile || !user.enhancedProfile.sessionProgress) {
      return res.status(404).json({ error: 'Session progress not found' });
    }

    const sessionProgress = user.enhancedProfile.sessionProgress.find(
      s => s.sessionId === sessionId
    );

    if (!sessionProgress) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(sessionProgress);
  } catch (err) {
    console.error('Get session progress error:', err);
    res.status(500).json({ error: 'Failed to get session progress' });
  }
});

// Get user's complete profile data
app.get('/user/complete-profile', authMiddleware, async (req, res) => {
  try {
    console.log('Getting complete profile for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('-passwordHash').exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update last login date
    user.lastLoginDate = new Date();
    await user.save();

    const profileData = {
      id: user._id,
      username: user.username,
      accessLevel: user.accessLevel,
      createdAt: user.createdAt,
      lastLoginDate: user.lastLoginDate,
      enhancedProfile: user.enhancedProfile
    };

    console.log('Complete profile loaded successfully');
    res.json(profileData);
  } catch (err) {
    console.error('Get complete profile error:', err);
    res.status(500).json({ error: 'Failed to get complete profile' });
  }
});

// Sync progress data
app.post('/user/sync-progress', authMiddleware, async (req, res) => {
  try {
    const progressData = req.body;
    console.log('Syncing progress data for user:', req.user.id);
    
    const user = await User.findById(req.user.id).exec();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Initialize enhanced profile if it doesn't exist
    if (!user.enhancedProfile) {
      user.enhancedProfile = {};
    }

    // Merge progress data
    user.enhancedProfile.learningProgress = {
      ...user.enhancedProfile.learningProgress,
      ...progressData,
      updatedAt: new Date()
    };

    await user.save();
    
    console.log('Progress data synced successfully');
    res.json({ success: true, learningProgress: user.enhancedProfile.learningProgress });
  } catch (err) {
    console.error('Sync progress error:', err);
    res.status(500).json({ error: 'Failed to sync progress data' });
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
