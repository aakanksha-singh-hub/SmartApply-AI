import React from 'react';
import { Briefcase, TrendingUp, MapPin, DollarSign, ExternalLink, Bookmark } from 'lucide-react';
import { NBCard } from '@/components/NBCard';
import { NBButton } from '@/components/NBButton';
import { AlternativeCareer, EnhancedUserProfile } from '@/lib/types';

interface SimilarJobsRecommendationProps {
  profile: EnhancedUserProfile;
  onViewJobDetails: (jobId: string) => void;
  onSaveJob: (jobId: string) => void;
  onViewAllJobs: () => void;
}

/**
 * Similar jobs recommendation section showing related career opportunities
 * Requirements: 8.1, 8.2, 8.3, 8.4 - Display similar job roles with different experience levels and internships
 */
export const SimilarJobsRecommendation: React.FC<SimilarJobsRecommendationProps> = ({
  profile,
  onViewJobDetails,
  onSaveJob,
  onViewAllJobs
}) => {
  // Get similar jobs from career recommendations
  const similarJobs = profile.careerRecommendations
    ?.flatMap(rec => rec.alternatives || [])
    ?.slice(0, 4) || []; // Show first 4 similar jobs

  // Add some mock internship opportunities for entry-level users
  const mockInternships = profile.experiencePoints < 500 ? [
    {
      id: 'intern-1',
      title: `${profile.careerInterest || 'Technology'} Intern`,
      description: 'Gain hands-on experience in your field of interest',
      matchScore: 90,
      salary: '$15-25/hour',
      requirements: ['Basic skills', 'Eagerness to learn', 'Communication'],
      growth: 'high' as const,
      type: 'internship'
    }
  ] : [];

  const allJobs = [...similarJobs, ...mockInternships];

  const getGrowthColor = (growth: string) => {
    switch (growth) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (allJobs.length === 0) {
    return (
      <NBCard className="p-6 bg-gradient-to-r from-orange-50/90 to-red-50/90 border-orange-200">
        <div className="text-center">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-orange-500" />
          <h3 className="text-lg font-semibold text-orange-700 mb-2">
            No Similar Jobs Found
          </h3>
          <p className="text-orange-600 mb-4">
            Complete your career assessment to discover similar job opportunities
          </p>
          <NBButton 
            variant="primary"
            onClick={onViewAllJobs}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            Explore Jobs
          </NBButton>
        </div>
      </NBCard>
    );
  }

  return (
    <NBCard className="p-6 bg-gradient-to-r from-cyan-50/90 to-blue-50/90 border-cyan-200">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-semibold text-cyan-900 mb-1">
            Similar Job Opportunities
          </h3>
          <p className="text-cyan-700">
            Related roles in {profile.careerInterest || 'your domain'}
          </p>
        </div>
        <NBButton
          variant="ghost"
          onClick={onViewAllJobs}
          className="text-cyan-600 hover:bg-cyan-100"
        >
          View All Jobs
        </NBButton>
      </div>

      {/* Jobs Grid */}
      <div className="space-y-4">
        {allJobs.map((job) => (
          <div
            key={job.id}
            className="p-4 bg-white/80 rounded-lg border border-cyan-200 hover:border-cyan-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase className="h-4 w-4 text-cyan-600" />
                  <h4 className="font-semibold text-gray-900">{job.title}</h4>
                  {(job as any).type === 'internship' && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Internship
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{job.description}</p>
                
                {/* Job Details */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {job.salary}
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGrowthColor(job.growth)}`}>
                      {job.growth} growth
                    </span>
                  </div>
                  <div className={`font-medium ${getMatchScoreColor(job.matchScore)}`}>
                    {job.matchScore}% match
                  </div>
                </div>

                {/* Required Skills */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {job.requirements.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.requirements.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{job.requirements.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 ml-4">
                <NBButton
                  variant="ghost"
                  onClick={() => onSaveJob(job.id)}
                  className="text-cyan-600 hover:bg-cyan-100 p-2"
                >
                  <Bookmark className="h-4 w-4" />
                </NBButton>
                <NBButton
                  variant="primary"
                  onClick={() => onViewJobDetails(job.id)}
                  className="bg-cyan-500 text-white hover:bg-cyan-600 text-sm px-3 py-1"
                >
                  View Details
                </NBButton>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience Level Filter */}
      <div className="mt-6 pt-4 border-t border-cyan-200">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <NBButton
              variant="ghost"
              className="text-cyan-600 hover:bg-cyan-100 text-sm"
            >
              Entry Level
            </NBButton>
            <NBButton
              variant="ghost"
              className="text-cyan-600 hover:bg-cyan-100 text-sm"
            >
              Mid Level
            </NBButton>
            <NBButton
              variant="ghost"
              className="text-cyan-600 hover:bg-cyan-100 text-sm"
            >
              Senior Level
            </NBButton>
            <NBButton
              variant="ghost"
              className="text-cyan-600 hover:bg-cyan-100 text-sm"
            >
              Internships
            </NBButton>
          </div>
          <NBButton
            variant="ghost"
            onClick={onViewAllJobs}
            className="text-cyan-600 hover:bg-cyan-100 text-sm"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Browse All
          </NBButton>
        </div>
      </div>
    </NBCard>
  );
};