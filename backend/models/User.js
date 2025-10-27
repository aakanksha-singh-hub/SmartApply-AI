const { Schema } = require('mongoose');
const { mongoose } = require('../db');

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  accessLevel: { type: String, required: true, default: 'User' },
  createdAt: { type: Date, default: Date.now },
  
  // Enhanced Profile Data
  enhancedProfile: {
    // Basic profile info
    name: String,
    email: String,
    location: String,
    phone: String,
    bio: String,
    age: Number,
    educationLevel: String,
    skills: [String],
    interests: [String],
    careerInterest: String,
    
    // Career Assessment Data
    careerAssessment: {
      responses: Schema.Types.Mixed,
      completedAt: Date,
      assessmentType: String
    },
    
    // Career Recommendations
    careerRecommendations: [{
      id: String,
      title: String,
      description: String,
      fitScore: Number,
      salaryRange: {
        min: Number,
        max: Number,
        currency: String,
        period: String
      },
      growthProspects: String,
      requiredSkills: [String],
      recommendedPath: Schema.Types.Mixed,
      jobMarketData: Schema.Types.Mixed,
      primaryCareer: String,
      relatedRoles: [String],
      careerPath: Schema.Types.Mixed,
      alternatives: [Schema.Types.Mixed],
      summary: String
    }],
    
    selectedCareerPath: String,
    
    // Skill Analysis and Learning
    skillGapAnalysis: Schema.Types.Mixed,
    learningRoadmap: Schema.Types.Mixed,
    
    // Resume Analysis
    resumeVersions: [Schema.Types.Mixed],
    
    // Progress Tracking
    progressData: {
      overallProgress: { type: Number, default: 0 },
      skillProgress: Schema.Types.Mixed,
      milestoneProgress: Schema.Types.Mixed,
      learningActivities: [Schema.Types.Mixed],
      lastUpdated: { type: Date, default: Date.now }
    },
    
    // Gamification
    achievements: [Schema.Types.Mixed],
    currentMilestones: [Schema.Types.Mixed],
    level: { type: Number, default: 1 },
    experiencePoints: { type: Number, default: 0 },
    badges: [Schema.Types.Mixed],
    streaks: {
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActivityDate: { type: Date, default: Date.now },
      streakType: { type: String, default: 'daily' },
      streakGoal: { type: Number, default: 7 }
    },
    
    // Profile metadata
    profileCreatedAt: { type: Date, default: Date.now },
    profileUpdatedAt: { type: Date, default: Date.now }
  }
});

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
