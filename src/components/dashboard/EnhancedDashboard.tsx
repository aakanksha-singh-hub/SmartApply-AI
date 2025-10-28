import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DashboardLayout } from './DashboardLayout';
import { DashboardHeader } from './DashboardHeader';
import { CareerRoadmapDisplay } from './CareerRoadmapDisplay';
import { LearningResourcesSection } from './LearningResourcesSection';
import { ProgressTrackingVisualization } from './ProgressTrackingVisualization';
import { SimilarJobsRecommendation } from './SimilarJobsRecommendation';
import { EnhancedUserProfile } from '@/lib/types';
import { useUserStore } from '@/lib/stores/userStore';

interface EnhancedDashboardProps {
  profile: EnhancedUserProfile;
}

/**
 * Enhanced Dashboard Component - Clean, organized interface with all dashboard sections
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4
 * - Clean dashboard layout with organized sections
 * - Career roadmap display
 * - Learning resources with domain-specific materials
 * - Progress tracking visualization
 * - Similar jobs recommendation section
 * - Responsive design for mobile and desktop
 */
export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({ profile }) => {
  const navigate = useNavigate();
  const { setEnhancedProfile, awardExperience } = useUserStore();

  // Get the current career roadmap from recommendations
  const currentRoadmap = profile.careerRecommendations?.[0] || null;

  const handleLogout = () => {
    // Simple logout confirmation as per requirements (2.1, 2.2)
    const confirmed = window.confirm('Do you want to log out?');
    if (confirmed) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('career-mentor-store');
      toast.success('Logged out successfully');
      navigate('/signin');
    }
  };

  const handleSettings = () => {
    navigate('/profile');
  };

  const handleViewFullRoadmap = () => {
    if (currentRoadmap) {
      navigate('/learning-roadmap');
    } else {
      toast.info('Please complete your career assessment first');
      navigate('/assessment');
    }
  };

  const handleUpdateRoadmap = () => {
    navigate('/assessment');
  };

  const handleResourceComplete = (resourceId: string) => {
    // Award experience points for completing a resource
    awardExperience(50, `Completed learning resource: ${resourceId}`);
    
    // Update profile with completed resource
    const updatedProfile = {
      ...profile,
      progressData: {
        ...profile.progressData,
        learningActivities: [
          ...(profile.progressData?.learningActivities || []),
          {
            id: `activity_${Date.now()}`,
            resourceId,
            title: 'Learning Resource',
            type: 'course' as const,
            completedAt: new Date(),
            timeSpent: 30,
            skillsGained: [],
          }
        ],
        overallProgress: Math.min((profile.progressData?.overallProgress || 0) + 5, 100),
        lastUpdated: new Date()
      },
      updatedAt: new Date()
    };
    
    setEnhancedProfile(updatedProfile);
    toast.success('Resource marked as completed! +50 XP');
  };

  const handleViewAllResources = () => {
    navigate('/learning-resources');
  };

  const handleViewDetailedProgress = () => {
    navigate('/achievements');
  };

  const handleViewJobDetails = (jobId: string) => {
    // Navigate to job details or open external link
    toast.info(`Viewing details for job: ${jobId}`);
  };

  const handleSaveJob = (jobId: string) => {
    toast.success('Job saved to your bookmarks');
  };

  const handleViewAllJobs = () => {
    // Navigate to job search or external job board
    toast.info('Opening job search...');
  };

  return (
    <DashboardLayout>
      {/* Dashboard Header */}
      <DashboardHeader
        profile={profile}
        onLogout={handleLogout}
        onSettings={handleSettings}
      />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Career Roadmap - Top Left */}
        <CareerRoadmapDisplay
          roadmap={currentRoadmap}
          onViewFullRoadmap={handleViewFullRoadmap}
          onUpdateRoadmap={handleUpdateRoadmap}
        />

        {/* Progress Tracking - Top Right */}
        <ProgressTrackingVisualization
          profile={profile}
          onViewDetailedProgress={handleViewDetailedProgress}
        />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Resources - Bottom Left */}
        <LearningResourcesSection
          profile={profile}
          onResourceComplete={handleResourceComplete}
          onViewAllResources={handleViewAllResources}
        />

        {/* Similar Jobs - Bottom Right */}
        <SimilarJobsRecommendation
          profile={profile}
          onViewJobDetails={handleViewJobDetails}
          onSaveJob={handleSaveJob}
          onViewAllJobs={handleViewAllJobs}
        />
      </div>

      {/* Quick Stats Footer */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">
            {profile.careerRecommendations?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Career Matches</div>
        </div>
        <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">
            {profile.progressData?.learningActivities?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Completed Activities</div>
        </div>
        <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">
            {profile.achievements?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
        <div className="text-center p-4 bg-white/60 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-orange-600">
            {profile.level || 1}
          </div>
          <div className="text-sm text-gray-600">Current Level</div>
        </div>
      </div>
    </DashboardLayout>
  );
};