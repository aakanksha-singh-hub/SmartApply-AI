import React from 'react';
import { NBCard } from './NBCard';
import { CareerRecommendation } from '../lib/types';

interface SummaryPanelProps {
  recommendation: CareerRecommendation;
  userName: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({ 
  recommendation, 
  userName 
}) => {
  return (
    <div className="space-y-6">
      <NBCard variant="accent">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Hello, {userName}! 👋
        </h2>
        <p className="text-gray-700 leading-relaxed">
          {recommendation.summary}
        </p>
      </NBCard>

      <NBCard>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Your Career Path: {recommendation.primaryCareer}
        </h3>
        <div className="space-y-3">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Related Roles:</h4>
            <div className="flex flex-wrap gap-2">
              {recommendation.relatedRoles.map((role, index) => (
                <span
                  key={index}
                  className="bg-primary/20 text-gray-900 px-3 py-1 rounded-full text-sm font-medium border border-primary/30"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </NBCard>

    </div>
  );
};
