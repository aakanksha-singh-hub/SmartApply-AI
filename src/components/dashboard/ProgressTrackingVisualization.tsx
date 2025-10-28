import React from 'react';
import { TrendingUp, Target, Award, Calendar, BarChart3, Activity } from 'lucide-react';
import { NBCard } from '@/components/NBCard';
import { NBButton } from '@/components/NBButton';
import { EnhancedUserProfile } from '@/lib/types';

interface ProgressTrackingVisualizationProps {
  profile: EnhancedUserProfile;
  onViewDetailedProgress: () => void;
}

/**
 * Progress tracking visualization component showing user's learning progress
 * Requirements: 6.4, 7.3, 7.4 - Progress tracking visualization with completion marking
 */
export const ProgressTrackingVisualization: React.FC<ProgressTrackingVisualizationProps> = ({
  profile,
  onViewDetailedProgress
}) => {
  const progressData = profile.progressData;
  const achievements = profile.achievements || [];
  const currentLevel = profile.level || 1;
  const experiencePoints = profile.experiencePoints || 0;
  
  // Calculate next level XP requirement (simple formula)
  const xpToNextLevel = currentLevel * 1000;
  const currentLevelXP = experiencePoints % 1000;
  const levelProgress = (currentLevelXP / xpToNextLevel) * 100;

  // Get recent achievements (last 3)
  const recentAchievements = achievements
    .sort((a, b) => new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime())
    .slice(0, 3);

  // Calculate skill progress stats
  const skillProgressEntries = Object.values(progressData?.skillProgress || {});
  const averageSkillProgress = skillProgressEntries.length > 0
    ? skillProgressEntries.reduce((sum, skill) => sum + skill.progress, 0) / skillProgressEntries.length
    : 0;

  // Calculate learning activity stats
  const learningActivities = progressData?.learningActivities || [];
  const thisWeekActivities = learningActivities.filter(activity => {
    const activityDate = new Date(activity.completedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return activityDate >= weekAgo;
  }).length;

  return (
    <NBCard className="p-6 bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border-indigo-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-indigo-900 mb-1">
            Progress Tracking
          </h3>
          <p className="text-indigo-700">
            Your learning journey at a glance
          </p>
        </div>
        <NBButton
          variant="ghost"
          onClick={onViewDetailedProgress}
          className="text-indigo-600 hover:bg-indigo-100"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          View Details
        </NBButton>
      </div>

      {/* Progress Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600">{currentLevel}</div>
          <div className="text-sm text-gray-600">Current Level</div>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{experiencePoints}</div>
          <div className="text-sm text-gray-600">Total XP</div>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{achievements.length}</div>
          <div className="text-sm text-gray-600">Achievements</div>
        </div>
        <div className="text-center p-3 bg-white/60 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{thisWeekActivities}</div>
          <div className="text-sm text-gray-600">This Week</div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-indigo-700">
            Level {currentLevel} Progress
          </span>
          <span className="text-sm text-indigo-600">
            {currentLevelXP} / {xpToNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${levelProgress}%` }}
          />
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-indigo-700">
            Overall Progress
          </span>
          <span className="text-sm text-indigo-600">
            {Math.round(progressData?.overallProgress || 0)}%
          </span>
        </div>
        <div className="w-full bg-indigo-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressData?.overallProgress || 0}%` }}
          />
        </div>
      </div>

      {/* Skills Progress */}
      {skillProgressEntries.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              Skills Progress ({Math.round(averageSkillProgress)}% avg)
            </span>
          </div>
          <div className="space-y-2">
            {skillProgressEntries.slice(0, 3).map((skill, index) => (
              <div key={skill.skillId} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 flex-1">{skill.skillName}</span>
                <div className="flex items-center gap-2 flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                      style={{ width: `${skill.progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {skill.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Award className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              Recent Achievements
            </span>
          </div>
          <div className="space-y-2">
            {recentAchievements.map((achievement) => (
              <div key={achievement.id} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                <div className="text-lg">{achievement.badgeIcon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(achievement.earnedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-xs text-indigo-600 font-medium">
                  +{achievement.experiencePoints} XP
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Summary */}
      <div className="bg-white/60 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">
            Activity Summary
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Completed Activities</div>
            <div className="font-medium text-gray-900">{learningActivities.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Last Activity</div>
            <div className="font-medium text-gray-900">
              {learningActivities.length > 0 
                ? new Date(learningActivities[learningActivities.length - 1].completedAt).toLocaleDateString()
                : 'None yet'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-indigo-200">
        <div className="flex flex-wrap gap-2">
          <NBButton
            variant="ghost"
            onClick={onViewDetailedProgress}
            className="text-indigo-600 hover:bg-indigo-100 text-sm"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Analytics
          </NBButton>
          <NBButton
            variant="ghost"
            className="text-indigo-600 hover:bg-indigo-100 text-sm"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Schedule
          </NBButton>
          <NBButton
            variant="ghost"
            className="text-indigo-600 hover:bg-indigo-100 text-sm"
          >
            <Award className="h-3 w-3 mr-1" />
            Achievements
          </NBButton>
        </div>
      </div>
    </NBCard>
  );
};